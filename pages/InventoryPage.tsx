
import React, { useState, useMemo } from 'react';
import { SparePart, PurchaseRequest, MaintenanceStatus } from '../types';
import { Header } from '../components/Header';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, EditIcon, DeleteIcon, ShoppingCartIcon, InventoryIcon, CheckCircleIcon, ClockIcon, PackageIcon, ArrowRightIcon } from '../components/icons';
import { StockStatusBadge } from '../components/StockStatusBadge';
import { SparePartModal } from '../components/SparePartModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useDataContext } from '../contexts/DataContext';

export const InventoryPage: React.FC = () => {
  const { inventoryData, setInventoryData, workOrders, setWorkOrders, equipmentData, removeInventory } = useDataContext();
  const [activeTab, setActiveTab] = useState<'stock' | 'purchasing'>('stock');
  
  // States Estoque
  const [searchTerm, setSearchTerm] = useState('');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [deletingPart, setDeletingPart] = useState<SparePart | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- LÓGICA DE ESTOQUE ---
  const filteredInventory = useMemo(() => {
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return inventoryData.filter(part =>
      part.name.toLowerCase().includes(lowercasedTerm) ||
      part.id.toLowerCase().includes(lowercasedTerm) ||
      part.location.toLowerCase().includes(lowercasedTerm)
    );
  }, [inventoryData, debouncedSearchTerm]);

  const handleSavePart = (part: SparePart) => {
    if (editingPart) {
      setInventoryData(prev => prev.map(p => p.id === part.id ? part : p));
    } else {
      setInventoryData(prev => [...prev, part]);
    }
    closePartModal();
  };
  
  const handleDeletePart = () => {
    if (!deletingPart) return;
    removeInventory(deletingPart.id);
    setDeletingPart(null);
  };

  const openPartModal = (part: SparePart | null = null) => {
    setEditingPart(part);
    setIsPartModalOpen(true);
  };

  const closePartModal = () => {
    setEditingPart(null);
    setIsPartModalOpen(false);
  };

  // --- LÓGICA DE REQUISIÇÕES (CENTRAL DE COMPRAS) ---
  const allRequisitions = useMemo(() => {
      const list: Array<{ 
          req: PurchaseRequest, 
          osId: string, 
          equipmentName: string, 
          requester: string,
          osStatus: MaintenanceStatus,
          waitingDays: number
      }> = [];

      workOrders.forEach(wo => {
          if (wo.purchaseRequests && wo.purchaseRequests.length > 0) {
              const eqName = equipmentData.find(e => e.id === wo.equipmentId)?.name || wo.equipmentId;
              wo.purchaseRequests.forEach(req => {
                  const startDate = new Date(req.requisitionDate);
                  const endDate = req.arrivalDate ? new Date(req.arrivalDate) : new Date();
                  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                  list.push({
                      req,
                      osId: wo.id,
                      equipmentName: eqName,
                      requester: wo.requester || 'Técnico',
                      osStatus: wo.status,
                      waitingDays: diffDays
                  });
              });
          }
      });

      // Ordenar: Pendentes primeiro, depois por data
      return list.sort((a, b) => {
          if (a.req.status === 'Pendente' && b.req.status !== 'Pendente') return -1;
          if (a.req.status !== 'Pendente' && b.req.status === 'Pendente') return 1;
          return new Date(b.req.requisitionDate).getTime() - new Date(a.req.requisitionDate).getTime();
      });
  }, [workOrders, equipmentData]);

  const updateRequisitionStatus = (osId: string, reqId: string, newStatus: 'Pendente' | 'Comprado' | 'Entregue') => {
      setWorkOrders(prev => prev.map(wo => {
          if (wo.id === osId) {
              return {
                  ...wo,
                  purchaseRequests: wo.purchaseRequests?.map(r => {
                      if (r.id === reqId) {
                          return {
                              ...r,
                              status: newStatus,
                              // Grava a data de chegada se foi entregue agora
                              arrivalDate: newStatus === 'Entregue' ? new Date().toISOString() : r.arrivalDate
                          };
                      }
                      return r;
                  })
              };
          }
          return wo;
      }));
  };

  return (
    <>
      <Header 
        title="Gestão de Materiais" 
        subtitle="Controle de estoque físico e central de requisições de compra."
        actions={
          activeTab === 'stock' ? (
            <div className="flex gap-2">
                <button onClick={() => openPartModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm">
                <PlusIcon className="w-4 h-4" />
                Adicionar Peça
                </button>
            </div>
          ) : null
        }
      />

      {/* Tabs de Navegação */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button 
            onClick={() => setActiveTab('stock')} 
            className={`pb-3 px-4 text-sm font-bold uppercase transition-colors flex items-center gap-2 ${activeTab === 'stock' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <InventoryIcon className="w-4 h-4"/> Estoque Físico (Almoxarifado)
        </button>
        <button 
            onClick={() => setActiveTab('purchasing')} 
            className={`pb-3 px-4 text-sm font-bold uppercase transition-colors flex items-center gap-2 ${activeTab === 'purchasing' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <ShoppingCartIcon className="w-4 h-4"/> Central de Compras (Requisições)
            {allRequisitions.filter(r => r.req.status === 'Pendente').length > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {allRequisitions.filter(r => r.req.status === 'Pendente').length}
                </span>
            )}
        </button>
      </div>

      {activeTab === 'stock' && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
              <input
                type="text"
                placeholder="Pesquisar por Cód, Produto ou Localização..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 form-input"
              />
               <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredInventory.length} {filteredInventory.length === 1 ? 'item' : 'itens'}
                </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Produto</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estoque Mín.</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estoque Atual</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map(part => (
                      <tr key={part.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold">{part.id} - {part.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{part.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{part.minStock} {part.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">{part.currentStock} {part.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <StockStatusBadge currentStock={part.currentStock} minStock={part.minStock} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center space-x-2">
                            <button onClick={() => openPartModal(part)} className="p-2 text-gray-500 hover:text-blue-500" title="Editar Peça"><EditIcon className="w-4 h-4"/></button>
                            <button onClick={() => setDeletingPart(part)} className="p-2 text-gray-500 hover:text-red-500" title="Excluir Peça"><DeleteIcon className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <h3 className="text-lg font-semibold">Nenhum item encontrado</h3>
                        <p className="mt-1">Tente ajustar seus termos de busca.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {isPartModalOpen && (
        <SparePartModal 
            isOpen={isPartModalOpen}
            onClose={closePartModal}
            onSave={handleSavePart}
            existingPart={editingPart}
        />
      )}

      {deletingPart && (
        <ConfirmationModal
            isOpen={!!deletingPart}
            onClose={() => setDeletingPart(null)}
            onConfirm={handleDeletePart}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir a peça ${deletingPart.id} - ${deletingPart.name}?`}
        />
      )}
    </>
  );
};
