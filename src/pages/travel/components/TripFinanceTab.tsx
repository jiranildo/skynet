import { useState, useMemo } from 'react';
import type { Trip, TripExpense } from '../../../services/db/types';
import { updateTrip } from '../../../services/db/trips';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface TripFinanceTabProps {
    trip: Trip;
    itinerary: any;
    onUpdate: (updatedTrip: Trip) => void;
    isAdmin: boolean;
}

// Expand categories to match itinerary options + general ones
const CATEGORY_COLORS: Record<string, string> = {
    Transporte: '#3B82F6', // blue
    Hospedagem: '#8B5CF6', // purple
    Alimentação: '#F59E0B', // yellow
    Passeios: '#10B981', // green
    Seguro: '#EF4444', // red
    Voo: '#06B6D4', // cyan
    Carro: '#F97316', // orange
    Restaurante: '#F43F5E', // rose
    Ingresso: '#14B8A6', // teal
    Serviço: '#6366F1', // indigo
    Atividade: '#84CC16', // lime
    Outros: '#6B7280', // gray
};

const CATEGORY_ICONS: Record<string, string> = {
    Transporte: 'ri-taxi-line',
    Hospedagem: 'ri-hotel-line',
    Alimentação: 'ri-restaurant-2-line',
    Passeios: 'ri-camera-lens-line',
    Seguro: 'ri-shield-check-line',
    Voo: 'ri-plane-line',
    Carro: 'ri-car-line',
    Restaurante: 'ri-restaurant-line',
    Ingresso: 'ri-ticket-line',
    Serviço: 'ri-group-line',
    Atividade: 'ri-camera-line',
    Outros: 'ri-wallet-3-line',
};

// Map Itinerary Types to our Categories
const TYPE_TO_CATEGORY: Record<string, string> = {
    flight: 'Voo',
    accommodation: 'Hospedagem',
    car: 'Carro',
    restaurant: 'Restaurante',
    transport: 'Transporte',
    ticket: 'Ingresso',
    service: 'Serviço',
    activity: 'Atividade'
};

