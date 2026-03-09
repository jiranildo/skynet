import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupplierAnalyticsDashboard, SupplierDashboardData } from '@/services/db/supplier';
import { getSupplierExperiences } from '@/services/db/experiences';
import { Experience } from '@/services/db/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

type TimeFilter = 30 | 90 | 365;

export default function SupplierStats() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SupplierDashboardData | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>(30);

    const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f43f5e'];

    useEffect(() => {
        async function loadStats() {
            if (user?.id) {
                setLoading(true);
                const [analyticsData, experiencesData] = await Promise.all([
                    getSupplierAnalyticsDashboard(user.id, timeFilter),
                    getSupplierExperiences(user.id)
                ]);
                setStats(analyticsData);
                setExperiences(experiencesData);
                setLoading(false);
            }
        }
        loadStats();
    }, [user, timeFilter]);

    const kpis = [
        { label: 'Serviços Cadastrados', value: stats?.totalServices || '0', icon: 'ri-suitcase-line', color: 'bg-blue-50 text-blue-600' },
        { label: 'Serviços Vendidos', value: stats?.servicesSold || '0', icon: 'ri-shopping-bag-3-line', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Serviços Utilizados', value: stats?.servicesUtilized || '0', icon: 'ri-checkbox-circle-line', color: 'bg-purple-50 text-purple-600' },
        { label: 'Receita Gerada', value: `R$ ${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`, icon: 'ri-wallet-3-line', color: 'bg-orange-50 text-orange-600' },
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

            {/* Main Charts Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <i className="ri-line-chart-line text-emerald-500"></i>
                        Vendas Acumuladas
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.supplierGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area yAxisId="left" type="monotone" dataKey="sales" name="Volume (Vendas)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area yAxisId="right" type="monotone" dataKey="revenue" name="Receita" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <i className="ri-pie-chart-2-line text-pink-500"></i>
                        Vendidos x Utilizados
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

            {/* Service Performance Table/List */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <i className="ri-bar-chart-box-line text-emerald-500"></i>
                        Desempenho por Serviço
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                <th className="pb-4 px-4">Serviço</th>
                                <th className="pb-4 px-4">Vendas (Qtde)</th>
                                <th className="pb-4 px-4">Receita (Valor)</th>
                                <th className="pb-4 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {experiences.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">
                                        Nenhum serviço encontrado.
                                    </td>
                                </tr>
                            ) : (
                                experiences.map((exp) => {
                                    const isExpired = exp.validity_end_date ? new Date(exp.validity_end_date) < new Date(new Date().setHours(0, 0, 0, 0)) : false;
                                    return (
                                        <tr key={exp.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {exp.cover_image ? (
                                                            <img src={exp.cover_image} alt={exp.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <i className="ri-image-line"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-gray-900 truncate max-w-[200px]">{exp.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm">
                                                    {exp.sales_count || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-black text-gray-900">
                                                    R$ {((exp.total_revenue || 0) / 1000).toFixed(2)}k
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {isExpired ? (
                                                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                                                        Expirado
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                                                        Ativo
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Top Rated Services */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <i className="ri-medal-fill text-yellow-500"></i>
                            Serviços Mais Bem Avaliados
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {!stats?.topServices || stats.topServices.length === 0 ? (
                            <div className="text-center py-8">
                                <i className="ri-star-smile-line text-4xl text-gray-200 mb-2 block"></i>
                                <p className="text-gray-400 font-medium">Nenhuma avaliação recebida ainda.</p>
                            </div>
                        ) : (
                            stats.topServices.map((service, i) => (
                                <div key={i} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 font-bold text-yellow-600">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className="text-sm font-bold text-gray-900 truncate">{service.name}</p>
                                        <p className="text-xs text-gray-500">{service.reviews} avaliações</p>
                                    </div>
                                    <div className="flex items-center gap-1 font-black text-gray-900">
                                        <i className="ri-star-fill text-yellow-500 text-sm"></i>
                                        {service.rating}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Services by Location */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <i className="ri-map-pin-line text-blue-500"></i>
                        Serviços por Localidade
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.servicesByLocation || []} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} width={80} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name="Serviços" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {(stats?.servicesByLocation || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
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
