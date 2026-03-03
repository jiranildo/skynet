import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAgentAnalyticsDashboard, AgentDashboardData, getManagedTrips, calculateTripTotalSpent } from '@/services/db/agent';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

type TimeFilter = 30 | 90 | 365;

export default function AgentStats() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AgentDashboardData | null>(null);
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>(30);

    const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f43f5e'];

    useEffect(() => {
        async function loadStats() {
            if (user?.id) {
                setLoading(true);
                const data = await getAgentAnalyticsDashboard(user.id, timeFilter);
                setStats(data);

                // Calculate budget vs spent locally using trips data
                const trips = await getManagedTrips(user.id);

                const now = new Date();
                const isYear = timeFilter === 365;
                const spine = [];

                if (isYear) {
                    for (let i = 11; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        spine.push({
                            yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                            name: d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                            dayBudget: 0,
                            daySpent: 0
                        });
                    }
                } else {
                    for (let i = timeFilter - 1; i >= 0; i--) {
                        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                        spine.push({
                            date: d.toISOString().split('T')[0],
                            name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                            dayBudget: 0,
                            daySpent: 0
                        });
                    }
                }

                let runningBudget = 0;
                let runningSpent = 0;

                const getBudget = (t: any) => {
                    let b = 5000;
                    if (t.budget) {
                        const bStr = String(t.budget);
                        if (bStr === '1' || bStr === 'low' || bStr === 'budget') b = 3000;
                        else if (bStr === '2' || bStr === 'medium' || bStr === 'standard') b = 8000;
                        else if (bStr === '3' || bStr === 'high' || bStr === 'luxury') b = 15000;
                        else b = typeof t.budget === 'number' && t.budget > 3 ? t.budget : 5000;
                    }
                    return b;
                };

                let windowStart = new Date(0).getTime();
                if (isYear) {
                    const firstDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
                    windowStart = firstDate.getTime();
                } else {
                    const firstDate = new Date(now.getTime() - (timeFilter - 1) * 24 * 60 * 60 * 1000);
                    firstDate.setHours(0, 0, 0, 0);
                    windowStart = firstDate.getTime();
                }

                trips.forEach(trip => {
                    const tripTime = new Date(trip.created_at).getTime();
                    const b = getBudget(trip);
                    const s = calculateTripTotalSpent(trip);

                    if (tripTime < windowStart) {
                        runningBudget += b;
                        runningSpent += s;
                    } else {
                        const tripDateObj = new Date(trip.created_at);
                        if (isYear) {
                            const ym = `${tripDateObj.getFullYear()}-${String(tripDateObj.getMonth() + 1).padStart(2, '0')}`;
                            const idx = spine.findIndex((x: any) => x.yearMonth === ym);
                            if (idx !== -1) {
                                spine[idx].dayBudget += b;
                                spine[idx].daySpent += s;
                            }
                        } else {
                            const dStr = tripDateObj.toISOString().split('T')[0];
                            const idx = spine.findIndex((x: any) => x.date === dStr);
                            if (idx !== -1) {
                                spine[idx].dayBudget += b;
                                spine[idx].daySpent += s;
                            }
                        }
                    }
                });

                const finalBudgetData = spine.map(s => {
                    runningBudget += s.dayBudget;
                    runningSpent += s.daySpent;
                    return {
                        name: s.name,
                        orcamento: runningBudget,
                        realizado: runningSpent
                    };
                });

                setBudgetData(finalBudgetData);
                setLoading(false);
            }
        }
        loadStats();
    }, [user, timeFilter]);

    const kpis = [
        { label: 'Viagens Gerenciadas', value: stats?.totalTrips || '0', icon: 'ri-flight-takeoff-line', color: 'bg-blue-50 text-blue-600' },
        { label: 'Viajantes Suportados', value: stats?.totalTravelers || '0', icon: 'ri-group-line', color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Ganhos TM (Receita)', value: `${(stats?.totalEarnings || 0).toLocaleString('pt-BR')}`, icon: 'ri-copper-coin-line', color: 'bg-orange-50 text-orange-600' },
        { label: 'Avaliação Média', value: '4.9', icon: 'ri-star-fill', color: 'bg-yellow-50 text-yellow-600' },
    ];

    if (loading && !stats) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-32"></div>
                    ))}
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 h-96"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {kpis.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                    >
                        <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <i className={`${stat.icon} text-2xl`}></i>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Time Filter Controls */}
            <div className="flex justify-end gap-2">
                {[30, 90, 365].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setTimeFilter(filter as TimeFilter)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === filter
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        {filter === 365 ? '1 Ano' : `${filter} Dias`}
                    </button>
                ))}
            </div>

            {/* Budget Line Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <i className="ri-funds-line text-emerald-500"></i>
                    Orçamento Estimado vs Realizado (Gasto)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={budgetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Line type="monotone" dataKey="orcamento" name="Orçamento (Total)" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="realizado" name="Realizado (Total)" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <i className="ri-line-chart-line text-purple-500"></i>
                        Crescimento do Portfólio
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.agentGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area yAxisId="left" type="monotone" dataKey="trips" name="Viagens" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
                                <Area yAxisId="right" type="monotone" dataKey="earnings" name="Ganhos (TM)" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <i className="ri-pie-chart-2-line text-pink-500"></i>
                        Status das Viagens
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(stats?.statusDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <i className="ri-history-line text-orange-500"></i>
                        Atividades Recentes
                    </h3>
                </div>
                <div className="space-y-6">
                    {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                        <div className="text-center py-8">
                            <i className="ri-inbox-line text-4xl text-gray-200 mb-2 block"></i>
                            <p className="text-gray-400 font-medium">Nenhuma atividade recente encontrada.</p>
                        </div>
                    ) : (
                        stats.recentActivity.map((activity, i) => (
                            <div key={i} className="flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center shrink-0`}>
                                    <i className={`${activity.icon} text-lg`}></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.details}</p>
                                </div>
                                <div className="ml-auto text-xs text-gray-400 font-medium">
                                    {new Date(activity.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
