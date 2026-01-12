
import { createClient } from '@supabase/supabase-js';
import { Equipment, SparePart, WorkOrder, MaintenancePlan, EquipmentType, StatusConfig } from '../types';

const PROJECT_ID = 'cmihdvvfpkeyjtevkaha';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaWhkdnZmcGtleWp0ZXZrYWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDA2MDQsImV4cCI6MjA3OTIxNjYwNH0.QNBFdjqGVQUS_UTd_04QrPDvMhpCBwrw1h2TzMXKIXQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AppSettings {
    maintainers: string[];
    requesters: string[];
    standard_tasks: string[];
    standard_materials: string[];
    status_config?: StatusConfig[]; 
}

const handleSupabaseError = (error: any, context: string) => {
    if (error.code === '42P01' || error.message?.includes('schema cache')) {
        console.warn(`Aviso [${context}]: Cache ou Tabela ausente. Rode o script SQL.`);
        return { error: 'table_missing' };
    }
    console.error(`Erro [${context}]:`, error.message);
    return { error: error.message };
};

export const triggerSchemaReload = async () => {
    try {
        const { error } = await supabase.rpc('reload_schema_cache');
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
};

export const syncEquipmentToCloud = async (equipment: Equipment[]) => {
  try {
      const rows = equipment.map(eq => ({ id: eq.id, name: eq.name, data: eq }));
      const { error } = await supabase.from('equipment').upsert(rows);
      if (error) throw error;
      return { error: null };
  } catch (err: any) { return handleSupabaseError(err, 'syncEquipment'); }
};

export const syncInventoryToCloud = async (inventory: SparePart[]) => {
  try {
      const rows = inventory.map(item => ({ id: item.id, name: item.name, data: item }));
      const { error } = await supabase.from('inventory').upsert(rows);
      if (error) throw error;
      return { error: null };
  } catch (err: any) { return handleSupabaseError(err, 'syncInventory'); }
};

export const syncWorkOrdersToCloud = async (workOrders: WorkOrder[]) => {
  try {
      const rows = workOrders.map(wo => ({ id: wo.id, equipment_id: wo.equipmentId, status: wo.status, data: wo }));
      const { error } = await supabase.from('work_orders').upsert(rows);
      if (error) throw error;
      return { error: null };
  } catch (err: any) { return handleSupabaseError(err, 'syncWorkOrders'); }
};

export const syncPlansToCloud = async (plans: MaintenancePlan[]) => {
    try {
        const rows = plans.map(p => ({ id: p.id, description: p.description, equipment_type_id: p.equipmentTypeId, frequency: p.frequency, tasks: p.tasks }));
        const { error } = await supabase.from('maintenance_plans').upsert(rows);
        if (error) throw error;
        return { error: null };
    } catch (err: any) { return handleSupabaseError(err, 'syncPlans'); }
};

export const syncEquipmentTypesToCloud = async (types: EquipmentType[]) => {
    try {
        const rows = types.map(t => ({ id: t.id, description: t.description }));
        const { error } = await supabase.from('equipment_types').upsert(rows);
        if (error) throw error;
        return { error: null };
    } catch (err: any) { return handleSupabaseError(err, 'syncTypes'); }
};

export const syncSettingsToCloud = async (settings: AppSettings) => {
    try {
        const payload = { id: 'global', ...settings };
        const { error } = await supabase.from('app_settings').upsert(payload);
        if (error) throw error;
        return { error: null };
    } catch (err: any) { return handleSupabaseError(err, 'syncSettings'); }
};

export const loadFromCloud = async () => {
  try {
    const [eq, inv, wo, plans, settings, types] = await Promise.all([
      supabase.from('equipment').select('data'),
      supabase.from('inventory').select('data'),
      supabase.from('work_orders').select('data'),
      supabase.from('maintenance_plans').select('*'),
      supabase.from('app_settings').select('*').eq('id', 'global').maybeSingle(),
      supabase.from('equipment_types').select('*')
    ]);

    return {
        equipment: eq.data?.map((r: any) => r.data) || [],
        inventory: inv.data?.map((r: any) => r.data) || [],
        workOrders: wo.data?.map((r: any) => r.data) || [],
        plans: plans.data || [],
        types: types.data || [],
        settings: settings.data || null
    };
  } catch (error) {
    return null;
  }
};

// Funções de Deletar
export const deleteEquipmentFromCloud = (id: string) => supabase.from('equipment').delete().eq('id', id);
export const deleteInventoryFromCloud = (id: string) => supabase.from('inventory').delete().eq('id', id);
export const deleteWorkOrderFromCloud = (id: string) => supabase.from('work_orders').delete().eq('id', id);
export const deletePlanFromCloud = (id: string) => supabase.from('maintenance_plans').delete().eq('id', id);
export const deleteEquipmentTypeFromCloud = (id: string) => supabase.from('equipment_types').delete().eq('id', id);

export const runDiagnostics = async () => {
    const tables = ['equipment', 'inventory', 'work_orders', 'maintenance_plans', 'equipment_types', 'app_settings'];
    const results: any = {};
    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        results[t] = { status: error ? 'error' : 'ok', count: count || 0, message: error ? error.message : 'OK' };
    }
    return results;
};
