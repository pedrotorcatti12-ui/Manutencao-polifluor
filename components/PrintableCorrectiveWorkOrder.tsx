

// components/PrintableCorrectiveWorkOrder.tsx
import React from 'react';
import { FlatTask, MaintenanceType } from '../types';

interface PrintableCorrectiveWorkOrderProps {
  taskData: FlatTask;
  osNumber: string;
  logoUrl?: string;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined; colSpan?: number }> = ({ label, value, colSpan = 1 }) => (
    <div style={{ gridColumn: `span ${colSpan}` }}>
        <div className="text-xs font-bold uppercase text-gray-700">{label}</div>
        <div className="border-b border-black text-sm pb-1 h-6">{value || '\u00A0'}</div>
    </div>
);

const CheckboxDisplay: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
            {checked && <span className="text-xs font-bold -mt-0.5">X</span>}
        </div> 
        <span className="text-sm">{label}</span>
    </div>
);

export const PrintableCorrectiveWorkOrder: React.FC<PrintableCorrectiveWorkOrderProps> = ({ taskData, osNumber, logoUrl }) => {
    const { equipment, task } = taskData;
    const printDate = new Date(); 
    
    // Determine the Requisition Date (Prefer explicitly saved requestDate, else startDate, else printDate)
    const requestDate = task.requestDate ? new Date(task.requestDate) : (task.startDate ? new Date(task.startDate) : printDate);
    
    // Start Date (Actual work start)
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const endDate = task.endDate ? new Date(task.endDate) : null;

    const logoContent = logoUrl
    ? <img src={logoUrl} alt="Logo Polifluor" className="h-12" />
    : (
        <div className="w-48 h-12 bg-red-600 flex items-center justify-center p-1">
            <span className="text-white font-bold text-lg" style={{ letterSpacing: '0.15em' }}>POLIFLUOR</span>
        </div>
      );
      
    const maintenanceTypesCheckboxes = (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <CheckboxDisplay label="Mecânica" checked={task.correctiveCategory === 'Mecânica'} />
            <CheckboxDisplay label="Elétrica" checked={task.correctiveCategory === 'Elétrica'} />
            <CheckboxDisplay label="Predial" checked={task.correctiveCategory === 'Predial'} />
            <CheckboxDisplay label="Outros" checked={!['Mecânica', 'Elétrica', 'Predial'].includes(task.correctiveCategory || '')} />
        </div>
    );

  return (
    <div className="p-8 bg-white text-black font-sans" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
            <header className="flex items-start justify-between pb-4">
                {logoContent}
                <div className="text-center">
                    <h1 className="text-xl font-bold">ORDEM DE SERVIÇO - MANUTENÇÃO CORRETIVA</h1>
                    <p className="text-sm">Documento para preenchimento em campo</p>
                </div>
                <div className="w-48 text-right">
                    <div className="text-xs font-bold uppercase">Nº O.S.</div>
                    <div className="border-b-2 border-black text-lg pb-1 font-semibold">{osNumber || '\u00A0'}</div>
                </div>
            </header>

            {/* Informações da Solicitação */}
            <section className="border-2 border-black p-2">
                 <div className="grid grid-cols-4 gap-x-4 gap-y-3 mb-2">
                    <div className="col-span-4 font-bold text-sm">CATEGORIA / TIPO DA FALHA:</div>
                    <div className="col-span-4">{maintenanceTypesCheckboxes}</div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-300 pt-2">
                    <InfoRow label="Data Solicitação:" value={requestDate.toLocaleDateString('pt-BR')} />
                    <InfoRow label="Hora Solicitação:" value={requestDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} />
                    <InfoRow label="Solicitante:" value={task.requester} />
                    <InfoRow label="Setor/Área:" value={equipment.location} />
                    <InfoRow label="Equipamento (ID):" value={equipment.id} />
                    <InfoRow label="Nome:" value={equipment.name} />
                </div>
                 <div className="flex items-center gap-4 mt-3">
                    <span className="font-bold text-sm">Equipamento parado?</span>
                    <CheckboxDisplay label="Sim" checked={true} />
                    <CheckboxDisplay label="Não" checked={false} />
                </div>
            </section>

            {/* Ocorrência e Execução */}
            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">O Que Ocorreu? (Descrição da Falha)</h2>
                <div className="border-2 border-black p-2 min-h-[80px] text-sm">{task.description}</div>
            </section>

            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Execução do Serviço</h2>
                <div className="border-2 border-black p-2">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-2">
                         <InfoRow label="Executante:" value={task.maintainer?.name} />
                         <InfoRow label="Início Real:" value={startDate ? startDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''} />
                         <InfoRow label="Término Real:" value={endDate ? endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''} />
                    </div>
                    <div className="text-xs font-bold uppercase text-gray-700">Serviço executado:</div>
                    <div className="border border-black bg-gray-50 h-24 mt-1"></div>
                </div>
            </section>
            
            {/* Peças e Compras */}
            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Peças / Materiais Substituídos ou Utilizados</h2>
                <div className="border-2 border-black min-h-[100px] p-2 text-sm">
                    {/* Listagem de Estoque e Compras */}
                    {(task.materialsUsed?.length || 0) + (task.purchaseRequests?.length || 0) > 0 ? (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left font-bold border-b border-gray-400">
                                    <th className="w-20">Tipo</th>
                                    <th>Item / Descrição</th>
                                    <th className="w-16 text-center">Qtd</th>
                                    <th className="w-24 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {task.materialsUsed?.map((mat, i) => (
                                    <tr key={`mat-${i}`} className="border-b border-gray-200">
                                        <td>ESTOQUE</td>
                                        <td>{mat.partName}</td>
                                        <td className="text-center">{mat.quantity}</td>
                                        <td className="text-right">BAIXADO</td>
                                    </tr>
                                ))}
                                {task.purchaseRequests?.map((req, i) => (
                                    <tr key={`req-${i}`} className="border-b border-gray-200">
                                        <td>COMPRA</td>
                                        <td>{req.itemDescription}</td>
                                        <td className="text-center">1</td>
                                        <td className="text-right">{req.status.toUpperCase()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-400 italic text-xs text-center mt-4">Nenhum material registrado no sistema.</p>
                    )}
                </div>
            </section>

            {/* Novo Relatório de Tempos (Solicitado) */}
            <section className="mt-4 border border-gray-400 p-2 bg-gray-100 text-xs">
                <h3 className="font-bold border-b border-gray-300 pb-1 mb-1">REGISTRO DE TEMPOS (SISTEMA)</h3>
                <div className="flex justify-between">
                    <div>
                        <span className="font-bold">CADASTRO: </span> 
                        {requestDate.toLocaleDateString('pt-BR')} às {requestDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>
                        <span className="font-bold">BAIXA (CONCLUSÃO): </span> 
                        {endDate ? `${endDate.toLocaleDateString('pt-BR')} às ${endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}` : '____________________'}
                    </div>
                    <div>
                        <span className="font-bold">TEMPO TOTAL: </span>
                        {task.manHours ? `${task.manHours.toFixed(2)}h` : '_______'}
                    </div>
                </div>
            </section>

            {/* Aprovação */}
            <footer className="mt-6 text-sm">
                <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                    <div className="text-center">
                        <div className="border-t-2 border-black pt-1">Executado por (Nome e Assinatura)</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t-2 border-black pt-1">Visto (Manutenção)</div>
                    </div>
                </div>
            </footer>

            <div className="text-right text-xs mt-4 pr-1">FO 005 Rev.2</div>
        </div>

        {/* Canhoto Destacável */}
        <div className="flex-shrink-0">
            <hr className="border-dashed border-black my-4" />
            <div className="p-2 border border-black">
                 <header className="flex items-center justify-between pb-2">
                    {logoContent}
                    <div className="text-center">
                        <h1 className="text-md font-bold">ORDEM DE SERVIÇO MANUTENÇÃO</h1>
                    </div>
                    <div className="w-32 text-right">
                        <div className="text-xs font-bold">Nº</div>
                        <div className="border-b border-black text-sm pb-1 font-semibold">{osNumber || '\u00A0'}</div>
                    </div>
                </header>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                    <InfoRow label="Equipamento / Máquina:" value={equipment.name} />
                    <InfoRow label="Data Solicitada:" value={requestDate.toLocaleDateString('pt-BR')} />
                    <div className="col-span-2">{maintenanceTypesCheckboxes}</div>
                </div>
            </div>
            <div className="text-right text-xs mt-1 pr-1">FO 005 Rev.2</div>
        </div>

    </div>
  );
};