export default function TripFinanceTab({ trip, itinerary, onUpdate, isAdmin }: TripFinanceTabProps) {
    const [expenses, setExpenses] = useState<TripExpense[]>(trip.expenses || []);
    const [isAdding, setIsAdding] = useState(false);

    // New Expense Form State
    const [newExpense, setNewExpense] = useState<Partial<TripExpense>>({
        category: 'Outros',
        title: '',
        amount: 0,
        date: trip.start_date
    });

    // Calculate AI Itinerary Costs
    const aiCosts = useMemo(() => {
        let total = 0;
        const items: Array<{ title: string, amount: number, day: string, category: string }> = [];

        // Safety check just in case itinerary is malformed
        if (!itinerary || typeof itinerary !== 'object') return { total, items };

        Object.entries(itinerary).forEach(([dayKey, activities]) => {
            if (Array.isArray(activities)) {
                activities.forEach(act => {
                    if (act.price && typeof act.price === 'string') {
                        // Extract numbers from strings like "R$ 150" or "150.00"
                        const match = act.price.match(/[\d,.]+/);
                        if (match) {
                            const val = parseFloat(match[0].replace(',', '.'));
                            if (!isNaN(val) && val > 0) {
                                total += val;
                                items.push({
                                    title: act.title,
                                    amount: val,
                                    day: dayKey === '-1' ? 'Pré-Viagem' : dayKey === '999' ? 'Pós-Viagem' : `Dia ${parseInt(dayKey) + 1}`,
                                    category: TYPE_TO_CATEGORY[act.type] || 'Atividade'
                                });
                            }
                        }
                    }
                });
            }
        });
        return { total, items };
    }, [itinerary]);

    const totalManual = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpent = totalManual + aiCosts.total;

    // Convert old categorical budget (1,2,3) to a realistic estimate
    const getEstimatedBudget = (val?: number | string) => {
        if (!val) return 5000;
        const v = String(val);
        if (v === '1' || v === 'low' || v === 'budget') return 3000;
        if (v === '2' || v === 'medium' || v === 'standard') return 8000;
        if (v === '3' || v === 'high' || v === 'luxury') return 15000;
        return typeof val === 'number' && val > 3 ? val : 5000;
    };

    const budget = getEstimatedBudget(trip.budget);
    const progressPercentage = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 100;

    // Chart Data (Pie)
    const chartData = useMemo(() => {
        const dataMap: Record<string, number> = {};

        // Add Manual Expenses
        expenses.forEach(exp => {
            dataMap[exp.category] = (dataMap[exp.category] || 0) + exp.amount;
        });

        // Add AI Itinerary Cost individually
        aiCosts.items.forEach(item => {
            const cat = item.category || 'Passeios';
            dataMap[cat] = (dataMap[cat] || 0) + item.amount;
        });

        return Object.entries(dataMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    }, [expenses, aiCosts]);

    // Timeline Data (LineChart)
    const timelineData = useMemo(() => {
        const daysMap: Record<string, { forecast: number; realized: number }> = {};

        // Setup initial days from itinerary keys
        if (itinerary && typeof itinerary === 'object') {
            Object.keys(itinerary).forEach(k => {
                const dayLabel = k === '-1' ? 'Pré' : k === '999' ? 'Pós' : `Dia ${parseInt(k) + 1}`;
                daysMap[dayLabel] = { forecast: 0, realized: 0 };
            });
        }

        // If empty, fallback to simple ones
        if (Object.keys(daysMap).length === 0) {
            daysMap['Geral'] = { forecast: 0, realized: 0 };
        }

        // Add AI costs (usually Forecast, but considered realized for planning if already booked)
        aiCosts.items.forEach(item => {
            const d = item.day.replace('-Viagem', '');
            if (!daysMap[d]) daysMap[d] = { forecast: 0, realized: 0 };
            // AI costs act as forecast
            daysMap[d].forecast += item.amount;
            daysMap[d].realized += item.amount; // AI plan acts as default realization unless overridden
        });

        // Add manual expenses (Realized)
        expenses.forEach(exp => {
            // Try to map by date, if not just put on 'Geral' or first day
            const d = 'Geral';
            if (!daysMap[d]) daysMap[d] = { forecast: 0, realized: 0 };
            daysMap[d].realized += exp.amount;
        });

        // Convert to array and calculate cumulative
        let cumulativeForecast = 0;
        let cumulativeRealized = 0;

        // Define a daily budget target for straight line
        const daysCount = Math.max(1, Object.keys(daysMap).length);
        const dailyBudget = budget / daysCount;
        let cumulativeBudget = 0;

        // Ensure chronological order
        const sortedDays = Object.keys(daysMap).sort((a, b) => {
            if (a === 'Pré') return -1;
            if (b === 'Pré') return 1;
            if (a === 'Pós') return 1;
            if (b === 'Pós') return -1;
            if (a === 'Geral') return -1;
            if (b === 'Geral') return 1;
            // Parse "Dia 1", "Dia 2"
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        return sortedDays.map((name) => {
            const data = daysMap[name];
            cumulativeForecast += data.forecast;
            cumulativeRealized += data.realized;
            cumulativeBudget += dailyBudget;
            return {
                name,
                'Orçamento Linear': Math.round(cumulativeBudget),
                'Previsto (Roteiro)': Math.round(cumulativeForecast),
                'Realizado (Com Gastos Manuais)': Math.round(cumulativeRealized)
            };
        });

    }, [expenses, aiCosts, itinerary, budget]);

    const handleSaveExpense = async () => {
        if (!newExpense.title || !newExpense.amount) {
            alert('Preencha o título e o valor.');
            return;
        }

        const expenseItem: TripExpense = {
            id: crypto.randomUUID(),
            category: newExpense.category as any,
            title: newExpense.title,
            amount: Number(newExpense.amount),
            date: newExpense.date
        };

        const updatedExpenses = [...expenses, expenseItem];

        try {
            await updateTrip(trip.id, { expenses: updatedExpenses });
            setExpenses(updatedExpenses);
            onUpdate({ ...trip, expenses: updatedExpenses });
            setIsAdding(false);
            setNewExpense({ category: 'Outros', title: '', amount: 0, date: trip.start_date });
        } catch (err) {
            console.error('Erro ao salvar despesa', err);
            alert('Falha ao salvar despesa.');
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Deseja remover este gasto?')) return;
        const updatedExpenses = expenses.filter(e => e.id !== id);
        try {
            await updateTrip(trip.id, { expenses: updatedExpenses });
            setExpenses(updatedExpenses);
            onUpdate({ ...trip, expenses: updatedExpenses });
        } catch (err) {
            console.error('Erro ao remover', err);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <i className="ri-wallet-3-line text-xl"></i>
                        <h3 className="font-semibold text-sm">Orçamento Previsto</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        R$ {budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 text-purple-600 mb-2">
                        <i className="ri-funds-box-line text-xl"></i>
                        <h3 className="font-semibold text-sm">Gasto Total</h3>
                    </div>
                    <div className={`text-3xl font-bold ${totalSpent > budget && budget > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Progress Mini-Bar */}
                    <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${progressPercentage > 90 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <div className="flex items-center gap-3">
                            <i className="ri-vip-diamond-line text-xl text-indigo-500"></i>
                            <h3 className="font-semibold text-sm">Reservado para o App</h3>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-indigo-600">
                        {aiCosts.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-gray-500">BRL</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Custos extraídos do itinerário gerado</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Details & Lists */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Manual Expenses Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <i className="ri-list-check text-blue-500"></i>
                                Despesas Adicionais
                            </h3>
                            {isAdmin && (
                                <button
                                    onClick={() => setIsAdding(!isAdding)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    {isAdding ? 'Cancelar' : '+ Adicionar'}
                                </button>
                            )}
                        </div>

                        {/* Add Expense Form */}
                        {isAdding && (
                            <div className="p-5 bg-blue-50/50 border-b border-gray-100 grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Título</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Passagem Rio-SP"
                                            value={newExpense.title}
                                            onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Valor (R$)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={newExpense.amount || ''}
                                            onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
                                        <select
                                            value={newExpense.category}
                                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {Object.keys(CATEGORY_COLORS).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Data (Opcional)</label>
                                        <input
                                            type="date"
                                            value={newExpense.date || ''}
                                            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveExpense}
                                        className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition"
                                    >
                                        Salvar Gasto
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Expenses List */}
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {expenses.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    Nenhuma despesa manual adicionada.
                                </div>
                            ) : (
                                expenses.map(expense => (
                                    <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm"
                                                style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                                            >
                                                <i className={CATEGORY_ICONS[expense.category] || 'ri-wallet-3-line'}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                                                <span className="text-xs text-gray-500">{expense.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900">
                                                R$ {expense.amount.toFixed(2)}
                                            </span>
                                            {isAdmin && (
                                                <button onClick={() => handleDeleteExpense(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* AI Itinerary Extracted Costs */}
                    {aiCosts.items.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100/50 overflow-hidden">
                            <div className="p-4 border-b border-indigo-100 flex items-center gap-2">
                                <i className="ri-robot-2-line text-indigo-600 text-xl"></i>
                                <h3 className="font-bold text-indigo-900">Gastos Extraídos do Roteiro (IA)</h3>
                            </div>
                            <div className="divide-y divide-indigo-100 max-h-60 overflow-y-auto">
                                {aiCosts.items.map((item, idx) => (
                                    <div key={idx} className="p-3 px-5 flex items-center justify-between text-sm">
                                        <div className="text-indigo-900/80">
                                            <span className="font-semibold text-indigo-900 mr-2">{item.day}:</span>
                                            <span className="inline-flex items-center gap-1 opacity-70 mr-2 text-xs bg-indigo-100 px-1.5 py-0.5 rounded">
                                                <i className={CATEGORY_ICONS[item.category] || 'ri-map-pin-line'}></i>
                                                {item.category}
                                            </span>
                                            {item.title}
                                        </div>
                                        <div className="font-semibold text-indigo-700">
                                            R$ {item.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Charts */}
                <div className="space-y-6">
                    {/* Donut Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <i className="ri-pie-chart-2-line text-purple-500"></i>
                            Distribuição de Custos
                        </h3>

                        <div className="w-full h-[250px] relative flex items-center justify-center">
                            {chartData.length === 0 ? (
                                <div className="text-center text-gray-400">
                                    <i className="ri-bar-chart-2-line text-4xl mb-2 opacity-50"></i>
                                    <p className="text-sm">Sem dados para exibir.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ccc'} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Timeline Line Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <i className="ri-line-chart-line text-blue-500"></i>
                            Evolução do Orçamento
                        </h3>

                        <div className="w-full h-[250px] relative flex items-center justify-center">
                            {timelineData.length <= 1 ? (
                                <div className="text-center text-gray-400">
                                    <i className="ri-calendar-event-line text-4xl mb-2 opacity-50"></i>
                                    <p className="text-sm cursor-default">Disponível em roteiros multi-dias.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={timelineData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                                        />
                                        <Legend iconType="plainline" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Line type="monotone" dataKey="Orçamento Linear" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                        <Line type="monotone" dataKey="Previsto (Roteiro)" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} />
                                        <Line type="monotone" dataKey="Realizado (Com Gastos Manuais)" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#F43F5E', strokeWidth: 0 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
