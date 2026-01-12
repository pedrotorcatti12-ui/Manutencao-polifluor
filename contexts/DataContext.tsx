
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Equipment, SparePart, StatusConfig, MaintenancePlan, EquipmentType, WorkOrder, MaintenanceStatus } from '../types';
import { 
    getInitialEquipmentData,
    initialInventoryData, 
    initialStatusConfig,
    getInitialMaintenancePlans,
    initialEquipmentTypes
} from '../data/dataService';
import { 
    INITIAL_INTERNAL_MAINTAINERS, 
    INITIAL_REQUESTERS,
    INITIAL_PREDEFINED_ACTIONS,
    INITIAL_PREDEFINED_MATERIALS
} from '../constants';
import { 
    loadFromCloud, 
    syncEquipmentToCloud, 
    syncInventoryToCloud, 
    syncWorkOrdersToCloud, 
    syncSettingsToCloud, 
    syncPlansToCloud, 
    syncEquipmentTypesToCloud,
    deleteEquipmentFromCloud,
    deleteInventoryFromCloud,
    deleteWorkOrderFromCloud,
    deletePlanFromCloud,
    deleteEquipmentTypeFromCloud,
    supabase 
} from '../services/supabase';

interface DataContextType {
    equipmentData: Equipment[];
    setEquipmentData: React.Dispatch<React.SetStateAction<Equipment[]>>;
    inventoryData: SparePart[];
    setInventoryData: React.Dispatch<React.SetStateAction<SparePart[]>>;
    statusConfig: StatusConfig[];
    setStatusConfig: React.Dispatch<React.SetStateAction<StatusConfig[]>>;
    maintenancePlans: MaintenancePlan[];
    setMaintenancePlans: React.Dispatch<React.SetStateAction<MaintenancePlan[]>>;
    equipmentTypes: EquipmentType[];
    setEquipmentTypes: React.Dispatch<React.SetStateAction<EquipmentType[]>>;
    maintainers: string[];
    setMaintainers: React.Dispatch<React.SetStateAction<string[]>>;
    requesters: string[];
    setRequesters: React.Dispatch<React.SetStateAction<string[]>>;
    standardTasks: string[];
    setStandardTasks: React.Dispatch<React.SetStateAction<string[]>>;
    standardMaterials: string[];
    setStandardMaterials: React.Dispatch<React.SetStateAction<string[]>>;
    workOrders: WorkOrder[];
    setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
    isSyncing: boolean;
    forceSync: () => Promise<void>;
    isOnline: boolean;
    removeEquipment: (id: string) => Promise<void>;
    removeInventory: (id: string) => Promise<void>;
    removeWorkOrder: (id: string) => Promise<void>;
    removePlan: (id: string) => Promise<void>;
    removeEquipmentType: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Chave de versão atualizada para forçar refresh dos dados iniciais
    const VERSION = 'v19_relatorio'; 
    const [equipmentData, setEquipmentData] = useLocalStorage<Equipment[]>(`equipmentData_${VERSION}`, getInitialEquipmentData());
    const [inventoryData, setInventoryData] = useLocalStorage<SparePart[]>(`inventoryData_${VERSION}`, initialInventoryData);
    const [statusConfig, setStatusConfig] = useLocalStorage<StatusConfig[]>(`statusConfig_${VERSION}`, initialStatusConfig);
    const [maintenancePlans, setMaintenancePlans] = useLocalStorage<MaintenancePlan[]>(`maintenancePlans_${VERSION}`, getInitialMaintenancePlans());
    const [equipmentTypes, setEquipmentTypes] = useLocalStorage<EquipmentType[]>(`equipmentTypes_${VERSION}`, initialEquipmentTypes);
    
    const [maintainers, setMaintainers] = useLocalStorage<string[]>(`maintainers_${VERSION}`, INITIAL_INTERNAL_MAINTAINERS);
    const [requesters, setRequesters] = useLocalStorage<string[]>(`requesters_${VERSION}`, INITIAL_REQUESTERS);
    const [standardTasks, setStandardTasks] = useLocalStorage<string[]>(`standardTasks_${VERSION}`, INITIAL_PREDEFINED_ACTIONS);
    const [standardMaterials, setStandardMaterials] = useLocalStorage<string[]>(`standardMaterials_${VERSION}`, INITIAL_PREDEFINED_MATERIALS);
    
    const [workOrders, setWorkOrders] = useLocalStorage<WorkOrder[]>(`workOrders_${VERSION}`, []);
    
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    // Efeito para injetar os dados do relatório caso o usuário venha de uma versão antiga
    useEffect(() => {
        const hasReport = equipmentData.some(eq => eq.schedule.some(t => t.status === MaintenanceStatus.Executed));
        if (!hasReport) {
            console.log("Detectada ausência de histórico. Aplicando dados do relatório de campo...");
            setEquipmentData(getInitialEquipmentData());
        }
    }, []);

