import { useState, useEffect } from 'react';

interface CurrencyRate {
    bid: string;
    pctChange: string;
    name: string;
}

export default function InfoWidgets() {
    const [time, setTime] = useState(new Date());
    const [rates, setRates] = useState<Record<string, CurrencyRate>>({});
    const [loadingRates, setLoadingRates] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        const fetchRates = async () => {
            try {
                const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,JPY-BRL');
                const data = await res.json();
                // AwesomeAPI returns keys like USDBRL, EURBRL, etc.
                const formattedRates: Record<string, CurrencyRate> = {
                    USD: data.USDBRL,
                    EUR: data.EURBRL,
                    GBP: data.GBPBRL,
                    JPY: data.JPYBRL,
                };
                setRates(formattedRates);
                setLoadingRates(false);
            } catch (err) {
                console.warn('Failed to fetch exchange rates:', err);
                setLoadingRates(false);
            }
        };

        fetchRates();
        const ratesTimer = setInterval(fetchRates, 60000 * 5); // Every 5 mins

        return () => {
            clearInterval(timer);
            clearInterval(ratesTimer);
        };
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
        { code: 'USD', icon: 'ri-coins-line', color: 'text-blue-600' },
        { code: 'EUR', icon: 'ri-money-euro-box-line', color: 'text-purple-600' },
        { code: 'GBP', icon: 'ri-money-pound-box-line', color: 'text-green-600' },
        { code: 'JPY', icon: 'ri-money-cny-box-fill', color: 'text-red-600' },
    ];

    return (
        <div className="flex flex-row items-center gap-4 w-fit min-w-full">
            {/* Clocks Section */}
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-2 px-4 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-r border-gray-100 pr-3 mr-1 whitespace-nowrap">
                    Horários
                </span>
                <div className="flex items-center gap-4">
                    {clocks.map((clock) => (
                        <div key={clock.city} className="flex flex-col items-center min-w-fit">
                            <span className="text-[10px] font-bold text-gray-400 leading-none mb-1">{clock.city}</span>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100">
                                <i className={`${clock.icon} text-sm text-orange-500`}></i>
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
                    {currencies.map((coin) => {
                        const rate = rates[coin.code];
                        const isUp = rate ? parseFloat(rate.pctChange) >= 0 : true;

                        return (
                            <div key={coin.code} className="flex flex-col items-center min-w-fit">
                                <span className="text-[10px] font-bold text-gray-400 leading-none mb-1">{coin.code}</span>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100">
                                    <i className={`${coin.icon} text-sm ${coin.color}`}></i>
                                    <span className="text-xs font-black text-gray-900 tabular-nums">
                                        {loadingRates ? '...' : `R$ ${parseFloat(rate?.bid || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}
                                    </span>
                                    {!loadingRates && rate && (
                                        <i className={`ri-arrow-${isUp ? 'up' : 'down'}-s-fill text-xl ${isUp ? 'text-green-500' : 'text-red-500'}`}></i>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
