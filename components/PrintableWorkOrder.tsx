
import React from 'react';
import { FlatTask, MaintenanceType, TaskDetail } from '../types';

interface PrintableWorkOrderProps {
  taskData: FlatTask;
  editedOsNumber: string;
  partReplaced?: 'Sim' | 'Não' | '';
  purchasingInvolved?: 'Sim' | 'Não' | '';
  logoUrl?: string;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined; colSpan?: number }> = ({ label, value, colSpan = 1 }) => (
    <div style={{ gridColumn: `span ${colSpan}` }}>
        <div className="text-xs font-bold uppercase">{label}</div>
        <div className="border-b border-black text-sm pb-1">{value || '\u00A0'}</div>
    </div>
);

const CheckboxDisplay: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
            {checked && <span className="text-xs font-bold -mt-0.5">X</span>}
        </div> 
        {label}
    </div>
);

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({ taskData, editedOsNumber, partReplaced, purchasingInvolved, logoUrl }) => {
  const { equipment, task } = taskData;
  const isPredictive = task.type === MaintenanceType.Predictive;
  
  // Título Dinâmico conforme solicitado
  const mainTitle = isPredictive 
    ? "Ordem de Serviço de manutenção PREDITIVA"
    : "Ordem de Serviço de manutenção Preventiva";

  const effectiveChecklist: TaskDetail[] = (equipment.individualChecklist && equipment.individualChecklist.length > 0)
    ? equipment.individualChecklist
    : (task.details && task.details.length > 0 ? task.details : []);

  const logoContent = logoUrl
    ? <img src={logoUrl} alt="Logo Polifluor" className="h-12" />
    : (
        <div className="w-48 h-12 bg-red-600 flex items-center justify-center p-1">
            <span className="text-white font-bold text-lg" style={{ letterSpacing: '0.15em' }}>POLIFLUOR</span>
        </div>
      );

  return (
    <div className="p-8 bg-white text-black font-sans relative" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <header className="flex items-start justify-between pb-4">
            {logoContent}
            <div className="text-center flex-1">
                <h1 className="text-xl font-bold uppercase">{mainTitle}</h1>
                <p className="text-sm">Documento para preenchimento em campo</p>
            </div>
            <div className="w-48 text-right">
                <div className="text-xs font-bold uppercase">Código Formulário</div>
                <div className="text-xs">FO-091 REV.02</div>
            </div>
        </header>

        <section className="border-2 border-black p-1">
            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                <InfoRow label="N° O.S.:" value={editedOsNumber} />
                <InfoRow label="Mês Referência:" value={`${task.month}/${task.year}`} colSpan={3}/>
                <InfoRow label="Tipo de Manutenção:" value={task.type || 'N/A'} colSpan={2} />
                <InfoRow label="Equipamento Crítico:" value={equipment.isKeyEquipment ? 'SIM (Prioridade Alta)' : 'NÃO'} colSpan={2} />
                <InfoRow label="Equipamento (ID):" value={equipment.id} />
                <InfoRow label="Nome / Descrição:" value={equipment.name} colSpan={3} />
                <InfoRow label="Localização da Máquina:" value={equipment.location} colSpan={4}/>
            </div>
        </section>

        <section className="mt-4">
            <h2 className="text-md font-bold mb-1">Checklist de Verificação (Procedimento)</h2>
            <table className="w-full border-collapse border-2 border-black">
                <thead>
                    <tr className="bg-blue-800 text-white text-sm">
                        <th className="border border-black p-1 w-12">Item</th>
                        <th className="border border-black p-1 text-left">Tarefa / Verificação Técnica</th>
                        <th className="border border-black p-1 w-12">OK</th>
                        <th className="border border-black p-1 w-12">NOK</th>
                        <th className="border border-black p-1 text-left">Observações Técnicas</th>
                    </tr>
                </thead>
                <tbody>
                    {effectiveChecklist.map((detail, index) => (
                         <tr key={index} className="text-sm">
                            <td className="border border-black p-1 text-center font-bold">{index + 1}</td>
                            <td className="border border-black p-1">{detail.action}</td>
                            <td className="border border-black p-1 text-center"><div className="w-4 h-4 border border-black mx-auto"></div></td>
                            <td className="border border-black p-1 text-center"><div className="w-4 h-4 border border-black mx-auto"></div></td>
                            <td className="border border-black p-1 h-8"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        <section className="mt-4 flex-1">
            <div className="font-bold text-md">Observações Gerais / Relatório de Execução:</div>
            <div className="border-2 border-black h-40 mt-1"></div>
        </section>

        <footer className="mt-8 text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                <div>
                    <p>Início Real: &nbsp; ____/____/________ &nbsp;&nbsp; ____:____</p>
                    <p className="mt-2">Término Real: ____/____/________ &nbsp;&nbsp; ____:____</p>
                </div>
                 <div className="flex items-center gap-4">
                    <span>Aprovado Gestão:</span>
                    <CheckboxDisplay label="Sim" checked={false} />
                    <CheckboxDisplay label="Não" checked={false} />
                </div>
                 <div className="text-center">
                    <div className="border-t border-black pt-1 font-bold">EXECUTADO POR (ASSINATURA)</div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-1 font-bold">VISTO ENCARREGADO / MANUTENÇÃO</div>
                </div>
            </div>
            
            {/* Registro de Emissão conforme solicitado */}
            <div className="mt-12 pt-2 border-t border-gray-300 flex justify-between items-center text-[10px] italic text-gray-500">
                <span>Documento emitido via SGMI 2.0 (Sistema de Gestão de Manutenção Inteligente)</span>
                <span>Impressão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
        </footer>
    </div>
  );
};