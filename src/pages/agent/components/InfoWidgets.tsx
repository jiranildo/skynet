import { useState, useEffect } from 'react';

export default function InfoWidgets() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeInZone = (offset: number) => {
        const date = new Date(time.getTime() + (time.getTimezoneOffset() * 60000) + (offset * 3600000));
        return date.toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const clocks = [
        { city: 'Brasília', offset: -3, icon: 'ri-map-pin-user-line' },
        { city: 'Londres', offset: 0, icon: 'ri-map-pin-2-line' },
        { city: 'Paris', offset: 1, icon: 'ri-map-pin-2-line' },
        { city: 'Nova York', offset: -5, icon: 'ri-map-pin-2-line' },
        { city: 'Pequim', offset: 8, icon: 'ri-map-pin-2-line' },
    ];

    const currencies = [
        { code: 'USD', name: 'Dólar', value: '5,26', icon: 'ri-coins-line', color: 'text-blue-600' },
        { code: 'EUR', name: 'Euro', value: '6,11', icon: 'ri-money-euro-box-line', color: 'text-purple-600' },
        { code: 'GBP', name: 'Libra', value: '7,03', icon: 'ri-money-pound-box-line', color: 'text-green-600' },
        { code: 'JPY', name: 'Iene', value: '0,033', icon: 'ri-money-cny-box-fill', color: 'text-red-600' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
            {/* Clocks Section */}
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-2 px-4 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-r border-gray-100 pr-3 mr-1 whitespace-nowrap">
                    Horários
                </span>
                <div className="flex items-center gap-4">
                    {clocks.map((clock) => (
                        <div key={clock.city} className="flex flex-col items-center min-w-fit">
                            <span className="text-[10px] font-bold text-gray-400 leading-none mb-1">{clock.city}</span>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                <i className={`${clock.icon} text-[10px] text-orange-500`}></i>
                                <span className="text-xs font-black text-gray-900 tabular-nums">
                                    {getTimeInZone(clock.offset)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Currencies Section */}
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-2 px-4 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-r border-gray-100 pr-3 mr-1 whitespace-nowrap">
                    Câmbio
                </span>
                <div className="flex items-center gap-4">
                    {currencies.map((coin) => (
                        <div key={coin.code} className="flex flex-col items-center min-w-fit">
                            <span className="text-[10px] font-bold text-gray-400 leading-none mb-1">{coin.code}</span>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                <i className={`${coin.icon} text-[10px] ${coin.color}`}></i>
                                <span className="text-xs font-black text-gray-900 tabular-nums">
                                    R$ {coin.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
