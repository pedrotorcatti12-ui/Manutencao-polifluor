
import React, { useRef, useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { StatusConfig } from '../types';
import { StatusConfigModal } from '../components/StatusConfigModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PlusIcon, EditIcon, DeleteIcon, DownloadIcon, UploadIcon, ShieldCheckIcon, CheckCircleIcon, RefreshIcon, ChartIcon, ExclamationTriangleIcon, CloudIcon, ArrowPathIcon, CloseIcon } from '../components/icons';
import { EquipmentTypesPage } from './EquipmentTypesPage';
import { useDataContext } from '../contexts/DataContext';
import { runDiagnostics, triggerSchemaReload } from '../services/supabase';
import { DatabaseSetupModal } from '../components/DatabaseSetupModal';

interface EditableListCardProps {
    title: string;
    items: string[];
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
    noun: string;
    checkInUse?: (item: string) => boolean;
    checkInUseMessage?: string;
}

const EditableListCard: React.FC<EditableListCardProps> = ({ title, items, setItems, noun, checkInUse, checkInUseMessage }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

    const handleAddItem = () => {
        if (inputValue.trim() && !items.includes(inputValue.trim())) {
            if (editingIndex !== null) {
                const newItems = [...items];
                newItems[editingIndex] = inputValue.trim();
                setItems(newItems.sort((a, b) => a.localeCompare(b)));
                setEditingIndex(null);
            } else {
                setItems([...items, inputValue.trim()].sort((a, b) => a.localeCompare(b)));
            }
            setInputValue('');
        }
    };

    const handleEditItem = (index: number) => {
        setInputValue(items[index]);
        setEditingIndex(index);
    };

    const handleRemoveItem = (index: number) => {
        const itemToRemove = items[index];
        if (checkInUse && checkInUse(itemToRemove)) {
            alert(checkInUseMessage || `Não é possível remover "${itemToRemove}", pois está em uso no sistema.`);
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{title}</h2>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Nome do ${noun}`}
                    className="w-full form-input"
                />
                <button onClick={handleAddItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm transition-colors">
                    {editingIndex !== null ? 'Salvar' : 'Adicionar'}
                </button>
            </div>
            <ul className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleEditItem(index)} className="text-gray-500 hover:text-blue-500"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleRemoveItem(index)} className="text-gray-500 hover:text-red-500"><DeleteIcon className="w-4 h-4" /></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Componente de Diagnóstico com Inteligência de Inicialização
const DatabaseDiagnostics: React.FC<{ 
    onForceSync: () => void; 
    localStats: { equipment: number; orders: number };
    onShowSql: () => void;
}> = ({ onForceSync, localStats, onShowSql }) => {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reloadingCache, setReloadingCache] = useState(false);

    const runTests = async () => {
        setLoading(true);
        const res = await runDiagnostics();
        setResults(res);
        setLoading(false);
    };

    const handleReloadCache = async () => {
        setReloadingCache(true);
        const res = await triggerSchemaReload();
        setReloadingCache(false);
        if (res.success) {
            alert("Solicitação de recarga de cache enviada! Aguarde alguns segundos e atualize o diagnóstico.");
            runTests();
        } else {
            alert("Erro ao recarregar cache: " + res.error + "\n\nVocê precisa rodar o script 'Corrigir Banco de Dados' primeiro para criar a função.");
        }
    };

    useEffect(() => {
        runTests();
    }, []);

    // Verifica se o banco está vazio mas o local tem dados
    const needsInitialization = results && 
        results['equipment']?.status === 'ok' && results['equipment']?.count === 0 && localStats.equipment > 0;

    // Verifica erros críticos (tabela faltando)
    const hasCriticalErrors = results && Object.values(results).some((r: any) => r.status === 'error' || r.message.includes('Tabela não existe'));

    return (
        <div className="mt-6 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <CloudIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">Diagnóstico de Banco de Dados</h3>
                        <p className="text-xs text-gray-500">Status das tabelas e sincronização.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReloadCache} disabled={reloadingCache} className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded font-bold hover:bg-orange-200 transition-colors flex items-center gap-1">
                        <ArrowPathIcon className={`w-3 h-3 ${reloadingCache ? 'animate-spin' : ''}`} /> {reloadingCache ? 'Recarregando...' : 'Recarregar Cache'}
                    </button>
                    <button onClick={runTests} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded font-bold hover:bg-gray-200 transition-colors flex items-center gap-1">
                        <RefreshIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {results ? Object.entries(results).map(([key, data]: any) => (
                    <div key={key} className={`p-3 rounded-lg border flex justify-between items-center ${data.status === 'ok' ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-200'}`}>
                        <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{data.label}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{key}</p>
                        </div>
                        <div className="text-right">
                            {data.status === 'ok' ? (
                                <>
                                    <span className={`text-xs font-black block ${data.count === 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {data.count} regs
                                    </span>
                                    <span className="text-[9px] text-green-500">{data.latency}ms</span>
                                </>
                            ) : (
                                <span className="text-xs font-black text-red-500 flex items-center gap-1"><ExclamationTriangleIcon className="w-3 h-3"/> {data.message}</span>
                            )}
                        </div>
                    </div>
                )) : (
                    <p className="col-span-3 text-center text-sm text-gray-400 py-4">Carregando diagnóstico...</p>
                )}
            </div>

            {/* Ação de Inicialização Inteligente */}
            {hasCriticalErrors ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-200 dark:bg-red-800 rounded-full text-red-700 dark:text-red-200">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-800 dark:text-red-200">Banco de Dados Incompleto ou Cache Desatualizado</h4>
                            <p className="text-xs text-red-600 dark:text-red-300">Tente "Recarregar Cache" acima. Se não funcionar, clique em corrigir.</p>
                        </div>
                    </div>
                    <button onClick={onShowSql} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-lg shadow-md whitespace-nowrap transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4"/> Corrigir Banco de Dados (SQL)
                    </button>
                </div>
            ) : needsInitialization ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-full text-blue-700 dark:text-blue-200">
                            <UploadIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200">Banco de Dados Limpo Detectado</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-300">Você tem {localStats.equipment} equipamentos locais, mas a nuvem está vazia. Deseja fazer o upload inicial?</p>
                        </div>
                    </div>
                    <button onClick={onForceSync} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-lg shadow-md whitespace-nowrap transition-transform hover:scale-105 active:scale-95">
                        Inicializar Banco (Upload)
                    </button>
                </div>
            ) : (
                <div className="flex justify-end">
                     <button onClick={onForceSync} className="text-xs text-gray-500 hover:text-blue-600 underline">
                        Forçar Sincronização Manual
                    </button>
                </div>
            )}
        </div>
    );
};

export const SettingsPage: React.FC = () => {
  const { 
      statusConfig, setStatusConfig,
      maintainers, setMaintainers, requesters, setRequesters,
      standardTasks, setStandardTasks, standardMaterials, setStandardMaterials,
      equipmentData, setEquipmentData,
      inventoryData, setInventoryData,
      workOrders, setWorkOrders,
      maintenancePlans, setMaintenancePlans,
      equipmentTypes, setEquipmentTypes,
      forceSync, removeWorkOrder
  } = useDataContext();
  
  const [isPurgeModalOpen, setIsPurgeModalOpen] = React.useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = React.useState(false);

  const handleExportData = () => {
      const data = {
          timestamp: new Date().toISOString(),
          version: "2.0",
          equipmentData, inventoryData, workOrders,
          settings: { statusConfig, maintainers, requesters, standardTasks, standardMaterials, maintenancePlans, equipmentTypes }
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SGMI_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
  };

  const handlePurge2025 = async () => {
      setEquipmentData(prev => prev.map(eq => ({
          ...eq,
          schedule: eq.schedule.filter(task => task.year !== 2025)
      })));

      const ordersToDelete = workOrders.filter(order => new Date(order.scheduledDate).getFullYear() === 2025);
      
      setWorkOrders(prev => prev.filter(order => {
          const year = new Date(order.scheduledDate).getFullYear();
          return year !== 2025;
      }));

      for (const order of ordersToDelete) {
          await removeWorkOrder(order.id);
      }

      setIsPurgeModalOpen(false);
      alert("Amostragem de 2025 removida com sucesso! O sistema está limpo para 2026.");
  };

  return (
    <>
      <Header title="Configurações e Gestão de Dados" subtitle="Prepare o sistema para o lançamento oficial ou gerencie backups." />
      
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                        <ShieldCheckIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ferramentas de Manutenção de Dados</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saneamento de banco de dados e migração.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <DatabaseDiagnostics 
                            onForceSync={forceSync} 
                            localStats={{ equipment: equipmentData.length, orders: workOrders.length }}
                            onShowSql={() => setIsSqlModalOpen(true)}
                        />
                    </div>

                    <div className="space-y-4">
                        <button onClick={handleExportData} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg shadow-sm">
                            <DownloadIcon className="w-6 h-6" /> Exportar Backup (JSON Local)
                        </button>
                        
                        <button onClick={() => setIsPurgeModalOpen(true)} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-50 border-2 border-rose-200 text-rose-700 hover:bg-rose-100 font-black rounded-lg transition-all text-sm uppercase tracking-tighter shadow-sm">
                            <ExclamationTriangleIcon className="w-6 h-6" /> Limpar Amostragem (Nuker 2025)
                        </button>
                        <p className="text-[10px] text-center text-rose-500 font-bold uppercase">Atenção: Remove permanentemente todos os registros de 2025 para liberar a planta.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableListCard title="Mantenedores" items={maintainers} setItems={setMaintainers} noun="mantenedor" />
            <EditableListCard title="Solicitantes" items={requesters} setItems={setRequesters} noun="solicitante" />
        </div>
      
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <EquipmentTypesPage />
        </div>
      </div>

      <DatabaseSetupModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />

      <ConfirmationModal 
        isOpen={isPurgeModalOpen} 
        onClose={() => setIsPurgeModalOpen(false)} 
        onConfirm={handlePurge2025} 
        title="Deseja expurgar a amostragem 2025?" 
        message="Esta ação irá DELETAR todos os registros de tarefas e ordens de serviço do ano de 2025. Use apenas para limpar o sistema antes de entrar em operação oficial." 
      />
    </>
  );
};
