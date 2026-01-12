import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Equipment, SparePart, StatusConfig, MaintenancePlan, EquipmentType, WorkOrder } from '../types';
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
    const [equipmentData, setEquipmentData] = useLocalStorage<Equipment[]>('equipmentData_v17', getInitialEquipmentData());
    const [inventoryData, setInventoryData] = useLocalStorage<SparePart[]>('inventoryData_v17', initialInventoryData);
    const [statusConfig, setStatusConfig] = useLocalStorage<StatusConfig[]>('statusConfig_v17', initialStatusConfig);
    const [maintenancePlans, setMaintenancePlans] = useLocalStorage<MaintenancePlan[]>('maintenancePlans_v17', getInitialMaintenancePlans());
    const [equipmentTypes, setEquipmentTypes] = useLocalStorage<EquipmentType[]>('equipmentTypes_v17', initialEquipmentTypes);
    
    const [maintainers, setMaintainers] = useLocalStorage<string[]>('maintainers_v17', INITIAL_INTERNAL_MAINTAINERS);
    const [requesters, setRequesters] = useLocalStorage<string[]>('requesters_v17', INITIAL_REQUESTERS);
    const [standardTasks, setStandardTasks] = useLocalStorage<string[]>('standardTasks_v17', INITIAL_PREDEFINED_ACTIONS);
    const [standardMaterials, setStandardMaterials] = useLocalStorage<string[]>('standardMaterials_v17', INITIAL_PREDEFINED_MATERIALS);
    
    const [workOrders, setWorkOrders] = useLocalStorage<WorkOrder[]>('workOrders_v17', []);
    
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const fetchCloudData = async () => {
            if (supabase) {
                try {
                    setIsSyncing(true);
                    const cloudData = await loadFromCloud();
                    if (cloudData) {
                        setIsOnline(true);
                        if (Array.isArray(cloudData.equipment) && cloudData.equipment.length > 0) {
                            const sanitizedEquip = cloudData.equipment.map((e: any) => ({
                                ...e,
                                schedule: Array.isArray(e.schedule) ? e.schedule : []
                            }));
                            setEquipmentData(sanitizedEquip);
                        }
                        if (Array.isArray(cloudData.inventory) && cloudData.inventory.length > 0) setInventoryData(cloudData.inventory);
                        if (Array.isArray(cloudData.workOrders) && cloudData.workOrders.length > 0) setWorkOrders(cloudData.workOrders);
                        if (Array.isArray(cloudData.plans) && cloudData.plans.length > 0) setMaintenancePlans(cloudData.plans);
                        if (Array.isArray(cloudData.types) && cloudData.types.length > 0) setEquipmentTypes(cloudData.types);
                        if (cloudData.settings) {
                            if (Array.isArray(cloudData.settings.maintainers) && cloudData.settings.maintainers.length > 0) setMaintainers(cloudData.settings.maintainers);
                            if (Array.isArray(cloudData.settings.requesters) && cloudData.settings.requesters.length > 0) setRequesters(cloudData.settings.requesters);
                            if (Array.isArray(cloudData.settings.standard_tasks) && cloudData.settings.standard_tasks.length > 0) setStandardTasks(cloudData.settings.standard_tasks);
                            if (Array.isArray(cloudData.settings.standard_materials) && cloudData.settings.standard_materials.length > 0) setStandardMaterials(cloudData.settings.standard_materials);
                            if (Array.isArray(cloudData.settings.status_config) && cloudData.settings.status_config.length > 0) setStatusConfig(cloudData.settings.status_config);
                        }
                    }
                } catch (err) {
                    console.error("Erro no sincronismo inicial:", err);
                } finally {
                    setIsSyncing(false);
                }
            }
        };
        fetchCloudData();
    }, []);

    useEffect(() => {
        if (!isOnline) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncEquipmentToCloud(equipmentData).then(() => setIsSyncing(false)); }, 2000);
        return () => clearTimeout(timer);
    }, [equipmentData, isOnline]);

    useEffect(() => {
        if (!isOnline) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncInventoryToCloud(inventoryData).then(() => setIsSyncing(false)); }, 2000);
        return () => clearTimeout(timer);
    }, [inventoryData, isOnline]);

    useEffect(() => {
        if (!isOnline) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncWorkOrdersToCloud(workOrders).then(() => setIsSyncing(false)); }, 2000);
        return () => clearTimeout(timer);
    }, [workOrders, isOnline]);

    useEffect(() => {
        if (!isOnline) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncPlansToCloud(maintenancePlans).then(() => setIsSyncing(false)); }, 2000);
        return () => clearTimeout(timer);
    }, [maintenancePlans, isOnline]);

    useEffect(() => {
        if (!isOnline) return;
        const timer = setTimeout(() => { setIsSyncing(true); syncEquipmentTypesToCloud(equipmentTypes).then(() => setIsSyncing(false)); }, 2000);
        return () => clearTimeout(timer);
    }, [equipmentTypes, isOnline]);

    useEffect(() => {
        if (!isOnline) return;
        const timer = setTimeout(() => {
            setIsSyncing(true);
            syncSettingsToCloud({ maintainers, requesters, standard_tasks: standardTasks, standard_materials: standardMaterials, status_config: statusConfig })
                .then(() => setIsSyncing(false));
        }, 2000);
        return () => clearTimeout(timer);
    }, [maintainers, requesters, standardTasks, standardMaterials, statusConfig, isOnline]);

    const removeEquipment = async (id: string) => {
        setEquipmentData(prev => prev.filter(e => e.id !== id));
        if (isOnline) await deleteEquipmentFromCloud(id);
    };
