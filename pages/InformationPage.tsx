
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { 
    ShieldCheckIcon, ChartIcon, WrenchIcon, LightBulbIcon, ClockIcon, 
    UsersIcon, CheckCircleIcon, ArrowRightIcon, RefreshIcon, 
    HomeIcon, ScheduleIcon, PackageIcon, InventoryIcon, ClipboardListIcon,
    DocumentTextIcon, SearchIcon, SettingsIcon, ExclamationTriangleIcon,
    ArrowPathIcon
} from '../components/icons';

// --- UI COMPONENTS ---

const ROICard: React.FC<{ label: string; value: string; description: string; color: string }> = ({ label, value, description, color }) => (
    <div className={`p-5 rounded-2xl border-l-8 ${color} bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white my-1">{value}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight font-medium uppercase">{description}</p>
    </div>
);

// --- MAIN PAGE ---

export const InformationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'roi' | 'tutorial' | 'norms' | 'comparison'>('roi');

    const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-black text-[11px] uppercase tracking-wider transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === id 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <Header
                title="Documentação e ROI"
                subtitle="Justificativa financeira e manual de operação do sistema."
            />

            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar mb-8">
                <TabButton id="roi" label="Resumo Financeiro (ROI)" icon={<ChartIcon className="w-4 h-4"/>} />
                <TabButton id="comparison" label="Digital vs Manual" icon={<RefreshIcon className="w-4 h-4"/>} />
                <TabButton id="tutorial" label="Manual do Usuário" icon={<LightBulbIcon className="w-4 h-4"/>} />
                <TabButton id="norms" label="Normas Técnicas" icon={<ShieldCheckIcon className="w-4 h-4"/>} />
            </div>

            {activeTab === 'roi' && (
                <div className="animate-fade-in space-y-6">
                    {/* Resumo Numérico Direto */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Estudo de Viabilidade Econômica</h2>
                                <p className="text-gray-500 text-sm font-bold uppercase mt-1">Base: 60 O.S./Mês | 3 Mantenedores | Alta Confiabilidade</p>
                            </div>
                            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                Payback Estimado: Imediato
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <ROICard label="HH Recuperado (Técnico)" value="120 Horas" description="Eliminação de burocracia de campo" color="border-blue-500" />
                            <ROICard label="HH Recuperado (Gestão)" value="120 Horas" description="Cálculo automático de KPIs/Excel" color="border-indigo-500" />
                            <ROICard label="Economia Financeira" value="R$ 16.270" description="Redução total de desperdício anual" color="border-emerald-500" />
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Detalhamento dos Ganhos (Perspectiva de Poucas Falhas)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-[10px] text-gray-400 uppercase font-black border-b border-gray-200 pb-2">
                                            <th className="pb-3">Categoria</th>
                                            <th className="pb-3">Impacto no Processo</th>
                                            <th className="pb-3 text-right">Ganho Anual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        <tr>
                                            <td className="py-4 font-bold text-gray-700 dark:text-gray-200">Produtividade Técnica</td>
                                            <td className="py-4 text-gray-500">Técnico deixa de gastar 10 min/OS com papel e assinaturas.</td>
                                            <td className="py-4 text-right font-mono font-bold text-blue-600">R$ 5.400,00</td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 font-bold text-gray-700 dark:text-gray-200">Eficiência de Gestão</td>
                                            <td className="py-4 text-gray-500">Fim da digitação manual de 60 folhas/mês para gerar MTTR/MTBF.</td>
                                            <td className="py-4 text-right font-mono font-bold text-blue-600">R$ 10.200,00</td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 font-bold text-gray-700 dark:text-gray-200">Insumos Diretos</td>
                                            <td className="py-4 text-gray-500">Eliminação total de 1.100 impressões/ano (Papel + Toner).</td>
                                            <td className="py-4 text-right font-mono font-bold text-blue-600">R$ 330,00</td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 font-bold text-gray-700 dark:text-gray-200">Conformidade IATF</td>
                                            <td className="py-4 text-gray-500">Redução do risco de multas ou perda de certificação por extravio.</td>
                                            <td className="py-4 text-right font-mono font-bold text-emerald-600">Alta</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-blue-600 rounded-2xl text-white shadow-xl relative overflow-hidden">
                            <ChartIcon className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12" />
                            <div className="relative z-10">
                                <h4 className="text-lg font-black uppercase italic mb-2 tracking-tight">Conclusão Estratégica</h4>
                                <p className="text-sm text-blue-50 leading-relaxed max-w-2xl">
                                    "Em operações de alta confiabilidade, o custo oculto da manutenção manual não está nas peças, mas no <strong>tempo burocrático dos especialistas</strong>. O SGMI 2.0 devolve 240 horas/ano à equipe, permitindo foco em melhorias e na manutenção preditiva."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'comparison' && (
                <div className="animate-fade-in bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">Excel (Manual) vs SGMI 2.0 (Digital)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Cálculo de KPI', excel: 'Manual (8h/mês)', app: 'Automático (Tempo Real)' },
                            { label: 'Mobilidade', excel: 'Fica no Desktop', app: 'Acessível via Tablet/Mobile' },
                            { label: 'Rastreabilidade', excel: 'Planilhas podem ser deletadas', app: 'Banco de Dados Estruturado' },
                            { label: 'Assinaturas', excel: 'Físicas (Gera deslocamento)', app: 'Validação Digital de Status' },
                            { label: 'Estoque', excel: 'Silo (Sem integração com OS)', app: 'Integrado e Baixa Automática' }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{item.label}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-red-500 font-bold">Manual: {item.excel}</span>
                                    <ArrowRightIcon className="w-3 h-3 text-gray-300" />
                                    <span className="text-emerald-600 font-black">SGMI: {item.app}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'tutorial' && (
                <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Painel Central', desc: 'Monitoramento global de KPIs em tempo real.' },
                        { title: 'Kanban Diário', desc: 'Gestão visual do que está sendo executado no dia.' },
                        { title: 'Cadastro de Ativos', desc: 'Ficha técnica completa de cada máquina da planta.' },
                        { title: 'Estoque Mínimo', desc: 'Controle de peças baseado no consumo real (FO-044).' }
                    ].map((t, i) => (
                        <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black">{i+1}</div>
                            <div>
                                <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase">{t.title}</h4>
                                <p className="text-xs text-gray-500">{t.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'norms' && (
                <div className="animate-fade-in space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-black text-gray-900 dark:text-white uppercase mb-2">IATF 16949:2016 — Requisito 8.5.1.5</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Determina que a organização deve desenvolver, implementar e manter um sistema de manutenção produtiva total (TPM). O SGMI 2.0 atende a este requisito ao documentar objetivos (MTBF/MTTR), manter peças de reposição e gerir planos preventivos.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
