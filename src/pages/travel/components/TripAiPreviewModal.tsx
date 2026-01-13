import React, { useState, useEffect } from 'react';
import { RecommendationCard, Recommendation } from './RecommendationCard';

// Reusing Activity interface for simplicity, although ideally should be imported
interface Activity {
    id: string;
    title: string;
    description: string;
    time?: string;
    endTime?: string;
    location?: string;
    status: 'pending' | 'confirmed' | 'not_reserved';
    type: string;
    icon?: string;
    notes?: string;
    coordinates?: { lat: number; lng: number };
    price?: string;
    metadata?: any;
}

interface TripAiPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    generatedData: { [dayIndex: number]: Activity[] };
    onConfirm: (selectedData: { [dayIndex: number]: Activity[] }) => void;
    dayLabelFunction: (index: number) => string;
    onLoadMore: (dayIndex: number) => Promise<void>;
    isLoadingMore?: boolean;
    onMoveActivity: (activityId: string, fromDayIndex: number, toDayIndex: number) => void;
    viewMode?: 'tabs' | 'list';
}

export default function TripAiPreviewModal({ isOpen, onClose, generatedData, onConfirm, dayLabelFunction, onLoadMore, isLoadingMore, onMoveActivity, viewMode = 'tabs' }: TripAiPreviewModalProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<number | null>(null);
    const [openMoveMenuId, setOpenMoveMenuId] = useState<string | null>(null);

    const dayIndices = Object.keys(generatedData).map(Number).sort((a, b) => a - b);

    // Initialize selection and active tab
    useEffect(() => {
        if (isOpen) {
            const allIds = new Set<string>();
            Object.values(generatedData).flat().forEach(act => allIds.add(act.id));
            setSelectedIds(allIds);

            if (dayIndices.length > 0 && activeTab === null) {
                setActiveTab(dayIndices[0]);
            }
        }
    }, [isOpen]); // Depend only on isOpen to avoid resetting tab on data update

    // separate effect to ensure active tab is valid if data changes
    useEffect(() => {
        if (isOpen && dayIndices.length > 0 && (activeTab === null || !dayIndices.includes(activeTab))) {
            setActiveTab(dayIndices[0]);
        }
    }, [dayIndices, isOpen, activeTab]);


    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleConfirm = () => {
        const finalSelection: { [dayIndex: number]: Activity[] } = {};

        Object.keys(generatedData).forEach(key => {
            const dayIndex = Number(key);
            const originalActivities = generatedData[dayIndex];
            const filtered = originalActivities.filter(act => selectedIds.has(act.id));
            if (filtered.length > 0) {
                finalSelection[dayIndex] = filtered;
            }
        });

        onConfirm(finalSelection);
        onClose();
    };

    const totalItems = Object.values(generatedData).flat().length;
    const selectedCount = selectedIds.size;

    const getSelectedCountForDay = (dayIndex: number) => {
        return generatedData[dayIndex]?.filter(a => selectedIds.has(a.id)).length || 0;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 animate-fadeIn backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="ri-magic-line text-purple-600"></i>
                            Sugestões da IA
                        </h3>
                        <p className="text-sm text-gray-500">
                            Selecione as melhores opções para o seu roteiro.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Tabs (Only in Tabs Mode) */}
                {viewMode === 'tabs' && dayIndices.length > 0 && (
                    <div className="flex overflow-x-auto border-b border-gray-100 px-6 pt-2 bg-white shrink-0 scrollbar-hide">
                        {dayIndices.map(dayIndex => (
                            <button
                                key={dayIndex}
                                onClick={() => setActiveTab(dayIndex)}
                                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === dayIndex
                                    ? 'border-purple-600 text-purple-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                    }`}
                            >
                                {dayLabelFunction(dayIndex)}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === dayIndex ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {getSelectedCountForDay(dayIndex)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {/* List Mode: Show all items flattened but labeled */}
                    {viewMode === 'list' && (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {Object.entries(generatedData).flatMap(([dayIdxStr, activities]) =>
                                activities.map(activity => ({ ...activity, dayIndex: Number(dayIdxStr) }))
                            ).map((activity) => {
                                // Map Activity + Metadata to Recommendation
                                const recData: Recommendation = {
                                    icon: activity.icon || 'ri-map-pin-line',
                                    name: activity.title,
                                    description: activity.description,
                                    reason: activity.metadata?.reason || activity.notes || '',
                                    bestTime: activity.metadata?.bestTime || activity.time || '',
                                    estimatedCost: activity.metadata?.estimatedCost || activity.price || '',
                                    duration: activity.metadata?.duration || activity.endTime || '',
                                    tags: activity.metadata?.tags || [activity.type],
                                    highlights: activity.metadata?.highlights || []
                                };

                                return (
                                    <div key={activity.id} className="relative group">
                                        {/* Day Label Badge */}
                                        <div className="absolute -top-3 left-4 z-10 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                            {dayLabelFunction(activity.dayIndex)}
                                        </div>

                                        <RecommendationCard
                                            data={recData}
                                            onSelect={() => toggleSelection(activity.id)}
                                            onView={() => { }} // Could open details
                                            onSave={() => { }} // Already in "Select" flow
                                        />

                                        {/* Overlay Checkmark if selected */}
                                        {selectedIds.has(activity.id) && (
                                            <div className="absolute inset-0 bg-purple-600/10 border-2 border-purple-600 rounded-3xl pointer-events-none flex items-center justify-center">
                                                <div className="bg-purple-600 text-white p-2 rounded-full shadow-lg scale-110">
                                                    <i className="ri-check-line text-xl font-bold"></i>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mover Integration */}
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setOpenMoveMenuId(openMoveMenuId === activity.id ? null : activity.id)}
                                                    className="bg-white/90 backdrop-blur text-xs font-medium text-gray-600 hover:text-purple-600 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1 transition-colors"
                                                    title="Mover para outro dia"
                                                >
                                                    <i className="ri-calendar-event-line"></i>
                                                    Mover
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openMoveMenuId === activity.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            Mover para...
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {dayIndices.filter(d => d !== activity.dayIndex).map(targetDayIndex => (
                                                                <button
                                                                    key={targetDayIndex}
                                                                    onClick={() => {
                                                                        onMoveActivity(activity.id, activity.dayIndex, targetDayIndex);
                                                                        setOpenMoveMenuId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                                                                >
                                                                    <i className="ri-calendar-line text-gray-400"></i>
                                                                    {dayLabelFunction(targetDayIndex)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(generatedData).length === 0 && (
                                <div className="text-center text-gray-400 py-10">
                                    Nenhuma sugestão encontrada.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tabs Mode */}
                    {viewMode === 'tabs' && (activeTab !== null && generatedData[activeTab] ? (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            <div className="grid gap-3">
                                {generatedData[activeTab].map(activity => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        selectedIds={selectedIds}
                                        toggleSelection={toggleSelection}
                                        onMove={(targetDay) => onMoveActivity(activity.id, activeTab, targetDay)}
                                        dayIndices={dayIndices}
                                        dayLabelFunction={dayLabelFunction}
                                        currentDayIndex={activeTab}
                                        openMoveMenuId={openMoveMenuId}
                                        setOpenMoveMenuId={setOpenMoveMenuId}
                                    />
                                ))}
                            </div>

                            {/* Load More Button - Only relevant for tabs/specific day requests usually */}
                            <div className="pt-4 flex justify-center">
                                <button
                                    onClick={() => onLoadMore(activeTab)}
                                    disabled={isLoadingMore}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-purple-200 text-purple-700 font-medium hover:bg-purple-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingMore ? (
                                        <><i className="ri-loader-4-line animate-spin"></i> Gerando mais opções...</>
                                    ) : (
                                        <><i className="ri-add-circle-line text-xl"></i> Carregar mais opções para este dia</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        activeTab === null && <div className="flex items-center justify-center h-full text-gray-400">Selecione um dia para ver as sugestões</div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        <span className="font-bold text-purple-600">{selectedIds.size}</span> itens selecionados
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.size === 0}
                            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            <i className="ri-check-double-line"></i>
                            Adicionar ao Roteiro
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Extracted Activity Card for Reuse
function ActivityCard({ activity, selectedIds, toggleSelection, onMove, dayIndices, dayLabelFunction, currentDayIndex, openMoveMenuId, setOpenMoveMenuId, isListView, dayLabel }: any) {
    return (
        <div
            onClick={() => toggleSelection(activity.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md bg-white ${selectedIds.has(activity.id)
                ? 'border-purple-500 bg-purple-50/20'
                : 'border-gray-100 hover:border-purple-200'
                }`}
        >
            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${selectedIds.has(activity.id)
                ? 'bg-purple-600 border-purple-600'
                : 'border-gray-300 bg-white'
                }`}>
                {selectedIds.has(activity.id) && <i className="ri-check-line text-white text-sm font-bold"></i>}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h5 className="font-bold text-gray-800 text-lg leading-tight">{activity.title}</h5>
                        {/* Day Label in List View */}
                        {isListView && dayLabel && (
                            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                {dayLabel}
                            </span>
                        )}
                    </div>
                    {activity.time && (
                        <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded shrink-0">
                            {activity.time}
                        </span>
                    )}
                </div>
                <p className="text-gray-600 mt-1 line-clamp-2">{activity.description}</p>

                {/* AI Agent Reasoning */}
                {activity.notes && (
                    <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-100 flex items-start gap-1.5">
                        <i className="ri-lightbulb-flash-line mt-0.5"></i>
                        <span>{activity.notes}</span>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium ${selectedIds.has(activity.id) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <i className={activity.icon || 'ri-map-pin-line'}></i>
                        {activity.type}
                    </span>
                    {activity.price && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded-md">
                            <i className="ri-money-dollar-circle-line text-green-600"></i> {activity.price}
                        </span>
                    )}

                    {/* Date Selector Dropdown Trigger */}
                    <div className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setOpenMoveMenuId(openMoveMenuId === activity.id ? null : activity.id)}
                            className="text-xs font-medium text-gray-500 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1 transition-colors"
                            title="Mover para outro dia"
                        >
                            <i className="ri-calendar-event-line"></i>
                            Mover
                        </button>

                        {/* Dropdown Menu */}
                        {openMoveMenuId === activity.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Mover para...
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {dayIndices.filter((d: number) => d !== currentDayIndex).map((targetDayIndex: number) => (
                                        <button
                                            key={targetDayIndex}
                                            onClick={() => {
                                                onMove(targetDayIndex);
                                                setOpenMoveMenuId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                                        >
                                            <i className="ri-calendar-line text-gray-400"></i>
                                            {dayLabelFunction(targetDayIndex)}
                                        </button>
                                    ))}
                                    {dayIndices.length <= 1 && (
                                        <div className="px-4 py-2 text-xs text-gray-400 text-center">
                                            Sem outros dias disponíveis
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
