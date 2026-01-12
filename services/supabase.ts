
import { createClient } from '@supabase/supabase-js';
import { Equipment, SparePart, WorkOrder, MaintenancePlan, EquipmentType, StatusConfig } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE ---
const PROJECT_ID = 'cmihdvvfpkeyjtevkaha';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaWhkdnZmcGtleWp0ZXZrYWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDA2MDQsImV4cCI6MjA3OTIxNjYwNH0.QNBFdjqGVQUS_UTd_04QrPDvMhpCBwrw1h2TzMXKIXQ';

// Inicializa o cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true },
    global: {
        headers: { 'x-application-name': 'sistema-manutencao-v2' }
    }
});

// --- INTERFACES ---
interface AppSettings {
    maintainers: string[];
    requesters: string[];
    standard_tasks: string[];
    standard_materials: string[];
    status_config?: StatusConfig[]; 
}

// --- HELPER DE ERRO ---
const handleSupabaseError = (error: any, context: string) => {
    // Erros comuns de tabela não encontrada ou CACHE DESATUALIZADO
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST204' || error.message?.includes('schema cache')) {
        console.warn(`Aviso Supabase [${context}]: Tabela não encontrada ou Cache API desatualizado. Verifique o SQL Editor.`);
        return { error: 'table_missing' };
    }
    console.error(`Erro Supabase [${context}]:`, error.message);
    return { error: error.message };
};

// --- FUNÇÕES ESPECIAIS ---
export const triggerSchemaReload = async () => {
    if (!supabase) return { error: 'Supabase desconectado' };
    try {
        // Tenta chamar a função RPC criada pelo script de correção
        const { error } = await supabase.rpc('reload_schema_cache');
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("Erro ao recarregar schema:", e.message);
        return { error: e.message };
    }
};

// --- FUNÇÕES DE SINCRONIZAÇÃO (UPSERT) ---

export const syncEquipmentToCloud = async (equipment: Equipment[]) => {
  if (!supabase) return { error: 'Supabase não configurado' };
  try {
      const realEquipment = equipment.filter(e => e.id !== 'SYS_STATUS_CONFIG');
      const rows = realEquipment.map(eq => ({ id: eq.id, name: eq.name, data: eq }));
      const { error } = await supabase.from('equipment').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return { error: null };
  } catch (err: any) { return handleSupabaseError(err, 'syncEquipment'); }
};

export const syncInventoryToCloud = async (inventory: SparePart[]) => {
  if (!supabase) return { error: 'Supabase não configurado' };
  try {
      const rows = inventory.map(item => ({ id: item.id, name: item.name, data: item }));
      const { error } = await supabase.from('inventory').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return { error: null };
  } catch (err: any) { return handleSupabaseError(err, 'syncInventory'); }
};

export const syncWorkOrdersToCloud = async (workOrders: WorkOrder[]) => {
  if (!supabase) return { error: 'Supabase não configurado' };
  try {
      const rows = workOrders.map(wo => ({ id: wo.id, equipment_id: wo.equipmentId, status: wo.status, data: wo }));
      const { error } = await supabase.from('work_orders').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return { error: null };
  } catch (err: any) { return handleSupabaseError(err, 'syncWorkOrders'); }
};

export const syncPlansToCloud = async (plans: MaintenancePlan[]) => {
    if (!supabase) return { error: 'Supabase não configurado' };
    try {
        const rows = plans.map(plan => ({ id: plan.id, description: plan.description, equipment_type_id: plan.equipmentTypeId, frequency: plan.frequency, tasks: plan.tasks }));
        const { error } = await supabase.from('maintenance_plans').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        return { error: null };
    } catch (err: any) { return handleSupabaseError(err, 'syncPlans'); }
};

export const syncEquipmentTypesToCloud = async (types: EquipmentType[]) => {
    if (!supabase) return { error: 'Supabase não configurado' };
    try {
        const rows = types.map(t => ({ id: t.id, description: t.description }));
        const { error } = await supabase.from('equipment_types').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        return { error: null };
    } catch (err: any) { return handleSupabaseError(err, 'syncEquipmentTypes'); }
};

export const syncSettingsToCloud = async (settings: AppSettings) => {
    if (!supabase) return { error: 'Supabase não configurado' };
    try {
        const payload: any = {
            id: 'global', 
            maintainers: settings.maintainers || [],
            requesters: settings.requesters || [],
            standard_tasks: settings.standard_tasks || [],
            standard_materials: settings.standard_materials || [],
            status_config: settings.status_config || []
        };
        const { error } = await supabase.from('app_settings').upsert(payload, { onConflict: 'id' });
        if (error) {
            // Fallback resiliente para colunas novas
            if (error.message.includes("Could not find the 'status_config' column") || error.message.includes('status_config')) {
                console.warn("Supabase: Coluna 'status_config' não encontrada no cache. Salvando configurações parciais.");
                delete payload.status_config;
                const { error: retryError } = await supabase.from('app_settings').upsert(payload, { onConflict: 'id' });
                if (retryError) throw retryError;
                return { error: null };
            }
            throw error;
        }
        return { error: null };
    } catch (err: any) { return handleSupabaseError(err, 'syncSettings'); }
};

