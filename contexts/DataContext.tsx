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

    // 1. Carga Inicial do Supabase com Proteção Total (Blindagem)
    useEffect(() => {
        const fetchCloudData = async () => {
            if (supabase) {
                try {
                    setIsSyncing(true);
                    const cloudData = await loadFromCloud();
                    
                    if (cloudData) {
                        setIsOnline(true
