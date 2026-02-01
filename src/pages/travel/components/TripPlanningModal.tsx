import { useState, useRef, useMemo, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { updateTrip, Trip, getUserDocuments, getUserTravelProfile, getUserHealthInfo, UserDocument, UserTravelProfile, UserHealthInfo, supabase } from '../../../services/supabase';
import { useDestinationInfo } from '../../../hooks/useDestinationInfo';
import { useAuth } from '@/context/AuthContext';
import TripPreferencesModal from './TripPreferencesModal';
import TripAiPreviewModal from './TripAiPreviewModal';
import AiResearchStartModal from './AiResearchStartModal';
import AiResearchResultsModal from './AiResearchResultsModal';
import { Recommendation } from './RecommendationCard';

interface Activity {
  id: string;
  title: string;
  description: string;
  time?: string;
  endTime?: string;
  location?: string;
  status: 'pending' | 'confirmed' | 'not_reserved';
  type: 'accommodation' | 'transport' | 'activity' | 'restaurant' | 'document' | 'reservation' | 'flight' | 'car' | 'ticket' | 'service' | 'checklist' | 'stats' | 'social' | 'map_summary';
  icon?: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
  price?: string;
  metadata?: any; // To store rich data from AI Research
}

interface DayPlan {
  day: number;
  date: string;
  fullDate: string; // e.g. "quinta-feira, 06 de nov"
  activities: Activity[];
}

interface TripPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onTripUpdated?: (trip: Trip) => void;
}

// Special indices for Pre and Post trip
const PRE_TRIP_INDEX = -1;
const POST_TRIP_INDEX = 999;