// --- FUNÇÕES DE EXCLUSÃO (DELETE) ---

export const deleteEquipmentFromCloud = async (id: string) => {
    if (!supabase) return;
    try { await supabase.from('equipment').delete().eq('id', id); } catch (e) { console.error(e); }
};

export const deleteInventoryFromCloud = async (id: string) => {
    if (!supabase) return;
    try { await supabase.from('inventory').delete().eq('id', id); } catch (e) { console.error(e); }
};

export const deleteWorkOrderFromCloud = async (id: string) => {
    if (!supabase) return;
    try { await supabase.from('work_orders').delete().eq('id', id); } catch (e) { console.error(e); }
};

export const deletePlanFromCloud = async (id: string) => {
    if (!supabase) return;
    try { await supabase.from('maintenance_plans').delete().eq('id', id); } catch (e) { console.error(e); }
};

export const deleteEquipmentTypeFromCloud = async (id: string) => {
    if (!supabase) return;
    try { await supabase.from('equipment_types').delete().eq('id', id); } catch (e) { console.error(e); }
};

// --- FUNÇÃO DE CARREGAMENTO INICIAL ---
export const loadFromCloud = async () => {
  if (!supabase) return null;

  try {
    const [eqResponse, invResponse, woResponse, plansResponse, settingsResponse, typesResponse] = await Promise.all([
      supabase.from('equipment').select('data'),
      supabase.from('inventory').select('data'),
      supabase.from('work_orders').select('data'),
      supabase.from('maintenance_plans').select('*'),
      supabase.from('app_settings').select('*').eq('id', 'global').maybeSingle(),
      supabase.from('equipment_types').select('*')
    ]);

    if (eqResponse.error) console.error("Erro equipamentos:", eqResponse.error.message);
    
    const rawEquipment = eqResponse.data ? eqResponse.data.map((row: any) => row.data) : [];
    const equipment = rawEquipment.filter((e: any) => e.id !== 'SYS_STATUS_CONFIG') as Equipment[];

    const inventory = invResponse.data ? invResponse.data.map((row: any) => row.data) as SparePart[] : [];
    const workOrders = woResponse.data ? woResponse.data.map((row: any) => row.data) as WorkOrder[] : [];

    const plans: MaintenancePlan[] = (plansResponse.data && !plansResponse.error) ? plansResponse.data.map((row: any) => ({
        id: row.id,
        description: row.description,
        equipmentTypeId: row.equipment_type_id,
        frequency: row.frequency,
        tasks: row.tasks
    })) : [];

    const types: EquipmentType[] = (typesResponse.data && !typesResponse.error) ? typesResponse.data.map((row: any) => ({
        id: row.id,
        description: row.description
    })) : [];

    let settings: AppSettings | null = null;
    if (settingsResponse.data) {
        settings = settingsResponse.data as AppSettings;
    }

    return { equipment, inventory, workOrders, plans, types, settings };
  } catch (error) {
    console.error("Erro geral no loadFromCloud:", error);
    return null;
  }
};

export const getCloudCounts = async () => {
    if (!supabase) return { equipment: 0, inventory: 0, workOrders: 0 };
    try {
        const [eq, inv, wo] = await Promise.all([
            supabase.from('equipment').select('*', { count: 'exact', head: true }),
            supabase.from('inventory').select('*', { count: 'exact', head: true }),
            supabase.from('work_orders').select('*', { count: 'exact', head: true })
        ]);
        return { equipment: eq.count || 0, inventory: inv.count || 0, workOrders: wo.count || 0 };
    } catch (e) {
        return { equipment: 0, inventory: 0, workOrders: 0 };
    }
};

// --- DIAGNÓSTICO DE BANCO DE DADOS ---
export const runDiagnostics = async () => {
    const results: any = {};
    const tables = [
        { name: 'equipment', label: 'Equipamentos' },
        { name: 'inventory', label: 'Estoque' },
        { name: 'work_orders', label: 'Ordens de Serviço' },
        { name: 'maintenance_plans', label: 'Planos' },
        { name: 'equipment_types', label: 'Tipos de Equip.' },
        { name: 'app_settings', label: 'Configurações' }
    ];

    for (const t of tables) {
        const start = performance.now();
        // Tenta um select simples com count para verificar existência e permissão
        const { count, error } = await supabase.from(t.name).select('*', { count: 'exact', head: true });
        const end = performance.now();
        
        let status = 'ok';
        let message = 'Conectado';

        if (error) {
            status = 'error';
            // Detecção de tabela faltando OU erro de cache de esquema
            if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
                message = 'Tabela não existe (ou Cache desatualizado)';
            } else {
                message = `Erro: ${error.message}`;
            }
        }

        results[t.name] = {
            label: t.label,
            status: status,
            message: message,
            count: count || 0,
            latency: Math.round(end - start)
        };
    }
    return results;
};
