import React, { useMemo } from 'react';

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

    const data = useMemo(() => {
        const generatedData = [];
        for (let year = startYear; year <= endYear; year++) {
            let quality = 0;

            if (year < startPeak) {
                // Youthful phase - rising quality
                quality = 20 + (year - startYear) * (80 / (Math.max(1, startPeak - startYear)));
            } else if (year >= startPeak && year <= endPeak) {
                // Peak phase
                quality = 95 + (Math.sin((year - startPeak) / (Math.max(1, endPeak - startPeak)) * Math.PI) * 5);
            } else {
                // Declining phase
                const yearsPostPeak = year - endPeak;
                quality = 95 * Math.exp(-yearsPostPeak / 15);
            }

            generatedData.push({
                year,
                quality: Math.max(10, Math.min(100, quality)),
                isCurrent: year === currentYear
            });
        }
        return generatedData;
    }, [startYear, endYear, startPeak, endPeak, currentYear]);

    // SVG scaling helpers
    const getX = (year: number) => {
        const range = endYear - startYear;
        // Padding of 2% on each side
        return 2 + ((year - startYear) / Math.max(1, range)) * 96;
    };
    const getY = (quality: number) => {
        // Range 0-110, Y is inverted (0 is top)
        return 100 - (quality / 110) * 100;
    };

    const pathD = useMemo(() => {
        if (data.length === 0) return '';
        return data.map((point, i) => {
            const x = getX(point.year);
            const y = getY(point.quality);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    }, [data, startYear, endYear]);

    const areaPath = useMemo(() => {
        if (!pathD || data.length === 0) return '';
        const firstX = getX(data[0].year);
        const lastX = getX(data[data.length - 1].year);
        return `${pathD} L ${lastX} 105 L ${firstX} 105 Z`;
    }, [pathD, data]);

    const peakXStart = typeof startPeak === 'number' ? getX(startPeak) : 0;
    const peakXEnd = typeof endPeak === 'number' ? getX(endPeak) : 0;
    const peakWidth = Math.max(0, peakXEnd - peakXStart);
    const currentX = getX(currentYear);

    return (
        <div className="w-full h-48 bg-white/50 rounded-2xl p-4 border border-gray-100 mt-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900">Ciclo de Vida do Vinho</h4>
                <div className="flex flex-col items-end gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Janela Ideal
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Ano Atual
                    </span>
                </div>
            </div>

            <div className="flex-1 relative -mx-4 overflow-visible pl-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9333ea" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#9333ea" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>

                    {/* Peak Window Background */}
                    {startPeak > 0 && endPeak > 0 && peakWidth > 0 && (
                        <rect
                            x={peakXStart}
                            y="0"
                            width={peakWidth}
                            height="100"
                            fill="#fbbf24"
                            fillOpacity="0.15"
                        />
                    )}

                    {/* Current Year Line */}
                    {currentX >= 0 && currentX <= 100 && (
                        <g>
                            <line
                                x1={currentX}
                                y1="-5"
                                x2={currentX}
                                y2="100"
                                stroke="#3b82f6"
                                strokeWidth="0.5"
                                strokeDasharray="1,1"
                            />
                            <text
                                x={currentX}
                                y="-8"
                                fill="#3b82f6"
                                fontSize="4"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                HOJE
                            </text>
                        </g>
                    )}

                    {/* Quality Area */}
                    <path d={areaPath} fill="url(#qualityGradient)" />
                    {/* Quality Line */}
                    <path d={pathD} fill="none" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="flex justify-between mt-2 px-1 relative z-10 bg-white/50 backdrop-blur-sm mx-2 py-1 rounded-md">
                <div className="text-[10px] font-semibold text-gray-500">Jovem</div>
                <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {startPeak} - {endPeak}
                </div>
                <div className="text-[10px] font-semibold text-gray-500">Guarda</div>
            </div>
        </div>
    );
};

export default WineLifecycleChart;
