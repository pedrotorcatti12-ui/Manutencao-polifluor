// components/CorrectiveRequestModal.tsx
import React, { useState } from 'react';
import { Equipment } from '../types';
import { CloseIcon } from './icons';

interface CorrectiveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (equipmentId: string, description: string, requester: string, priority: 'Alta' | 'Média' | 'Baixa', osNumber: string) => void;
    equipmentList: Equipment[];
    requesters: string[];
}

export const CorrectiveRequestModal: React.FC<CorrectiveRequestModalProps> = ({
    isOpen, onClose, onCreate, equipmentList, requesters
}) => {
    const [equipmentId, setEquipmentId] = useState('');
    const [description, setDescription] = useState('');
    const [requester, setRequester] = useState('');
    const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
    const [osNumber, setOsNumber] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipmentId || !description || !requester) {
            setError('Todos os campos marcados com * são obrigatórios.');
            return;
        }
        onCreate(equipmentId, description, requester, priority, osNumber);
        // Reset form for next time
        setEquipmentId('');
        setDescription('');
        setRequester('');
        setPriority('Média');
        setOsNumber('');
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <CloseIcon />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Solicitação de Manutenção Corretiva</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Descreva o problema encontrado para que a equipe de manutenção possa agir.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Equipamento *</label>
                        <select value={equipmentId} onChange={e => setEquipmentId(e.target.value)} required className="mt-1 w-full form-input">
                            <option value="" disabled>Selecione o equipamento com problema...</option>
                            {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Descrição do Problema *</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 w-full form-input" placeholder="Ex: Equipamento não liga, vazamento de óleo, ruído estranho..."/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium">Solicitante *</label>
                            <select value={requester} onChange={e => setRequester(e.target.value)} required className="mt-1 w-full form-input">
                                <option value="">Selecione...</option>
                                {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium">Nº O.S.</label>
                           <input type="text" value={osNumber} onChange={e => setOsNumber(e.target.value)} className="mt-1 w-full form-input" placeholder="Opcional"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Prioridade</label>
                        <select value={priority} onChange={e => setPriority(e.target.value as any)} className="mt-1 w-full form-input">
                            <option>Baixa</option>
                            <option>Média</option>
                            <option>Alta</option>
                        </select>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
                
                <div className="flex justify-end space-x-3 mt-8">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700">Criar Solicitação</button>
                </div>
            </form>
        </div>
    );
};