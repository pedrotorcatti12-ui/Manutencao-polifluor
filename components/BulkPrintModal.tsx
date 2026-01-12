
import React, { useState, useRef, useEffect } from 'react';
import { FlatTask } from '../types';
import { CloseIcon, DownloadIcon, ArrowPathIcon, CheckCircleIcon, ClipboardListIcon, DocumentTextIcon } from './icons';
import { PrintableWorkOrder } from './PrintableWorkOrder';
import { PrintableCorrectiveWorkOrder } from './PrintableCorrectiveWorkOrder';

declare const html2canvas: any;
declare const window: any;

interface BulkPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: FlatTask[];
    documentType: 'Preventive' | 'Predictive' | 'Corrective';
}

export const BulkPrintModal: React.FC<BulkPrintModalProps> = ({ isOpen, onClose, tasks, documentType }) => {
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isError, setIsError] = useState(false);
    const [copied, setCopied] = useState(false);
    const renderRef = useRef<HTMLDivElement>(null);
    const pdfDoc = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(-1);
            setProgress(0);
            setIsFinished(false);
            setIsError(false);
            setCopied(false);
        }
    }, [isOpen]);

    const startProcess = async () => {
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('Bibliotecas de impressão não carregadas. Verifique a internet.');
            return;
        }
        const { jsPDF } = window.jspdf;
        pdfDoc.current = new jsPDF('p', 'mm', 'a4');
        setCurrentIndex(0);
        processNext(0);
    };

    const processNext = async (index: number) => {
        if (index >= tasks.length) {
            finishProcess();
            return;
        }
        setTimeout(async () => {
            try {
                const element = renderRef.current;
                if (!element) throw new Error("Falha no renderizador");
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
                const imgData = canvas.toDataURL('image/png');
                const pdf = pdfDoc.current;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                if (index > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                const nextIdx = index + 1;
                setCurrentIndex(nextIdx);
                setProgress(Math.round((nextIdx / tasks.length) * 100));
                processNext(nextIdx);
            } catch (err) {
                console.error("Erro no lote:", err);
                setIsError(true);
            }
        }, 300);
    };

    const finishProcess = () => {
        const fileName = `LOTE_${documentType.toUpperCase()}_${new Date().getTime()}.pdf`;
        pdfDoc.current.save(fileName);
        setIsFinished(true);
    };

    const copyEmailTemplate = () => {
        const dateStr = new Date().toLocaleDateString('pt-BR');
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const osNumbers = tasks.map(t => `#${t.task.osNumber || 'S/N'}`).join(', ');
        const criticalCount = tasks.filter(t => t.equipment.isKeyEquipment).length;

        const body = `Assunto: [SGMI 2.0] Protocolo de Emissão de O.S. em Lote – ${dateStr}

Prezados,

Formalizamos a emissão via SGMI 2.0 de um lote contendo ${tasks.length} Ordens de Serviço para execução em campo.

Este e-mail serve como protocolo digital de rastreabilidade (IATF 16949).

Detalhes do Lote:
- Data/Hora: ${dateStr} às ${timeStr}
- Total de Documentos: ${tasks.length} unidades
- Ativos Críticos no Lote: ${criticalCount}
- Relação de O.S.: ${osNumbers}

Instruções:
1. Preenchimento obrigatório de Início/Término Real e Checklist.
2. Status atualizado para "EM CAMPO" no sistema.

Atenciosamente,
Gestão de Manutenção SGMI 2.0
Polifluor - Tecnologia em Fluorpolímeros`;

        navigator.clipboard.writeText(body);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    {!isFinished && !isError && currentIndex === -1 && (
                        <>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardListIcon className="w-8 h-8"/>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Preparar Lote</h2>
                            <p className="text-sm text-gray-500 mb-6">Você selecionou <strong>{tasks.length} documentos</strong> para imprimir. Deseja gerar o arquivo unificado?</p>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Cancelar</button>
                                <button onClick={startProcess} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-all">Iniciar Geração</button>
                            </div>
                        </>
                    )}

                    {currentIndex >= 0 && !isFinished && !isError && (
                        <div className="py-8">
                            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
                            <h3 className="text-lg font-black text-gray-900 uppercase">Processando...</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Documento {currentIndex + 1} de {tasks.length}</p>
                            <div className="mt-8 w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-[10px] font-black text-blue-600 mt-2">{progress}% CONCLUÍDO</p>
                        </div>
                    )}

                    {isFinished && (
                        <div className="py-6 animate-fade-in space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircleIcon className="w-10 h-10"/>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase">Lote Gerado!</h3>
                            <p className="text-sm text-gray-500">O arquivo PDF foi baixado. Agora, formalize a entrega para a equipe:</p>
                            
                            <button 
                                onClick={copyEmailTemplate} 
                                className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-md ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-blue-700 border-2 border-blue-100 hover:bg-blue-100'}`}
                            >
                                <DocumentTextIcon className="w-4 h-4"/>
                                {copied ? 'Copiado para o ClipBoard!' : 'Copiar Protocolo para E-mail'}
                            </button>

                            <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase opacity-80 hover:opacity-100 transition-all">Concluir e Sair</button>
                        </div>
                    )}

                    {isError && (
                        <div className="py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CloseIcon className="w-10 h-10"/>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase">Erro Crítico</h3>
                            <p className="text-sm text-gray-500 mb-8">Falha de memória ou renderização. Tente um lote menor.</p>
                            <button onClick={onClose} className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase">Fechar</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed top-[10000px] left-0 pointer-events-none opacity-0">
                <div ref={renderRef} className="bg-white" style={{ width: '210mm' }}>
                    {currentIndex >= 0 && currentIndex < tasks.length && (
                        documentType === 'Corrective' ? (
                            <PrintableCorrectiveWorkOrder taskData={tasks[currentIndex]} osNumber={tasks[currentIndex].task.osNumber || '0000'} />
                        ) : (
                            <PrintableWorkOrder taskData={tasks[currentIndex]} editedOsNumber={tasks[currentIndex].task.osNumber || '0000'} />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
