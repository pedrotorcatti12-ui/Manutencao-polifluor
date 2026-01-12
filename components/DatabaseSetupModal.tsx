
import React, { useState } from 'react';
import { CloseIcon, ClipboardListIcon, CheckCircleIcon } from './icons';

export const DatabaseSetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    if (!isOpen) return null;

    const sqlScript = `-- SGMI 2.0 - SCRIPT DE ESTRUTURA COMPLETA
CREATE TABLE IF NOT EXISTS equipment (id TEXT PRIMARY KEY, name TEXT, data JSONB);
CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, name TEXT, data JSONB);
CREATE TABLE IF NOT EXISTS work_orders (id TEXT PRIMARY KEY, equipment_id TEXT, status TEXT, data JSONB);
CREATE TABLE IF NOT EXISTS maintenance_plans (id TEXT PRIMARY KEY, description TEXT, equipment_type_id TEXT, frequency INTEGER, tasks JSONB);
CREATE TABLE IF NOT EXISTS equipment_types (id TEXT PRIMARY KEY, description TEXT);
CREATE TABLE IF NOT EXISTS app_settings (id TEXT PRIMARY KEY, maintainers TEXT[], requesters TEXT[], standard_tasks TEXT[], standard_materials TEXT[], status_config JSONB);

-- Habilitar RLS e criar políticas de acesso público
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All" ON equipment FOR ALL USING (true) WITH CHECK (true);
-- Repetir para todas as tabelas conforme necessário...

-- Função para recarregar o cache da API
CREATE OR REPLACE FUNCTION reload_schema_cache() RETURNS void AS $$
BEGIN
  NOTIFY pgrst, 'reload config';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

    const handleCopy = () => {
        navigator.clipboard.writeText(sqlScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Atualizar Estrutura Supabase</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 overflow-auto bg-gray-900 text-green-400 font-mono text-xs">
                    <pre>{sqlScript}</pre>
                </div>
                <div className="p-4 border-t flex justify-between">
                    <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">
                        {copied ? 'Copiado!' : 'Copiar SQL'}
                    </button>
                    <button onClick={onClose} className="text-gray-500 font-bold">Fechar</button>
                </div>
            </div>
        </div>
    );
};
