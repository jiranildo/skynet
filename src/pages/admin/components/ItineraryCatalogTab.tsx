import { useState, useEffect, useRef } from 'react';
import { getItineraryCatalogs, createItineraryCatalog, updateItineraryCatalog, deleteItineraryCatalog, bulkCreateItineraryCatalog, type ItineraryCatalog } from '../../../services/db/itinerary_catalog';
import Papa from 'papaparse';
import { useAuth } from '../../../context/AuthContext';
import AdminCatalogModal from './AdminCatalogModal';

interface ItineraryCatalogTabProps {
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type: 'info' | 'success' | 'warning' | 'danger') => void;
}

export default function ItineraryCatalogTab({ showAlert, showConfirm }: ItineraryCatalogTabProps) {
  const [catalogs, setCatalogs] = useState<ItineraryCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogToEdit, setCatalogToEdit] = useState<ItineraryCatalog | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const entityId = user?.user_metadata?.entity_id;

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setIsLoading(true);
    try {
      const data = await getItineraryCatalogs(entityId);
      setCatalogs(data);
    } catch (error: any) {
      showAlert('Erro', `Erro ao carregar o catálogo de roteiros: ${error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm('Confirmar exclusão', 'Tem certeza que deseja excluir este roteiro do catálogo? Esta ação não pode ser desfeita.', async () => {
      try {
        await deleteItineraryCatalog(id);
        setCatalogs(prev => prev.filter(c => c.id !== id));
        showAlert('Sucesso', 'Roteiro excluído com sucesso.', 'success');
      } catch (error: any) {
        showAlert('Erro', `Erro ao excluir roteiro: ${error.message}`, 'danger');
      }
    }, 'danger');
  };

  const handleSaveCatalog = async (catalogData: Partial<ItineraryCatalog>) => {
    try {
      if (catalogToEdit) {
        await updateItineraryCatalog(catalogToEdit.id, catalogData);
        setCatalogs(prev => prev.map(c => c.id === catalogToEdit.id ? { ...c, ...catalogData } : c));
        showAlert('Sucesso', 'Roteiro atualizado.', 'success');
      } else {
        const payload = { ...catalogData, entity_id: entityId, user_id: user?.id };
        const newCatalog = await createItineraryCatalog(payload as any);
        setCatalogs([newCatalog, ...catalogs]);
        showAlert('Sucesso', 'Roteiro criado com sucesso.', 'success');
      }
    } catch (error: any) {
      showAlert('Erro', `Erro ao salvar roteiro: ${error.message}`, 'danger');
      throw error;
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Title,Destination,DurationDays,Category,Description,ImageURL,Day,Time,Type,ActivityTitle,ActivityDescription,Location,Cost\n" +
      '"Descobrindo Paris em 3 Dias","Paris, França",3,"lazer","Um roteiro clássico pelos pontos mais famosos de Paris.","https://images.unsplash.com/photo-1499856871958-5b9627545d1a",1,"09:00","flight","Chegada em Paris","Transfer do aeroporto para o hotel","Aeroporto CDG",250\n' +
      '"Descobrindo Paris em 3 Dias","Paris, França",3,"lazer","Um roteiro clássico pelos pontos mais famosos de Paris.","https://images.unsplash.com/photo-1499856871958-5b9627545d1a",1,"14:00","activity","Visita à Torre Eiffel","Subida até o topo para ver a cidade. O ingresso deve ser comprado antecipadamente.","Champ de Mars, 5 Ave Anatole France",150\n' +
      '"Descobrindo Paris em 3 Dias","Paris, França",3,"lazer","Um roteiro clássico pelos pontos mais famosos de Paris.","https://images.unsplash.com/photo-1499856871958-5b9627545d1a",1,"20:00","restaurant","Jantar no Le Jules Verne","Restaurante gastronômico na Torre.","Torre Eiffel, 2º Andar",850\n' +
      '"Descobrindo Paris em 3 Dias","Paris, França",3,"lazer","Um roteiro clássico pelos pontos mais famosos de Paris.","https://images.unsplash.com/photo-1499856871958-5b9627545d1a",2,"09:00","activity","Museu do Louvre","Ver a Monalisa. Chegue cedo para evitar a fila gigante.","Rue de Rivoli",120\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_roteiros.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setIsLoading(true);
          const parsedData = results.data as any[];
          
          if (parsedData.length === 0) {
            showAlert('Aviso', 'O arquivo CSV está vazio.', 'warning');
            return;
          }

          // Expected CSV format:
          // Title, Destination, DurationDays, Category, Description, Day, Time, Type, ActivityTitle, ActivityDescription, Location, Cost
          
          // Group by Title/Destination to create multiple catalogs (or just one if they all share the same)
          const catalogsMap = new Map<string, any>();

          parsedData.forEach(row => {
            const key = `${row.Title}_${row.Destination}`;
            if (!catalogsMap.has(key)) {
              catalogsMap.set(key, {
                title: row.Title,
                destination: row.Destination,
                duration_days: parseInt(row.DurationDays) || 1,
                category: row.Category || 'geral',
                description: row.Description || '',
                image_url: row.ImageURL || '',
                entity_id: entityId,
                user_id: user?.id,
                itinerary_data: {}
              });
            }

            const catalog = catalogsMap.get(key);
            const dayIndex = (parseInt(row.Day) || 1) - 1; // 0-indexed for frontend

            if (!catalog.itinerary_data[dayIndex]) {
              catalog.itinerary_data[dayIndex] = [];
            }

            // Create activity
            catalog.itinerary_data[dayIndex].push({
              id: Math.random().toString(36).substr(2, 9),
              type: row.Type?.toLowerCase() || 'other',
              time: row.Time || '09:00',
              title: row.ActivityTitle || 'Atividade',
              description: row.ActivityDescription || '',
              location: row.Location || '',
              cost: row.Cost ? parseFloat(row.Cost) : 0
            });
          });

          const catalogsToCreate = Array.from(catalogsMap.values());
          if (catalogsToCreate.length === 0) {
            showAlert('Aviso', 'Nenhum roteiro válido encontrado no CSV.', 'warning');
            return;
          }

          await bulkCreateItineraryCatalog(catalogsToCreate);
          showAlert('Sucesso', `${catalogsToCreate.length} pacote(s) de roteiro(s) importado(s) com sucesso.`, 'success');
          loadCatalogs();
        } catch (error: any) {
          showAlert('Erro', `Falha ao importar roteiros: ${error.message}`, 'danger');
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        showAlert('Erro', `Erro ao ler o arquivo CSV: ${error.message}`, 'danger');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const filteredCatalogs = catalogs.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <i className="ri-booklet-line text-rose-500"></i>
            Catálogo de Roteiros
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie roteiros pré-fabricados disponíveis para os usuários na hora da criação de viagem.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar roteiros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none text-sm transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                setCatalogToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <i className="ri-add-line"></i>
              <span className="hidden xl:inline">Cadastrar Roteiro</span>
              <span className="inline xl:hidden">Novo</span>
            </button>
            <button 
              onClick={handleDownloadTemplate}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200"
              title="Baixar Template CSV"
            >
              <i className="ri-download-cloud-2-line"></i>
              <span className="hidden xl:inline">Template CSV</span>
              <span className="inline xl:hidden">Exemplo</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 outline-none text-white rounded-xl shadow-lg shadow-rose-200 font-bold text-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <i className="ri-file-upload-line"></i>
              <span className="hidden xl:inline">Importar CSV</span>
              <span className="inline xl:hidden">CSV</span>
            </button>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <i className="ri-loader-4-line animate-spin text-3xl mb-2 text-rose-500"></i>
            <p>Carregando catálogo...</p>
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <i className="ri-book-open-line text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Nenhum roteiro encontrado.</h3>
            <p className="text-sm text-gray-500 mt-1">Faça o upload de um CSV contendo atividades de roteiros ou tente buscar outro termo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-bold text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Roteiro</th>
                  <th className="px-6 py-4">Dias</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4 text-center">Atividades</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCatalogs.map(catalog => {
                  // count activities
                  let activityCount = 0;
                  if (catalog.itinerary_data) {
                    Object.values(catalog.itinerary_data).forEach((arr: any) => {
                      if (Array.isArray(arr)) activityCount += arr.length;
                    });
                  }

                  return (
                    <tr key={catalog.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{catalog.title}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <i className="ri-map-pin-line text-rose-400"></i> {catalog.destination}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {catalog.duration_days} dias
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 font-medium capitalize">{catalog.category || 'Geral'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-sm text-gray-600 font-bold bg-gray-100 px-2.5 py-1 rounded-lg">
                           {activityCount} itens
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                    { (catalog.user_id === user?.id || isSuperAdmin || isAdmin) && (
                      <>
                        <button
                          onClick={() => {
                            setCatalogToEdit(catalog);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center inline-flex"
                          title="Editar"
                        >
                          <i className="ri-pencil-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(catalog.id)}
                          className="w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center inline-flex"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

       <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex gap-3">
            <i className="ri-information-line text-blue-500 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Formato CSV Esperado</h4>
              <p className="text-xs text-blue-700 mt-1 mb-2">
                O arquivo importado precisa ter os seguintes cabeçalhos (nomenclatura exata):
              </p>
              <div className="bg-white/60 p-2 rounded-lg font-mono text-[10px] text-blue-800 break-all border border-blue-100">
                Title,Destination,DurationDays,Category,Description,Day,Time,Type,ActivityTitle,ActivityDescription,Location,Cost
              </div>
            </div>
          </div>
        </div>

        <AdminCatalogModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCatalog}
          catalogToEdit={catalogToEdit}
        />
    </div>
  );
}
