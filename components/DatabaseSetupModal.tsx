
import React, { useState } from 'react';
import { CloseIcon, ClipboardListIcon, CheckCircleIcon } from './icons';

interface DatabaseSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const sqlScript = `-- SCRIPT DE CORREÇÃO ESTRUTURAL E CACHE - SGMI 2.0
-- Execute este script completo no SQL Editor do Supabase.

-- 1. CRIAÇÃO DAS TABELAS ESSENCIAIS
CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT,
    data JSONB
);

CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT,
    data JSONB
);

CREATE TABLE IF NOT EXISTS work_orders (
    id TEXT PRIMARY KEY,
    equipment_id TEXT,
    status TEXT,
    data JSONB
);

CREATE TABLE IF NOT EXISTS maintenance_plans (
    id TEXT PRIMARY KEY,
    description TEXT,
    equipment_type_id TEXT,
    frequency INTEGER,
    tasks JSONB
);

CREATE TABLE IF NOT EXISTS equipment_types (
    id TEXT PRIMARY KEY,
    description TEXT
);

CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY,
    maintainers TEXT[],
    requesters TEXT[],
    standard_tasks TEXT[],
    standard_materials TEXT[],
    status_config JSONB
);

-- 2. HABILITAR SEGURANÇA (RLS)
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS DE ACESSO (PERMISSÃO TOTAL P/ APP)
DROP POLICY IF EXISTS "Public Access Equipment" ON equipment;
CREATE POLICY "Public Access Equipment" ON equipment FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Inventory" ON inventory;
CREATE POLICY "Public Access Inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access WorkOrders" ON work_orders;
CREATE POLICY "Public Access WorkOrders" ON work_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Plans" ON maintenance_plans;
CREATE POLICY "Public Access Plans" ON maintenance_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Types" ON equipment_types;
CREATE POLICY "Public Access Types" ON equipment_types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Settings" ON app_settings;
CREATE POLICY "Public Access Settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- 4. FUNÇÃO PARA RECARREGAR CACHE PELO APP (RPC)
CREATE OR REPLACE FUNCTION reload_schema_cache()
RETURNS void AS $$
BEGIN
  NOTIFY pgrst, 'reload config';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FORÇAR ATUALIZAÇÃO IMEDIATA
NOTIFY pgrst, 'reload config';
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(sqlScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reparar Estrutura e Cache</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Execute este script para garantir que a API reconheça todas as tabelas.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-0 flex-1 overflow-hidden relative group bg-gray-900">
                    <pre className="w-full h-full p-6 overflow-auto text-xs font-mono text-green-400 leading-relaxed custom-scrollbar">
                        {sqlScript}
                    </pre>
                    <button 
                        onClick={handleCopy} 
                        className="absolute top-4 right-4 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
                    >
                        {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ClipboardListIcon className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar SQL'}
                    </button>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg flex justify-between items-center">
                    <span className="text-xs text-gray-500 italic">Cole no "SQL Editor" do Supabase e clique em "Run". Isso corrige o erro de tabela não encontrada.</span>
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
