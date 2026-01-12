
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PrintJob } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { DocumentTextIcon, UsersIcon, ChartIcon, SearchIcon, ArrowPathIcon } from '../components/icons';

// Mock Data inicial para demonstração
const initialPrintJobs: PrintJob[] = [
    { id: '1', jobName: 'Relatório_Mensal.pdf', user: 'carlos.silva', computer: 'ADM-PC-01', printer: 'HP LaserJet P1102w (Produção)', pages: 15, submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Printed', cost: 1.50 },
    { id: '2', jobName: 'OS_Manutencao_Prev.docx', user: 'joao.tecnico', computer: 'MANUT-01', printer: 'Brother MFC-L2740', pages: 2, submittedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'Printed', cost: 0.20 },
    { id: '3', jobName: 'Nota_Fiscal_9923.pdf', user: 'ana.compras', computer: 'FIN-PC-03', printer: 'HP LaserJet P1102w (Produção)', pages: 1, submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'Printed', cost: 0.10 },
    { id: '4', jobName: 'Apostila_Treinamento.pdf', user: 'marcos.rh', computer: 'RH-PC-01', printer: 'Brother MFC-L2740', pages: 45, submittedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(), status: 'Printed', cost: 4.50 },
    { id: '5', jobName: 'Meme_Gato.jpg', user: 'estagiario', computer: 'PROD-PC-05', printer: 'Brother MFC-L2740', pages: 1, submittedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), status: 'Printed', cost: 0.50 }, // Custo maior por ser img
    { id: '6', jobName: 'Planta_Baixa_Galpao.cad', user: 'eng.roberto', computer: 'ENG-CAD-01', printer: 'Plotter HP', pages: 1, submittedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(), status: 'Printed', cost: 15.00 },
];

export const PrintAuditPage: React.FC = () => {
    const [jobs, setJobs] = useState<PrintJob[]>(initialPrintJobs);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [costPerPage, setCostPerPage] = useState(0.10); // Custo padrão por página

    const filteredJobs = useMemo(() => {
        const term = debouncedSearchTerm.toLowerCase();
        return jobs.filter(job => 
            job.user.toLowerCase().includes(term) ||
            job.jobName.toLowerCase().includes(term) ||
            job.computer.toLowerCase().includes(term) ||
            job.printer.toLowerCase().includes(term)
        ).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [jobs, debouncedSearchTerm]);

    const stats = useMemo(() => {
        const totalPages = filteredJobs.reduce((acc, job) => acc + job.pages, 0);
        const totalCost = filteredJobs.reduce((acc, job) => acc + (job.cost || (job.pages * costPerPage)), 0);
        
        // Top User
        const userCounts: Record<string, number> = {};
        filteredJobs.forEach(job => userCounts[job.user] = (userCounts[job.user] || 0) + job.pages);
        const topUser = Object.entries(userCounts).sort((a,b) => b[1] - a[1])[0];

        return { totalPages, totalCost, topUser: topUser ? { name: topUser[0], pages: topUser[1] } : null };
    }, [filteredJobs, costPerPage]);

    return (
        <div className="space-y-6">
            <Header 
                title="Auditoria de Impressão (Print Audit)" 
                subtitle="Monitore o uso de impressoras, custos e identifique gargalos ou desperdícios na rede." 
                actions={
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-bold uppercase">
                        <ArrowPathIcon className="w-4 h-4" /> Atualizar Logs
                    </button>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><DocumentTextIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Páginas (Hoje)</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalPages}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full"><ChartIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Custo Estimado</p>
                        <p className="text-2xl font-black text-green-600">R$ {stats.totalCost.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><UsersIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Maior Utilizador</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[150px]">{stats.topUser ? stats.topUser.name : '-'}</p>
                        <p className="text-xs text-gray-400">{stats.topUser ? `${stats.topUser.pages} págs` : ''}</p>
                    </div>
                </div>
            </div>

            {/* Tabela de Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        Registro de Spooler (Em Tempo Real)
                    </h3>
                    <div className="relative w-full md:w-auto md:min-w-[300px]">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Filtrar por usuário, arquivo ou PC..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-input pl-9 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3 text-left">Data/Hora</th>
                                <th className="px-6 py-3 text-left">Usuário / Computador</th>
                                <th className="px-6 py-3 text-left">Documento</th>
                                <th className="px-6 py-3 text-left">Impressora</th>
                                <th className="px-6 py-3 text-center">Páginas</th>
                                <th className="px-6 py-3 text-right">Custo Est.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredJobs.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        {new Date(job.submittedAt).toLocaleDateString()} <span className="text-gray-400 text-xs">{new Date(job.submittedAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600 dark:text-blue-400">{job.user}</div>
                                        <div className="text-xs text-gray-400 font-mono">{job.computer}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800 dark:text-white truncate max-w-[200px]" title={job.jobName}>
                                            {job.jobName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {job.printer}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold">
                                        {job.pages}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                                        R$ {(job.cost || (job.pages * costPerPage)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {filteredJobs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                                        Nenhum registro de impressão encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Como configurar:</strong> Instale o agente Windows "PrintMonitor" nos PCs clientes para popular esta tabela automaticamente.
                </div>
            </div>
        </div>
    );
};
