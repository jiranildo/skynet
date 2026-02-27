export default function ManagedTrips() {
    const trips = [
        { id: 1, title: 'Paris Luxo', user: 'Vanessa Matos', date: '15 Mai - 22 Mai', status: 'Confirmada', profit: 'TM 1.200' },
        { id: 2, title: 'Toscana Wine Tour', user: 'Roberto Silva', date: '01 Jun - 10 Jun', status: 'Em Planejamento', profit: 'TM 800' },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 font-black">Viagens do Portfólio</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">Total: {trips.length}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Viagem</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Viajante</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Datas</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Comissão</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {trips.map((trip) => (
                                <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5 font-bold text-gray-900">{trip.title}</td>
                                    <td className="px-6 py-5 text-gray-600 font-medium">{trip.user}</td>
                                    <td className="px-6 py-5 text-gray-500 text-sm">{trip.date}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trip.status === 'Confirmada' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-xs text-indigo-600">{trip.profit}</td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md">
                                            <i className="ri-edit-line text-gray-400 group-hover:text-indigo-600"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
