import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

interface WineLifecycleChartProps {
    vintage: number;
    bestDrinkingWindow?: string;
    agingPotential?: string;
}

const WineLifecycleChart: React.FC<WineLifecycleChartProps> = ({ vintage, bestDrinkingWindow, agingPotential }) => {
    const currentYear = new Date().getFullYear();

    // Parse best drinking window (e.g., "2024 - 2030")
    let startPeak = 0;
    let endPeak = 0;

    if (bestDrinkingWindow) {
        const years = bestDrinkingWindow.match(/\d{4}/g);
        if (years && years.length >= 2) {
            startPeak = parseInt(years[0]);
            endPeak = parseInt(years[1]);
        }
    }

    // Fallback if no window is provided
    if (!startPeak || !endPeak) {
        let yearsToAdd = 5;
        if (agingPotential) {
            const match = agingPotential.match(/\d+/);
            if (match) yearsToAdd = parseInt(match[0]);
        }
        startPeak = vintage + Math.floor(yearsToAdd * 0.3);
        endPeak = vintage + yearsToAdd;
    }

    // Generate a smooth curve data
    const startYear = vintage || (currentYear - 5);
    const totalSpan = Math.max(endPeak - startYear + 10, 20);
    const endYear = startYear + totalSpan;

    const data = [];
    for (let year = startYear; year <= endYear; year++) {
        let quality = 0;

        if (year < startPeak) {
            // Youthful phase - rising quality
            quality = 20 + (year - startYear) * (80 / (startPeak - startYear));
        } else if (year >= startPeak && year <= endPeak) {
            // Peak phase
            quality = 95 + (Math.sin((year - startPeak) / (endPeak - startPeak) * Math.PI) * 5);
        } else {
            // Declining phase
            const yearsPostPeak = year - endPeak;
            quality = 95 * Math.exp(-yearsPostPeak / 15);
        }

        data.push({
            year,
            quality: Math.max(10, Math.min(100, quality)),
            isCurrent: year === currentYear
        });
    }

    return (
        <div className="w-full h-48 bg-white/50 rounded-2xl p-4 border border-gray-100 mt-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900">Ciclo de Vida do Vinho</h4>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Melhor Momento
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Hoje
                    </span>
                </div>
            </div>

            <div className="h-32 -mx-4 -mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="year"
                            hide
                        />
                        <YAxis hide domain={[0, 110]} />

                        {/* Highlight Peak Window */}
                        <ReferenceArea
                            x1={startPeak}
                            x2={endPeak}
                            fill="url(#colorPeak)"
                            strokeOpacity={0.3}
                        />

                        {/* Current Year Line */}
                        <ReferenceLine
                            x={currentYear}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            label={{
                                position: 'top',
                                value: 'HOJE',
                                fill: '#3b82f6',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="quality"
                            stroke="#9333ea"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorQuality)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between mt-1 px-1">
                <div className="text-[10px] font-semibold text-gray-400">Jovem</div>
                <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {startPeak} - {endPeak}
                </div>
                <div className="text-[10px] font-semibold text-gray-400">Guarda</div>
            </div>
        </div>
    );
};

export default WineLifecycleChart;