    useEffect(() => {
        const fetchCloudData = async () => {
            if (supabase) {
                setIsSyncing(true);
                try {
                    const cloudData = await loadFromCloud();
                    if (cloudData) {
                        setIsOnline(true);
                        if (Array.isArray(cloudData.equipment) && cloudData.equipment.length > 0) setEquipmentData(cloudData.equipment);
                        if (Array.isArray(cloudData.inventory) && cloudData.inventory.length > 0) setInventoryData(cloudData.inventory);
                        if (Array.isArray(cloudData.workOrders) && cloudData.workOrders.length > 0) setWorkOrders(cloudData.workOrders);
                        if (Array.isArray(cloudData.plans) && cloudData.plans.length > 0) setMaintenancePlans(cloudData.plans);
                        if (Array.isArray(cloudData.types) && cloudData.types.length > 0) setEquipmentTypes(cloudData.types);
                        
                        if (cloudData.settings) {
                            const s = cloudData.settings;
                            if (Array.isArray(s.maintainers)) setMaintainers(s.maintainers);
                            if (Array.isArray(s.requesters)) setRequesters(s.requesters);
                            if (Array.isArray(s.standard_tasks)) setStandardTasks(s.standard_tasks);
                            if (Array.isArray(s.standard_materials)) setStandardMaterials(s.standard_materials);
                            if (Array.isArray(s.status_config)) setStatusConfig(s.status_config);
                        }
                    }
                } catch (err) {
                    console.error("Erro Supabase:", err);
                } finally {
                    setIsSyncing(false);
                }
            }
        };
        fetchCloudData();
    }, []);

    useEffect(() => {
        if (!isOnline || !Array.isArray(equipmentData)) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncEquipmentToCloud(equipmentData).finally(() => setIsSyncing(false)); }, 5000);
        return () => clearTimeout(timer);
    }, [equipmentData, isOnline]);

    useEffect(() => {
        if (!isOnline || !Array.isArray(inventoryData)) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncInventoryToCloud(inventoryData).finally(() => setIsSyncing(false)); }, 5000);
        return () => clearTimeout(timer);
    }, [inventoryData, isOnline]);

    useEffect(() => {
        if (!isOnline || !Array.isArray(workOrders)) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncWorkOrdersToCloud(workOrders).finally(() => setIsSyncing(false)); }, 5000);
        return () => clearTimeout(timer);
    }, [workOrders, isOnline]);

    const removeEquipment = async (id: string) => {
        setEquipmentData(prev => prev.filter(e => e.id !== id));
        if (isOnline) await deleteEquipmentFromCloud(id);
    };

    const removeInventory = async (id: string) => {
        setInventoryData(prev => prev.filter(i => i.id !== id));
        if (isOnline) await deleteInventoryFromCloud(id);
    };

    const removeWorkOrder = async (id: string) => {
        setWorkOrders(prev => prev.filter(w => w.id !== id));
        if (isOnline) await deleteWorkOrderFromCloud(id);
    };

    const removePlan = async (id: string) => {
        setMaintenancePlans(prev => prev.filter(p => p.id !== id));
        if (isOnline) await deletePlanFromCloud(id);
    };

    const removeEquipmentType = async (id: string) => {
        setEquipmentTypes(prev => prev.filter(t => t.id !== id));
        if (isOnline) await deleteEquipmentTypeFromCloud(id);
    };

    const forceSync = async () => {
        setIsSyncing(true);
        try {
            await Promise.all([
                syncEquipmentToCloud(equipmentData),
                syncInventoryToCloud(inventoryData),
                syncWorkOrdersToCloud(workOrders),
                syncPlansToCloud(maintenancePlans),
                syncEquipmentTypesToCloud(equipmentTypes),
                syncSettingsToCloud({ maintainers, requesters, standard_tasks: standardTasks, standard_materials: standardMaterials, status_config: statusConfig })
            ]);
            setIsOnline(true);
            alert("Upload e Sincronização concluídos com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao sincronizar. Verifique o console.");
        } finally {
            setIsSyncing(false);
        }
    };

    const value = {
        equipmentData: equipmentData || [],
        setEquipmentData,
        inventoryData: inventoryData || [],
        setInventoryData,
        statusConfig: statusConfig || [],
        setStatusConfig,
        maintenancePlans: maintenancePlans || [],
        setMaintenancePlans,
        equipmentTypes: equipmentTypes || [],
        setEquipmentTypes,
        maintainers: maintainers || [],
        setMaintainers,
        requesters: requesters || [],
        setRequesters,
        standardTasks: standardTasks || [],
        setStandardTasks,
        standardMaterials: standardMaterials || [],
        setStandardMaterials,
        workOrders: workOrders || [],
        setWorkOrders,
        isSyncing, forceSync, isOnline,
        removeEquipment, removeInventory, removeWorkOrder, removePlan, removeEquipmentType
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useDataContext must be used within a DataProvider');
    return context;
};
