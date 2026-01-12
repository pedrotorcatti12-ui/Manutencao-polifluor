
import React, { useState } from 'react';
import { CloseIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface WorkOrderFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: (osNumbers: string[]) => { found: number, notFound: string[] };
}

export const WorkOrderFieldModal: React.FC<WorkOrderFieldModalProps> = ({ isOpen, onClose, onProcess }) => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<{ found: number, notFound: string[] } | null>(null);

    if (!isOpen) return null;

    const handleProcess = () => {
        // Separa por vírgula, quebra de linha ou espaço
        const ids = inputText.split(/[\n, ]+/).map(s => s.trim()).filter(s => s !== '');
        
        if (ids.length === 0) {
            alert("Por favor, digite pelo menos um número de O.S.");
            return;
        }

        const res = onProcess(ids);
        setResult(res);
    };

    const handleReset = () => {
        setResult(null);
        setInputText('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Registrar Saída para Campo</h2>
                            <p className="text-xs text-gray-500 font-medium">Informe as O.S. que foram impressas ontem.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-5 h-5"/></button>
                </div>

                <div className="p-6">
                    {!result ? (
                        <>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Números das Ordens de Serviço:
                            </label>
                            <textarea 
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                className="w-full h-32 form-input font-mono text-sm"
                                placeholder="Ex: 0045, 0046, 0050&#10;Ou cole uma lista aqui..."
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                O sistema irá marcar estas ordens como "EM CAMPO" (Documento Impresso), garantindo a rastreabilidade física.
                            </p>
                            
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                                <button onClick={handleProcess} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-lg shadow-md transition-colors uppercase tracking-wider">
                                    Processar Lote
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">Atualização Concluída!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                <strong>{result.found}</strong> ordens foram localizadas e marcadas como "Em Campo".
                            </p>

                            {result.notFound.length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6 text-left">
                                    <div className="flex items-center gap-2 mb-2 text-yellow-800 dark:text-yellow-400 font-bold text-xs uppercase">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Não encontradas ({result.notFound.length}):
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.notFound.map(id => (
                                            <span key={id} className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono border border-yellow-200 dark:border-yellow-800 text-gray-600 dark:text-gray-400">
                                                {id}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={handleReset} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase hover:bg-gray-800 transition-colors">
                                Fechar e Atualizar Lista
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