// Helper to parse "YYYY-MM-DD" as local date to avoid timezone shifts
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const datePart = dateStr.split('T')[0]; // Handle potentially full ISO strings
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function TripPlanningModal({ isOpen, onClose, trip, onTripUpdated }: TripPlanningModalProps) {
  const { user } = useAuth();
  const isAdmin = trip.permissions === 'admin';

  // Calcular número de dias da viagem (Moved to top for scope access)
  const startDate = parseLocalDate(trip.start_date);
  const endDate = parseLocalDate(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Gerar dias da viagem
  const tripDays: DayPlan[] = Array.from({ length: totalDays }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return {
      day: index + 1,
      date: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
      fullDate: currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
      activities: []
    };
  });

  const [activeDayIndex, setActiveDayIndex] = useState(0); // 0 to N are days, -1 is Pre, 999 is Post
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Activity Form State
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'activity',
    status: 'confirmed'
  });

  // AI Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ [key: number]: Activity[] }>({});

  // Itinerary State (initialized from Supabase data)
  const [itinerary, setItinerary] = useState<{ [key: number]: Activity[] }>(trip.itinerary || {});

  // Sync state with prop changes and handle JSON string keys
  useEffect(() => {
    if (trip.itinerary) {
      console.log('TripPlanningModal: Received itinerary from prop:', trip.itinerary);
      // Ensure keys are numbers for internal logic
      const normalizedItinerary: { [key: number]: Activity[] } = {};
      Object.keys(trip.itinerary).forEach(key => {
        const numericKey = Number(key);
        if (!isNaN(numericKey)) {
          normalizedItinerary[numericKey] = trip.itinerary[key];
        }
      });

      // DEEP EQUALITY CHECK to prevent infinite loop
      if (JSON.stringify(normalizedItinerary) !== JSON.stringify(itinerary)) {
        console.log('TripPlanningModal: Syncing itinerary from prop (CHANGED)', normalizedItinerary);
        console.log('TripPlanningModal: Syncing itinerary from prop (CHANGED)', normalizedItinerary);
        setItinerary(normalizedItinerary);

        // Smart Default Day: If current active day is empty, switch to first day with content
        const hasCurrentContent = (normalizedItinerary[activeDayIndex] || []).length > 0;
        if (!hasCurrentContent) {
          const firstDayWithContent = Object.keys(normalizedItinerary)
            .map(Number)
            .sort((a, b) => a - b)
            .find(k => (normalizedItinerary[k] || []).length > 0);

          if (firstDayWithContent !== undefined) {
            console.log('Auto-switching to day with content:', firstDayWithContent);
            setActiveDayIndex(firstDayWithContent);
          }
        }
      } else {
        console.log('TripPlanningModal: Prop matches state, skipping sync.');
      }
    }
  }, [trip.itinerary]);

  // Real Destination Info
  const destinationInfo = useDestinationInfo(trip.destination);

  // AI Generation State
  // AI Generation State
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [isPerformingResearch, setIsPerformingResearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [previewViewMode, setPreviewViewMode] = useState<'tabs' | 'list'>('tabs');

  const [isResearchResultsOpen, setIsResearchResultsOpen] = useState(false);
  const [researchResults, setResearchResults] = useState<any[]>([]); // Using any for Recommendation + wrapper
  const [lastSearchQuery, setLastSearchQuery] = useState<string | undefined>(undefined);
  const [lastSearchCategories, setLastSearchCategories] = useState<string[] | undefined>(undefined);


  /* 
   * NEW AI GENERATION: Direct Save Mode (No Preview)
   * Enforces strict logistics and user preferences.
   */
  const handleGenerateDayItinerary = async () => {
    // 1. Validation
    if (!import.meta.env.VITE_GOOGLE_API_KEY) {
      alert('Erro de configuração: VITE_GOOGLE_API_KEY não encontrada.');
      return;
    }
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    // 2. Setup State
    setIsGeneratingItinerary(true);

    try {
      // 3. Prepare AI Model
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // 4. Determine Scope
      const daysToGenerate = isSelectionMode && selectedIndices.size > 0
        ? Array.from(selectedIndices).sort((a, b) => a - b)
        : [activeDayIndex];

      // 5. Build Context from Preferences (Personalizar IA)
      let prefsContext = "";
      const preferences = trip.metadata?.preferences;
      if (preferences) {
        const { vibe, pace, dining, dislikes, other, travelingWithKids, kidsDetails } = preferences;
        prefsContext = `
            PERFIL DO VIAJANTE (Respeite Rigorosamente):
            - Vibe: ${vibe?.join(', ') || 'Não especificado'}
            - Ritmo: ${pace || 'Moderado'}
            - Acompanhantes: ${travelingWithKids ? `Crianças presentes (${kidsDetails})` : 'Sem crianças'}
            - Alimentação: ${dining?.cuisines?.join(', ')} (Nível: ${dining?.priceLevel})
            - O QUE EVITAR: ${dislikes?.join(', ')}
            - OBSERVAÇÕES: ${other}
        `;
      }

      // 5.1 Build Existing Itinerary Context (To avoid duplicates)
      const existingItems = Object.values(itinerary).flat().map(item => item.title).join(", ");
      const existingContext = existingItems ? `
          JÁ AGENDADO (NÃO REPETIR ESTES LOCAIS):
          ${existingItems}
      ` : "";

      const dayLabels = daysToGenerate.map(idx => {
        if (idx === PRE_TRIP_INDEX) return { idx, label: 'Pré-Viagem (Checklists)' };
        if (idx === POST_TRIP_INDEX) return { idx, label: 'Pós-Viagem' };
        return { idx, label: `Dia ${idx + 1} (${tripDays[idx]?.fullDate || 'Data'})` };
      });

      // 6. Build Prompts
      const systemInstruction = `
          ATUE COMO: Um ESCPECIALISTA LOCAL nativo de ${trip.destination}. Você conhece os segredos, os melhores horários e a logística da cidade como ninguém.
          
          OBJETIVO: Gerar um roteiro profissional, lógico e imersivo para os dias solicitados.
          
          REGRAS DE LOGÍSTICA (IMPORTANTE):
          - NÃO sugira atividades que colidam com itens já agendados.
          - Se for múltiplos dias, crie uma narrativa coesa (ex: "Dia Cultural" seguido de "Dia de Natureza").
          - Para 'Dia 1': Incluir "Chegada/Transfer" e "Check-in" se não houver.
          - Para 'Último Dia': Incluir "Check-out" e preparação para partida.
          
          REGRAS DE QUALIDADE:
          - NÃO repita locais listados em "JÁ AGENDADO".
          - Otimize a rota: Agrupe atrações vizinhas.
          - Considere o tempo de deslocamento real na cidade.
          
          ${prefsContext}

          ${existingContext}

          IDS DOS DIAS PARA PREENCHER:
          ${dayLabels.map(d => `${d.idx} (${d.label})`).join(', ')}
      `;

      const userPrompt = `
          Gere a lista detalhada de atividades para estes dias.
          
          FORMATO JSON ESTRITO (Array):
          [
            {
                "title": "Nome Curto e Claro",
                "description": "Por que ir? (Dica de especialista)",
                "time": "HH:MM",
                "type": "activity" | "restaurant" | "transport" | "accommodation",
                "price": "R$ Estimado",
                "suggestedDayId": number (Obrigatório: ID do dia correspondente),
                "notes": "Dica logística (ex: 'Melhor ir de metrô')"
            }
          ]
      `;

      // 7. Execute AI
      const result = await model.generateContent(systemInstruction + "\n" + userPrompt);
      const text = await result.response.text();

      // 8. Parse JSON
      const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = match ? match[1] : text.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*?$/, ']');
      const items: any[] = JSON.parse(jsonStr);

      // 9. Process & Save
      // Immutable Copy: Avoid mutating state references
      const nextState = { ...itinerary };
      let addedCount = 0;
      const suggestionsToAdd: any[] = [];

      items.forEach(item => {
        const dIdx = typeof item.suggestedDayId === 'number' ? item.suggestedDayId : activeDayIndex;
        // Copy array to modify
        const currentDayActivities = nextState[dIdx] ? [...nextState[dIdx]] : [];

        // Check Duplicates
        const isDupe = currentDayActivities.some(a => a.title.toLowerCase() === item.title.toLowerCase());

        if (!isDupe) {
          const newActivityData = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: item.title,
            description: item.description,
            time: item.time,
            type: item.type || 'activity',
            status: 'confirmed' as const, // Auto-confirm for owner, pending if suggestion?
            price: item.price,
            notes: item.notes,
            icon: activityTypes.find(t => t.id === item.type)?.icon || 'ri-map-pin-line'
          };

          if (isAdmin) {
            currentDayActivities.push(newActivityData);
            nextState[dIdx] = currentDayActivities;
          } else {
            suggestionsToAdd.push({
              type: 'add_place',
              description: `Sugerido pela IA: ${item.title}`,
              data: { ...newActivityData, suggestedDayId: dIdx }
            });
          }
          addedCount++;
        }
      });

      if (isAdmin) {
        // Sort chronological
        Object.keys(nextState).forEach(k => {
          const key = Number(k);
          if (nextState[key]) {
            nextState[key].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          }
        });

        console.log("Saving generated itinerary to Supabase...", nextState);

        // Update Local State
        setItinerary(nextState);

        // Update Database & Sync
        const updatedTrip = await updateTrip(trip.id, { itinerary: nextState });

        if (onTripUpdated) {
          onTripUpdated(updatedTrip);
        }

        alert(` ✨ Roteiro Gerado e Salvo com Sucesso! \n\n${addedCount} atividades foram adicionadas ao seu planejamento.`);
      } else {
        // Handle Suggestions for Collaborators
        if (suggestionsToAdd.length > 0) {
          const newSuggestions = suggestionsToAdd.map(s => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            tripId: trip.id,
            userId: user?.id || 'unknown',
            userName: user?.user_metadata?.full_name || user?.email || 'Collaborator',
            userAvatar: user?.user_metadata?.avatar_url || '',
            type: s.type as any,
            description: s.description,
            data: s.data,
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            comments: []
          }));

          const updatedMetadata = {
            ...trip.metadata,
            pendingSuggestions: [...(trip.metadata?.pendingSuggestions || []), ...newSuggestions]
          };

          const updatedTrip = await updateTrip(trip.id, { metadata: updatedMetadata });

          if (onTripUpdated) {
            onTripUpdated(updatedTrip);
          }

          alert(` ✨ Sugestões de Ajuste Enviadas! \n\n${addedCount} novas sugestões foram enviadas para aprovação do proprietário.`);
        }
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Erro ao gerar roteiro. Tente novamente.");
    } finally {
      setIsGeneratingItinerary(false);
      // Exit selection mode so user sees the result
      setIsSelectionMode(false);
      setSelectedIndices(new Set());
    }
  };




  const openResearchModal = () => {
    setIsResearchResultsOpen(true);
  };

  /* 
   * Execute AI Research for Recommendations
   * Supports 'Deep Search' and 'Pagination' (Load More)
   */
  const executeAiResearch = async (customQuery?: string, categories?: string[], append: boolean = false) => {
    if (!import.meta.env.VITE_GOOGLE_API_KEY) return;

    // Manage Loading State properly
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsPerformingResearch(true);
      // Logic for new search: Save context
      setLastSearchQuery(customQuery);
      setLastSearchCategories(categories);
    }

    // Use current args OR fallback to state for "Load More"
    const effectiveQuery = append ? lastSearchQuery : customQuery;
    const effectiveCategories = append ? lastSearchCategories : categories;

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Gather ALL Regular Days indices
      const allDayIndices = tripDays.map((_, i) => i);

      // Use the Expert Generation Logic
      let prefsContext = "";
      const preferences = trip.metadata?.preferences;
      if (preferences) {
        // ... (keep existing prefs logic, just rebuilding function sig)
        const { vibe, pace, travelingWithKids, kidsDetails, accommodation, dining, dislikes, other } = preferences;
        prefsContext = `
            PERFIL & PREFERÊNCIAS (CRUCIAL):
            - Vibe: ${vibe?.join(', ')}
            - Ritmo: ${pace}
            - Grupo: ${travelingWithKids ? `COM CRIANÇAS (${kidsDetails})` : 'Sem crianças'}
            - Gastronomia: ${dining?.cuisines?.join(', ')} (${dining?.priceLevel})
            - EVITAR: ${dislikes?.join(', ')}
            - Outros: ${other}
            `;
      }

      // Append Categories Context - STRICT ENFORCEMENT
      if (effectiveCategories && effectiveCategories.length > 0) {
        const categoryLabels: { [key: string]: string } = {
          'tours': 'Passeios e Atrações Turísticas',
          'accommodation': 'Hospedagem e Hotéis',
          'transport': 'Locomoção e Transporte',
          'food': 'Restaurantes e Alimentação',
          'shopping': 'Compras'
        };
        const selectedLabels = effectiveCategories.map(c => categoryLabels[c] || c).join(', ');

        prefsContext += `\n\n!!! FILTRO RIGOROSO ATIVO !!!\nO usuário FILTROU a pesquisa para ver APENAS: ${selectedLabels}.\n- NÃO mostre resultados que não se encaixem nessas categorias exatas.\n- Dê prioridade total a ${selectedLabels}.\n- Se "Alimentação" foi selecionado, liste restaurantes compatíveis com o perfil.\n- Se "Passeios" foi selecionado, liste atrações.\n- Respeite rigorosamente o input do usuário: "${effectiveQuery || ''}" dentro dessas categorias.`;
      }

      // Check for Existing Hotel in Itinerary
      let hotelContext = "";
      const confirmedHotel = Object.values(itinerary)
        .flat()
        .find(act => act.type === 'accommodation' && (act.status === 'confirmed' || act.status === 'pending'));

      if (confirmedHotel) {
        hotelContext = `\nHOSPEDAGEM CONFIRMADA: O usuário ficará no "${confirmedHotel.title}" (${confirmedHotel.location || 'Localização não especificada'}).\nIMPORTANTE: Para cada atividade sugerida, calcule a distância estimada e tempo de deslocamento a partir deste hotel.`;
      }

      // Append Custom Query if provided
      if (effectiveQuery) {
        prefsContext += `\n\nPEDIDO ESPECIAL DO USUÁRIO: "${effectiveQuery}"\n(Dê prioridade máxima a este pedido nos resultados).`;
      }

      // Build Exclusion List (Anti-Duplication)
      let exclusionList = "";
      if (append && researchResults.length > 0) {
        const distinctNames = researchResults.map(r => r.name).join(', ');
        exclusionList = `\n\n!!! EXCLUSÃO DE DUPLICATAS !!!\nEstes itens JÁ FORAM APRESENTADOS. NÃO OS REPITA: [${distinctNames}].\nEncontre opções NOVAS e DIFERENTES.`;
      }

      const dayLabels = allDayIndices.map(idx => ({ idx, label: `Dia ${idx + 1} (${tripDays[idx]?.fullDate || 'Data'})` }));

      const systemInstruction = `
         ATUE COMO: "SARA" - Agente de Viagens Especialista em Pesquisa Global.
         VOCÊ CONHECE TUDO SOBRE: ${trip.destination}.
         
         ESTAÇÃO/CLIMA: Considere a data da viagem (${trip.start_date} a ${trip.end_date}). 
         Use seu conhecimento sobre o clima real dessa época em ${trip.destination} para filtrar atividades (Ex: Se for inverno, foque em locais fechados ou neve; se verão, praias e ar livre).

         TAREFA: "PESQUISA COMPLETA DA VIAGEM".
         Não apenas preencha dias. Encontre as MELHORES experiências possíveis compatíveis com a data, clima, e perfil do usuário.
         
         REGRAS DE LOGÍSTICA OBRIGATÓRIAS (PRIMEIRO E ÚLTIMO DIA):
         - Dia 1 (Chegada): OBRIGATÓRIO incluir sugestão de TRANSFER/TRANSPORTE do aeroporto para o hotel/centro. Sugerir CHECK-IN no hotel.
         - Último Dia (Saída): OBRIGATÓRIO incluir sugestão de CHECK-OUT e TRANSFER para o aeroporto/rodoviária.
         - Transporte Geral: Sugerir qual o melhor meio de locomoção para a viagem (Aluguel de carro, Uber, Metrô?) logo no primeiro dia.

         SUGIRA O MELHOR DIA E SEQUÊNCIA:
         Para cada atividade, você deve definir o "suggestedDayId" (índice 0 a N) que faz mais sentido logisticamente ou tematicamente.
         
         ${prefsContext}
         ${hotelContext}
         ${exclusionList}
      `;

      const userPrompt = `
         Contexto: O usuário quer uma "Pesquisa Profunda" para montar a viagem perfeita.
         Queremos saber TUDO que o destino tem a oferecer de melhor nessa época.
         
         Retorne EXATAMENTE 5 (CINCO) NOVAS sugestões.
         (Processamento em lotes para performance rápida).
         
         ATENÇÃO PARA DIVERSIDADE: Quero um mix equilibrado de:
         1. MUST-SEE: Pontos turísticos clássicos obrigatórios.
         2. HIDDEN GEMS: Segredos locais que poucos turistas conhecem (Lado B).
         3. GASTRONOMIA: Restaurantes ou comidas de rua imperdíveis.
         4. CULTURA/EXPERIÊNCIA: Algo único do local (show, workshop, feira).

         Se já houverem muitos itens de um tipo, varie para outro.
         
         Para cada item, defina qual seria o "Melhor Dia" para fazê-lo (suggestedDayId), considerando a sequência lógica e balanceamento da viagem.
         Indique no "reasonForDay" por que aquela data foi escolhida.

         CAMPOS ESPECÍFICOS (METADATA):
         Se o item for de uma categoria especial (Voo, Cruzeiro, Show, etc.), adicione o campo "metadata" com detalhes técnicos:
         - Voo: [{"label": "Cia", "value": "..."}, {"label": "Voo", "value": "..."}]
         - Cruzeiro: [{"label": "Navio", "value": "..."}, {"label": "Rota", "value": "..."}]
         - Show/Evento: [{"label": "Local", "value": "..."}, {"label": "Data", "value": "..."}]

         DIAS DISPONÍVEIS:
         ${dayLabels.map(d => `- ID ${d.idx}: ${d.label}`).join('\n')}

         FORMATO JSON ESTRITO (Array):
         [
           {
             "icon": "ri-...",
             "name": "Nome da Atividade",
             "description": "Descrição envolvente (2-3 linhas)",
             "reason": "Por que o usuário vai amar isso baseado no perfil?",
             "bestTime": "Melhor hora (ex: Manhã, Pôr do sol)",
             "estimatedCost": "Preço estimado (R$ / USD)",
             "duration": "Duração estimada (ex: 3h)",
             "visitDuration": "Tempo EXATO estimado. PROIBIDO 'Variável'. Use rangos: '3-4 dias', '2 horas'.",
             "bestVisitTime": "Melhor mês/época específica (Ex: 'Maio a Setembro'). PROIBIDO vazio.",
             "reservationStatus": "'required' | 'recommended' | 'not_needed' | 'unknown'",
             "michelin": "Se restaurante: '3 Estrelas Michelin', 'Bib Gourmand' (ou null)",
             "tripAdvisorRating": "Se hotel: Nota 0-5 (ex: 4.5)",
             "bookingRating": "Se hotel: Nota 0-10 (ex: 9.3)",
             "tags": ["Tipo 1", "Tipo 2"],
             "highlights": ["Destaque 1", "Destaque 2"],
             "suggestedDayId": number,
             "address": "Endereço completo da atração",
             "howToGetThere": "Breve instrução de como chegar (transporte público/táxi)",
             "distanceFromHotel": "Tempo/Distância do hotel do usuário (Se houver hotel informado, senão null)",
             "metadata": [{"label": "Label", "value": "Value"}]
           }
         ]
      `;

      const result = await model.generateContent(systemInstruction + "\n" + userPrompt);
      const text = await result.response.text();

      const extractJson = (t: string) => {
        const match = t.match(/```json\s*([\s\S]*?)\s*```/) || t.match(/```\s*([\s\S]*?)\s*```/);
        return match ? match[1] : t.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*?$/, ']');
      };

      const activitiesData = JSON.parse(extractJson(text));

      if (Array.isArray(activitiesData)) {
        // Map to Recommendation format for the Research Modal
        const mappedResults = activitiesData.map((item: any) => ({
          icon: item.icon || 'ri-map-pin-line',
          name: item.name,
          description: item.description,
          reason: item.reason,
          bestTime: item.bestTime,
          estimatedCost: item.estimatedCost,
          duration: item.duration,
          visitDuration: item.visitDuration,
          bestVisitTime: item.bestVisitTime || item.bestTime, // Fallback if AI uses bestTime
          reservationStatus: item.reservationStatus,
          tags: item.tags || [],
          highlights: item.highlights || [],
          suggestedDayId: item.suggestedDayId,
          address: item.address,
          howToGetThere: item.howToGetThere,
          distanceFromHotel: item.distanceFromHotel,
          michelin: item.michelin,
          tripAdvisorRating: item.tripAdvisorRating,
          bookingRating: item.bookingRating,
          metadata: item.metadata || []
        }));

        if (append) {
          setResearchResults(prev => [...prev, ...mappedResults]);
        } else {
          setResearchResults(mappedResults);
          setIsResearchResultsOpen(true);
        }
      }
    } catch (error) {
      console.error("Erro na Pesquisa AI:", error);
      alert("Não foi possível completar a pesquisa. Tente novamente.");
    } finally {
      setIsPerformingResearch(false);
      setIsLoadingMore(false);
    }
  };

  const handleAddResearchItem = (rec: Recommendation, targetDayIndex: number) => {
    const newActivity: Activity = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      title: rec.name,
      description: rec.description,
      time: rec.bestTime,
      endTime: rec.duration,
      location: trip.destination,
      status: 'not_reserved',
      type: 'activity',
      icon: rec.icon,
      price: rec.estimatedCost,
      notes: rec.reason,
      metadata: {
        highlights: rec.highlights,
        tags: rec.tags,
        reason: rec.reason
      }
    };

    setItinerary(prev => {
      const currentDay = prev[targetDayIndex] || [];
      return {
        ...prev,
        [targetDayIndex]: [...currentDay, newActivity]
      };
    });

    // Optional: could manually trigger save or let effect do it
  };

  const handleLoadMore = async (dayIndex: number) => {
    if (!import.meta.env.VITE_GOOGLE_API_KEY) return;
    setIsLoadingMore(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Identify context
      const isPreTrip = dayIndex === PRE_TRIP_INDEX;
      const isPostTrip = dayIndex === POST_TRIP_INDEX;

      // Existing items from preview AND confirmed itinerary to avoid dupes
      const existingInPreview = previewData[dayIndex] || [];
      const existingInItinerary = itinerary[dayIndex] || [];
      const allExisting = [...existingInPreview, ...existingInItinerary];
      const existingTitles = allExisting.map(a => a.title).join(', ');

      const systemInstruction = `ATUE COMO: "SARA". TAREFA: Expandir roteiro com NOVAS opções.`;

      let userPrompt = `
        Contexto: O usuário já tem as seguintes atividades para este dia:
        ${existingTitles}

        TAREFA: Gere 3 NOVAS opções criativas e alternativas que NÃO estão na lista acima.
        Se for um dia de viagem, considere turnos livres.
        Se for checklist, adicione itens esquecidos.
      `;

      // Specific Prompts based on type
      if (isPreTrip) {
        userPrompt += `
          Foco: Itens EXTRAS de checklist, dicas de bagagem avançadas ou apps úteis.
        `;
      } else if (isPostTrip) {
        userPrompt += `
          Foco: Ideias criativas para eternizar a viagem (album, vlog, etc).
        `;
      } else {
        const dayInfo = tripDays[dayIndex];
        userPrompt += `
           Dia: ${dayInfo.fullDate}. Destino: ${trip.destination}.
           Sugira:
           1. Uma opção de atividade off-the-beaten-path (fora do óbvio).
           2. Uma opção de restaurante/café local autêntico.
           3. Uma atividade relaxante ou noturna.
         `;
      }

      userPrompt += `
          FORMATO JSON ESTRITO (Array):
          [
            {
              "title": "Nome",
              "description": "Descrição",
              "time": "HH:MM",
              "type": "activity",
              "price": "R$...",
              "icon": "ri-star-line"
            }
          ]
      `;

      const result = await model.generateContent(systemInstruction + "\n" + userPrompt);
      const response = await result.response;
      const text = response.text();

      // Simple JSON extraction (reusing logic implicitly or rewriting distinct)
      const extractJson = (t: string) => {
        const match = t.match(/```json\s*([\s\S]*?)\s*```/) || t.match(/```\s*([\s\S]*?)\s*```/);
        return match ? match[1] : t.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*?$/, ']');
      };

      const cleanJson = extractJson(text).trim();
      const newItemsRaw = JSON.parse(cleanJson);

      if (Array.isArray(newItemsRaw)) {
        const newActivities: Activity[] = newItemsRaw.map((item: any) => ({
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          title: item.title,
          description: item.description,
          time: item.time,
          endTime: item.endTime,
          location: item.location,
          status: 'not_reserved',
          type: item.type || 'activity',
          icon: item.icon || 'ri-star-line',
          price: item.price
        }));

        setPreviewData(prev => ({
          ...prev,
          [dayIndex]: [...(prev[dayIndex] || []), ...newActivities] // Append logic
        }));
      }

    } catch (error) {
      console.error("Erro ao carregar mais itens:", error);
      alert("Não foi possível carregar mais itens.");
    } finally {
      setIsLoadingMore(false);
    }
  };


  const handleConfirmPreview = (selectedData: { [dayIndex: number]: Activity[] }) => {
    // Calculate new state synchronously using current 'itinerary'
    const nextState = { ...itinerary };

    Object.keys(selectedData).forEach(key => {
      const dayIndex = Number(key);
      const existing = nextState[dayIndex] || [];
      const toAdd = selectedData[dayIndex];
      // Merge and sort
      const merged = [...existing, ...toAdd].sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
      nextState[dayIndex] = merged;
    });

    // Update local state
    setItinerary(nextState);

    // Force save immediately to ensure persistence
    console.log('Saving AI generated itinerary...', nextState);
    updateTrip(trip.id, { itinerary: nextState })
      .then(res => {
        console.log('AI Itinerary saved:', res);
        if (onTripUpdated) onTripUpdated(res);
        alert('Roteiro gerado e salvo com sucesso!');
      })
      .catch(err => {
        console.error('Failed to save AI itinerary:', err);
        alert('Erro ao salvar o roteiro gerado. Tente novamente.');
      });

    setPreviewData({});
    setIsPreviewOpen(false);

    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedIndices(new Set());
    }
  };

  const toggleDaySelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  // Save to Supabase whenever itinerary changes
  useEffect(() => {
    // Skip if not admin (collaborators should only suggest)
    if (!isAdmin) return;

    // Skip initial mount if empty
    if (Object.keys(itinerary).length === 0 && !trip.itinerary) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      console.log('Saving itinerary for trip:', trip.id, itinerary);
      updateTrip(trip.id, { itinerary })
        .then(res => {
          console.log('Save success:', res);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
          if (onTripUpdated) onTripUpdated(res);
        })
        .catch(err => {
          console.error('Save failed:', err);
          setSaveStatus('error');
        });
    }, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [itinerary, trip.id, isAdmin]);



  const handleClose = async () => {
    // Ensure we save before closing (only for admins)
    if (isAdmin) {
      try {
        const updatedTrip = await updateTrip(trip.id, { itinerary });
        if (onTripUpdated) onTripUpdated(updatedTrip);
      } catch (error) {
        console.error('Error saving on close:', error);
      }
    }
    onClose();
  };

  const handleSavePreferences = async (prefs: any) => {
    const updatedMetadata = {
      ...trip.metadata,
      preferences: prefs
    };

    // Optimistic update (optional, but good for UI responsiveness if we displayed prefs)
    // For now just save to DB
    try {
      await updateTrip(trip.id, { metadata: updatedMetadata });
      trip.metadata = updatedMetadata; // Mutate prop locally for immediate use in generation
      console.log('Preferences saved:', prefs);
      if (onTripUpdated) {
        // fetch fresh trip or just mock the update
        onTripUpdated({ ...trip, metadata: updatedMetadata } as Trip);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Erro ao salvar preferências.');
    }
  };

  if (!isOpen) return null;



  // Format Dates
  const formatDateRange = (start: string, end: string) => {
    const s = parseLocalDate(start);
    const e = parseLocalDate(end);
    return `${s.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${e.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  };

  const activityTypes = [
    { id: 'activity', label: 'Atividade', icon: 'ri-camera-line' },
    { id: 'flight', label: 'Voo', icon: 'ri-plane-line' },
    { id: 'accommodation', label: 'Hotel', icon: 'ri-hotel-line' },
    { id: 'car', label: 'Carro', icon: 'ri-car-line' },
    { id: 'restaurant', label: 'Restaurante', icon: 'ri-restaurant-line' },
    { id: 'transport', label: 'Transporte', icon: 'ri-taxi-line' },
    { id: 'ticket', label: 'Ingresso', icon: 'ri-ticket-line' },
    { id: 'service', label: 'Serviço', icon: 'ri-group-line' }
  ];

  const handleAddActivity = async () => {
    // Basic validation: title required. Time is optional for Pre/Post trip.
    if (!newActivity.title) {
      alert('Preencha pelo menos o título da atividade.');
      return;
    }

    let coordinates = undefined;
    if (newActivity.location) {
      try {
        // Try searching with destination context first
        let query = `${newActivity.location}, ${trip.destination}`;
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        let data = await response.json();

        // Fallback: search just the location if context search fails
        if (!data || data.length === 0) {
          response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newActivity.location)}`);
          data = await response.json();
        }
        if (data && data.length > 0) {
          coordinates = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }

    if (editingActivityId) {
      // Update existing
      setItinerary(prev => ({
        ...prev,
        [activeDayIndex]: prev[activeDayIndex].map(act =>
          act.id === editingActivityId
            ? { ...act, ...newActivity, coordinates: coordinates || act.coordinates }
            : act
        )
      }));
      setEditingActivityId(null);
    } else {
      // Create new
      const activity: Activity = {
        id: Date.now().toString(),
        title: newActivity.title,
        description: newActivity.description || '',
        time: newActivity.time,
        endTime: newActivity.endTime,
        location: newActivity.location || '',
        type: newActivity.type as any,
        status: newActivity.status || 'confirmed',
        icon: activityTypes.find(t => t.id === newActivity.type)?.icon || 'ri-map-pin-line',
        price: newActivity.price,
        notes: newActivity.notes,
        coordinates
      };

      setItinerary(prev => ({
        ...prev,
        [activeDayIndex]: [...(prev[activeDayIndex] || []), activity].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      }));
    }

    setIsAddingActivity(false);
    setNewActivity({ type: 'activity', status: 'confirmed' });
  };

  const handleStartEditing = (activity: Activity) => {
    if (!isAdmin) return;
    setNewActivity({
      title: activity.title,
      description: activity.description,
      time: activity.time,
      endTime: activity.endTime,
      location: activity.location,
      type: activity.type,
      status: activity.status,
      price: activity.price,
      notes: activity.notes
    });
    setEditingActivityId(activity.id);
    setIsAddingActivity(true);
  };


  const updateActivityStatus = (dayIndex: number, activityId: string, newStatus: Activity['status']) => {
    if (!isAdmin) return;
    setItinerary(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].map(act => act.id === activityId ? { ...act, status: newStatus } : act)
    }));
  };

  const deleteActivity = (dayIndex: number, activityId: string, e?: React.MouseEvent) => {
    if (!isAdmin) return;
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!window.confirm("Tem certeza que deseja remover este item?")) return;

    setItinerary(prev => {
      const currentDay = prev[dayIndex] || [];
      const previousLength = currentDay.length;
      const newDay = currentDay.filter(act => String(act.id) !== String(activityId));

      console.log(`Deleting activity ${activityId} from day ${dayIndex}. Prev: ${previousLength}, New: ${newDay.length}`);

      if (previousLength === newDay.length) {
        console.warn('Activity not found in state during delete!');
        return prev;
      }

      const newState = {
        ...prev,
        [dayIndex]: newDay
      };

      // FORCE SAVE IMMEDIATELY (Bypass debounce)
      // This ensures that if the user closes the modal immediately, the change is persisted.
      updateTrip(trip.id, { itinerary: newState })
        .then(res => {
          console.log('Activity deleted and saved successfully:', res);
          if (onTripUpdated) onTripUpdated(res);
        })
        .catch(err => {
          console.error('Failed to save deletion:', err);
          alert('Erro ao salvar exclusão: ' + err.message);
        });

      return newState;
    });
  };

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 200;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-500',
          text: 'text-green-700'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-500',
          text: 'text-yellow-700'
        };
      case 'not_reserved':
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          iconBg: 'bg-gray-200',
          text: 'text-gray-700'
        };
    }
  };

  // Global Progress Logic
  const totalSlots = totalDays + 2; // Days + Pre + Post
  let filledSlots = 0;
  if ((itinerary[PRE_TRIP_INDEX] || []).length > 0) filledSlots++;
  if ((itinerary[POST_TRIP_INDEX] || []).length > 0) filledSlots++;
  for (let i = 0; i < totalDays; i++) {
    if ((itinerary[i] || []).length > 0) filledSlots++;
  }
  const progressPercentage = Math.round((filledSlots / totalSlots) * 100);

  // Map Logic
  const allActivities = Object.values(itinerary).flat();
  const allLocations = allActivities
    .filter(activity => activity.coordinates)
    .map(activity => ({
      lat: activity.coordinates!.lat,
      lng: activity.coordinates!.lng,
      title: activity.title,
    }));

  const createMapEmbedUrl = () => {
    if (allLocations.length === 0) return '';
    const loc = allLocations[0];
    const bbox = `${loc.lng - 0.05},${loc.lat - 0.05},${loc.lng + 0.05},${loc.lat + 0.05}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`;
  };

  const dayActivities = itinerary[activeDayIndex] || [];

  const getDayLabel = (index: number) => {
    if (index === PRE_TRIP_INDEX) return 'Pre-Trip';
    if (index === POST_TRIP_INDEX) return 'Post-Trip';
    return `Dia ${index + 1}`;
  };

  const getFullDatelabel = (index: number) => {
    if (index === PRE_TRIP_INDEX) return 'Preparação da Viagem';
    if (index === POST_TRIP_INDEX) return 'Memórias e Review';
    return tripDays[index].fullDate;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-100 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">

        {/* Cover Image Banner */}
        <div className="h-64 relative shrink-0">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80'}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          <div className="absolute bottom-6 left-8 text-white">
            <h2 className="text-4xl font-bold shadow-sm mb-2">{trip.destination}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                <i className="ri-calendar-line"></i>
                {formatDateRange(trip.start_date, trip.end_date)}
              </span>

              {/* Weather */}
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                {destinationInfo.loading ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : destinationInfo.weather ? (
                  <>
                    <i className={`ri-${destinationInfo.weather.isDay ? 'sun' : 'moon'}-line ${destinationInfo.weather.isDay ? 'text-yellow-300' : 'text-blue-300'}`}></i>
                    {destinationInfo.weather.temp}°C
                    <span className="mx-1 opacity-50">•</span>
                    <i className="ri-drop-line text-blue-300"></i> {destinationInfo.weather.humidity}%
                  </>
                ) : (
                  <span className="text-white/50">--°C</span>
                )}
              </span>

              {/* Time */}
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                <i className="ri-time-line"></i>
                {destinationInfo.timezone?.localTime || '--:--'} ({destinationInfo.timezone?.gmt || 'GMT'})
              </span>

              {/* Save Status Indicator */}
              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all ${saveStatus === 'saving' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' :
                saveStatus === 'saved' ? 'bg-green-500/20 border-green-500/50 text-green-200' :
                  saveStatus === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' :
                    'opacity-0'
                }`}>
                {saveStatus === 'saving' && <><i className="ri-loader-4-line animate-spin"></i> Salvando...</>}
                {saveStatus === 'saved' && <><i className="ri-check-line"></i> Salvo</>}
                {saveStatus === 'error' && <><i className="ri-error-warning-line"></i> Erro ao salvar</>}
              </span>




              {/* Currency */}
              {(destinationInfo.currency && destinationInfo.currency.code !== 'BRL') && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <i className="ri-money-dollar-circle-line text-green-300"></i>
                  {destinationInfo.currency.symbol}1 = R$ {destinationInfo.currency.rateToBRL?.toFixed(2)}
                </span>
              )}

              {/* Power */}
              {destinationInfo.power && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <i className="ri-plug-line text-gray-300"></i>
                  {destinationInfo.power.voltage} • {destinationInfo.power.plugs.join('/')}
                </span>
              )}

              {/* Preferences Button */}



            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Map Integration (Conditionally rendered) */}
          {allLocations.length > 0 && (
            <div className="rounded-2xl overflow-hidden shadow-md h-64 border border-gray-200">
              <iframe
                src={createMapEmbedUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
          )}

          {/* Jornada Card */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="ri-road-map-line text-9xl"></i>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <i className="ri-calendar-event-line"></i>
                    Jornada
                  </h3>
                  <p className="text-sm text-white/80">{formatDateRange(trip.start_date, trip.end_date)}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{progressPercentage}%</div>
                  <div className="text-xs text-white/80">completo</div>
                </div>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-calendar-line text-blue-500"></i>
                Timeline
              </h3>
              <div className="flex gap-2 items-center">
                <button
                  onClick={openResearchModal}
                  disabled={isPerformingResearch}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm rounded-lg hover:shadow-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 h-8"
                >
                  {isPerformingResearch ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span className="hidden sm:inline">Pesquisando...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-compass-3-line"></i>
                      <span className="hidden sm:inline">Pesquisa AI</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsPreferencesOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium h-8"
                  title="Personalizar IA"
                >
                  <i className="ri-equalizer-line text-purple-600"></i>
                  <span className="hidden sm:inline">Personalizar IA</span>
                </button>
                <button onClick={() => scrollTimeline('left')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <button onClick={() => scrollTimeline('right')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end mb-2 px-1">
              {isSelectionMode && (
                <button
                  onClick={() => {
                    const allIndices = new Set<number>();
                    allIndices.add(PRE_TRIP_INDEX);
                    tripDays.forEach((_, i) => allIndices.add(i));
                    allIndices.add(POST_TRIP_INDEX);
                    setSelectedIndices(allIndices);
                  }}
                  className="text-xs font-bold px-3 py-1 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                >
                  <i className="ri-check-double-line"></i>
                  Selecionar Tudo
                </button>
              )}
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIndices(new Set());
                }}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${isSelectionMode ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <i className={`ri-${isSelectionMode ? 'close-circle-line' : 'checkbox-multiple-line'}`}></i>
                {isSelectionMode ? 'Cancelar Seleção' : 'Selecionar Múltiplos Dias'}
              </button>
            </div>

            <div ref={timelineRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {/* Pre-Trip */}
              {/* Pre-Trip */}
              <button
                onClick={() => {
                  if (isSelectionMode) {
                    toggleDaySelection(PRE_TRIP_INDEX);
                  } else {
                    setActiveDayIndex(PRE_TRIP_INDEX);
                  }
                }}
                className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${isSelectionMode && selectedIndices.has(PRE_TRIP_INDEX)
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300 ring-offset-2'
                  : activeDayIndex === PRE_TRIP_INDEX && !isSelectionMode
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-100 hover:border-purple-200'
                  }`}
              >
                {isSelectionMode && (
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center ${selectedIndices.has(PRE_TRIP_INDEX) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                    }`}>
                    {selectedIndices.has(PRE_TRIP_INDEX) && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeDayIndex === PRE_TRIP_INDEX ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="ri-luggage-cart-line text-lg"></i>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${activeDayIndex === PRE_TRIP_INDEX ? 'text-purple-700' : 'text-gray-700'}`}>Pre-Trip</div>
                  <div className="text-xs text-gray-500">Preparação</div>
                </div>
              </button>

              {/* Days */}
              {tripDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleDaySelection(index);
                    } else {
                      setActiveDayIndex(index);
                    }
                  }}
                  className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${isSelectionMode && selectedIndices.has(index)
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300 ring-offset-2'
                    : activeDayIndex === index && !isSelectionMode
                      ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                      : 'border-gray-100 hover:border-gray-300 bg-white'
                    }`}
                >
                  {isSelectionMode && (
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center ${selectedIndices.has(index) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                      }`}>
                      {selectedIndices.has(index) && <i className="ri-check-line text-white text-xs"></i>}
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${activeDayIndex === index && !isSelectionMode ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {day.day}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold leading-tight ${activeDayIndex === index && !isSelectionMode ? 'text-white' : 'text-gray-900'
                      }`}>{day.date}</div>
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-xs ${activeDayIndex === index && !isSelectionMode ? 'text-gray-200' : 'text-gray-500'}`}>
                        {itinerary[index]?.length || 0} itens
                      </span>
                      {itinerary[index]?.length > 0 && (
                        <div className={`w-1.5 h-1.5 rounded-full ${activeDayIndex === index ? 'bg-white' : 'bg-green-500'}`}></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {/* Post-Trip */}
              {/* Post-Trip */}
              <button
                onClick={() => {
                  if (isSelectionMode) {
                    toggleDaySelection(POST_TRIP_INDEX);
                  } else {
                    setActiveDayIndex(POST_TRIP_INDEX);
                  }
                }}
                className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${isSelectionMode && selectedIndices.has(POST_TRIP_INDEX)
                  ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-300 ring-offset-2'
                  : activeDayIndex === POST_TRIP_INDEX && !isSelectionMode
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-100 hover:border-pink-200'
                  }`}
              >
                {isSelectionMode && (
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center ${selectedIndices.has(POST_TRIP_INDEX) ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                    }`}>
                    {selectedIndices.has(POST_TRIP_INDEX) && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeDayIndex === POST_TRIP_INDEX ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="ri-heart-line text-lg"></i>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${activeDayIndex === POST_TRIP_INDEX ? 'text-pink-600' : 'text-gray-700'}`}>Post-Trip</div>
                  <div className="text-xs text-gray-500">Memórias</div>
                </div>
              </button>
            </div>
          </div>

          {/* Suggestion Mode Banner */}
          {!isAdmin && (
            <div className="mx-6 mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-blue-700">
              <i className="ri-information-line text-xl"></i>
              <div className="text-sm">
                <span className="font-bold">Modo de Sugestão Ativado:</span> Como colaborador, você pode sugerir alterações e usar a IA, mas as mudanças precisam ser aprovadas pelo proprietário.
              </div>
            </div>
          )}

          {/* Day Header & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${activeDayIndex === PRE_TRIP_INDEX ? 'bg-purple-600' :
                activeDayIndex === POST_TRIP_INDEX ? 'bg-pink-600' : 'bg-gray-800'
                }`}>
                {activeDayIndex === PRE_TRIP_INDEX ? <i className="ri-luggage-cart-line"></i> :
                  activeDayIndex === POST_TRIP_INDEX ? <i className="ri-heart-line"></i> :
                    activeDayIndex + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{getDayLabel(activeDayIndex)}</h3>
                <p className="text-sm text-gray-500 capitalize">{getFullDatelabel(activeDayIndex)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateDayItinerary}
                disabled={isGeneratingItinerary}
                className={`w-auto px-4 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 ${isGeneratingItinerary ? 'opacity-70 cursor-wait' : ''}`}
                title="Gerar com IA"
              >
                {isGeneratingItinerary ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line text-xl"></i>
                    {isSelectionMode && selectedIndices.size > 0
                      ? <span className="font-bold text-sm">Gerar para ({selectedIndices.size}) dias</span>
                      : ""
                    }
                  </>
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setIsAddingActivity(true)}
                  className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  title="Adicionar Item"
                >
                  <i className="ri-add-line text-xl"></i>
                </button>
              )}
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-3 pb-20">
            {dayActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-calendar-event-line text-3xl opacity-30"></i>
                </div>
                <p className="font-medium">Nenhuma atividade planejada</p>
                <p className="text-sm text-gray-400 mb-4">Adicione itens ou gere um roteiro com IA</p>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddingActivity(true)}
                    className="text-blue-600 font-semibold hover:underline text-sm"
                  >
                    + Adicionar primeira atividade
                  </button>
                )}
              </div>
            ) : (
              dayActivities.map((activity) => {
                // SPECIAL RENDERING FOR POST-TRIP WIDGETS
                if (activity.type === 'stats') {
                  // Quick calculation for demo stats
                  const totalAct = Object.values(itinerary).flat().filter(a => a.type === 'activity').length;

                  return (
                    <div key={activity.id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg animate-fadeIn mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <i className="ri-bar-chart-box-line text-xl"></i>
                        </div>
                        <h4 className="font-bold text-lg">{activity.title}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-2xl font-bold">{totalAct}</div>
                          <div className="text-xs opacity-80">Atividades</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-2xl font-bold">{Object.keys(itinerary).length}</div>
                          <div className="text-xs opacity-80">Dias</div>
                        </div>
                      </div>
                      <button className="w-full mt-4 py-2 bg-white text-purple-600 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                        Ver Relatório Completo
                      </button>
                    </div>
                  );
                }

                if (activity.type === 'social') {
                  return (
                    <div key={activity.id} className="bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl p-6 text-white shadow-lg animate-fadeIn mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <i className="ri-instagram-line text-2xl"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{activity.title}</h4>
                          <p className="text-sm opacity-90 italic mb-4">"{activity.description}"</p>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-white text-pink-600 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                              <i className="ri-add-circle-line"></i> Criar Story
                            </button>
                            <button className="flex-1 py-2 bg-black/20 text-white rounded-lg font-bold text-sm hover:bg-black/30 flex items-center justify-center gap-2">
                              <i className="ri-share-line"></i> Compartilhar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (activity.type === 'map_summary') {
                  const locationsCount = Object.values(itinerary).flat().filter(a => a.coordinates).length;
                  return (
                    <div key={activity.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all mb-4">
                      <div className="h-32 bg-blue-50 relative group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'radial-gradient(#3b82f6 2px, transparent 2px)',
                          backgroundSize: '20px 20px'
                        }}></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-full text-sm font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-transform">
                            <i className="ri-map-2-line"></i>
                            Ver Mapa Interativo
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <i className="ri-treasure-map-line text-lg"></i>
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">{activity.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <i className="ri-map-pin-range-line text-blue-500"></i>
                            <span className="font-medium">{locationsCount} locais visitados</span>
                          </div>
                        </div>
                        <button className="w-full mt-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                          Explorar Rota
                        </button>
                      </div>
                    </div>
                  );
                }

                // SPECIAL RENDERING FOR CHECKLISTS (Pre/Post)
                if (activity.type === 'checklist') {
                  const isChecked = activity.status === 'confirmed';
                  return (
                    <div key={activity.id} className={`group bg-white border-2 rounded-xl p-4 transition-all flex items-center gap-4 mb-3 ${isChecked ? 'border-green-100 bg-green-50/30' : 'border-gray-100'}`}>
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, isChecked ? 'pending' : 'confirmed')}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400 text-transparent'}`}
                      >
                        <i className="ri-check-line font-bold"></i>
                      </button>
                      <div className="flex-1 content-center">
                        <h4 className={`font-bold text-gray-900 ${isChecked ? 'line-through text-gray-400' : ''}`}>{activity.title}</h4>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEditing(activity)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <i className="ri-pencil-line"></i>
                          </button>
                          <button
                            onClick={(e) => deleteActivity(activeDayIndex, activity.id, e)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 flex items-center justify-center transition-colors"
                            title="Excluir"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                const styles = getStatusStyles(activity.status);
                return (
                  <div key={activity.id} className={`rounded-xl border ${styles.border} ${styles.bg} p-4 transition-all hover:shadow-md`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                          <i className={`${activity.icon} text-xl`}></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg leading-tight">{activity.title}</h4>
                          {activity.description && <p className="text-sm text-gray-600 mt-1">{activity.description}</p>}

                          <div className="flex flex-wrap gap-2 mt-3">
                            {(activity.time || activity.endTime) && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <i className="ri-time-line text-gray-400"></i>
                                {activity.time} {activity.endTime ? `- ${activity.endTime}` : ''}
                              </span>
                            )}
                            {activity.location && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <i className="ri-map-pin-line text-gray-400"></i>
                                {activity.location}
                              </span>
                            )}
                            {activity.price && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <i className="ri-money-dollar-circle-line text-green-500"></i>
                                {activity.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleStartEditing(activity)}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                            title="Editar"
                          >
                            <i className="ri-pencil-line text-lg"></i>
                          </button>
                          <button
                            onClick={(e) => deleteActivity(activeDayIndex, activity.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Excluir"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer / Status Selector */}
                    <div className={`flex gap-2 mt-4 pt-3 border-t border-gray-200/50 ${!isAdmin ? 'opacity-70 pointer-events-none' : ''}`}>
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, 'not_reserved')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activity.status === 'not_reserved'
                          ? 'bg-gray-200 text-gray-800 shadow-inner'
                          : 'text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <i className={`ri-checkbox-blank-circle-line ${activity.status === 'not_reserved' ? '' : 'opacity-50'}`}></i>
                        Não Reservado
                      </button>
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, 'pending')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 shadow-inner'
                          : 'text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <i className={`ri-time-line ${activity.status === 'pending' ? '' : 'opacity-50'}`}></i>
                        Pendente
                      </button>
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, 'confirmed')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activity.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 shadow-inner'
                          : 'text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <i className={`ri-check-line ${activity.status === 'confirmed' ? '' : 'opacity-50'}`}></i>
                        Confirmado
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {
        isAddingActivity && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-slideUp">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Adicionar em {getDayLabel(activeDayIndex)}</h3>
                <button onClick={() => setIsAddingActivity(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tipo</label>
                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                      value={newActivity.type}
                      onChange={e => setNewActivity({ ...newActivity, type: e.target.value as any })}
                    >
                      {activityTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500">
                      <i className={activityTypes.find(t => t.id === newActivity.type)?.icon}></i>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Título da atividade"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                    value={newActivity.title || ''}
                    onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                    autoFocus
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Localização (ex: Aeroporto, Hotel X...)"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                      value={newActivity.location || ''}
                      onChange={e => setNewActivity({ ...newActivity, location: e.target.value })}
                    />
                    <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Início</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-center"
                      value={newActivity.time || '12:00'}
                      onChange={e => setNewActivity({ ...newActivity, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Fim</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-center"
                      value={newActivity.endTime || '13:00'}
                      onChange={e => setNewActivity({ ...newActivity, endTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Preço (R$)</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    value={newActivity.price || ''}
                    onChange={e => setNewActivity({ ...newActivity, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 pt-2 flex gap-3">
                <button
                  onClick={() => setIsAddingActivity(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddActivity}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 shadow-lg shadow-purple-200"
                >
                  + Adicionar
                </button>
              </div>
            </div>
          </div>
        )
      }


      <TripPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => {
          setIsPreferencesOpen(false);
          // If we came from Research Start, maybe repoen it?
          // Currently just closes.
        }}
        initialPreferences={trip.metadata?.preferences}
        onSave={handleSavePreferences}
      />

      <TripAiPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        generatedData={previewData}
        onConfirm={handleConfirmPreview}
        dayLabelFunction={(idx) => idx === -1 ? 'Pre-Trip' : idx === 999 ? 'Post-Trip' : `Dia ${idx + 1}`}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        onMoveActivity={(activityId, fromDayIndex, toDayIndex) => {
          setPreviewData(prev => {
            const newData = { ...prev };
            // Find the activity in the source day
            const sourceActivities = newData[fromDayIndex];
            const activityToMove = sourceActivities?.find(a => a.id === activityId);

            if (activityToMove) {
              // Remove from source
              newData[fromDayIndex] = sourceActivities.filter(a => a.id !== activityId);

              // Add to target
              if (!newData[toDayIndex]) newData[toDayIndex] = [];
              newData[toDayIndex] = [...newData[toDayIndex], activityToMove];
            }

            return newData;
          });
        }}
        viewMode="tabs" // Force Tabs mode for the Generator
      />

      <AiResearchResultsModal
        isOpen={isResearchResultsOpen}
        onClose={() => setIsResearchResultsOpen(false)}
        results={researchResults}
        onAddActivity={handleAddResearchItem}
        dayLabelFunction={(idx) => tripDays[idx]?.fullDate ? `Dia ${idx + 1} (${tripDays[idx].fullDate})` : `Dia ${idx + 1}`}
        dayIndices={tripDays.map((_, i) => i)}
        onSearch={executeAiResearch}
        onLoadMore={() => executeAiResearch(undefined, undefined, true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        destination={trip.destination}
        dates={`${tripDays[0]?.fullDate || trip.start_date} - ${tripDays[tripDays.length - 1]?.fullDate || trip.end_date}`}
        preferencesSummary={{
          vibe: trip.metadata?.preferences?.vibe || [],
          pace: trip.metadata?.preferences?.pace || 'moderate',
          interests: trip.metadata?.preferences?.interests || []
        }}
        isLoading={isPerformingResearch || isLoadingMore}
      />
    </div >
  );
}

