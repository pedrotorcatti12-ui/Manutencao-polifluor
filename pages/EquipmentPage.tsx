
import React, { useState, useMemo } from 'react';
import { Equipment, MaintenancePlan, MaintenanceTask, MaintenanceStatus, MaintenanceType as MType } from '../types';
import { Header } from '../components/Header';
import { EquipmentModal } from '../components/EquipmentModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PlusIcon, ClipboardListIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { EquipmentReport } from '../components/EquipmentReport';
import { useDataContext } from '../contexts/DataContext';
import { EditableEquipmentRow } from '../components/EditableEquipmentRow';
import { MONTHS } from '../constants';

declare const window: any;

export const EquipmentPage: React.FC = () => {
  const { equipmentData, setEquipmentData, equipmentTypes, maintenancePlans, removeEquipment } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // States para Equipamentos
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredEquipment = useMemo(() => {
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return equipmentData.filter(eq => 
        eq.id.toLowerCase().includes(lowercasedTerm) ||
        eq.name.toLowerCase().includes(lowercasedTerm) ||
        eq.location.toLowerCase().includes(lowercasedTerm)
    );
  }, [equipmentData, debouncedSearchTerm]);

  // --- Função de Relatório de Checklists ---
  const handlePrintChecklistReport = () => {
      if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
          alert('Biblioteca PDF não carregada. Tente novamente.');
          return;
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' }); // Paisagem
      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabeçalho
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("Relatório Geral: Equipamentos e Planos de Manutenção", pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 22, { align: 'center' });

      // Preparar dados da tabela
      const tableBody = equipmentData.map(eq => {
          let planName = 'Nenhum';
          let checklistText = 'Sem tarefas definidas';
          let frequency = '-';

          // 1. Verificar Plano Customizado
          if (eq.customPlanId) {
              const plan = maintenancePlans.find(p => p.id === eq.customPlanId);
              if (plan) {
                  planName = `${plan.description} (Customizado)`;
                  frequency = `${plan.frequency} meses`;
                  checklistText = plan.tasks.map(t => `• ${t.action} ${t.materials ? `[${t.materials}]` : ''}`).join('\n');
              }
          } 
          // 2. Verificar Checklist Individual na Ficha
          else if (eq.individualChecklist && eq.individualChecklist.length > 0) {
              planName = 'Checklist Individual';
              frequency = 'Variável';
              checklistText = eq.individualChecklist.map(t => `• ${t.action} ${t.materials ? `[${t.materials}]` : ''}`).join('\n');
          }
          // 3. Verificar Plano Padrão por Família (Model)
          else {
              const defaultPlan = maintenancePlans.find(p => p.equipmentTypeId === eq.model);
              if (defaultPlan) {
                  planName = `${defaultPlan.description} (Padrão)`;
                  frequency = `${defaultPlan.frequency} meses`;
                  checklistText = defaultPlan.tasks.map(t => `• ${t.action} ${t.materials ? `[${t.materials}]` : ''}`).join('\n');
              }
          }

          return [
              eq.id,
              eq.name,
              eq.model || 'Geral',
              planName,
              frequency,
              checklistText
          ];
      });

      (doc as any).autoTable({
          startY: 30,
          head: [['ID', 'Equipamento', 'Família', 'Plano Vinculado', 'Freq.', 'Checklist (Tarefas)']],
          body: tableBody,
          styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
          columnStyles: {
              0: { cellWidth: 20, fontStyle: 'bold' },
              1: { cellWidth: 40, fontStyle: 'bold' },
              2: { cellWidth: 25 },
              3: { cellWidth: 40 },
              4: { cellWidth: 15, halign: 'center' },
              5: { cellWidth: 'auto' } // O checklist ocupa o resto
          },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
          theme: 'grid'
      });

      doc.save('Relatorio_Equipamentos_Checklists.pdf');
  };

  // --- Handlers de Equipamento ---
  const handleSaveEquipment = (updatedEq: Equipment) => {
    // Verificar se o plano vinculado mudou (ou se é novo equipamento)
    const oldEq = editingEquipment;
    const planChanged = oldEq?.customPlanId !== updatedEq.customPlanId;
    const modelChanged = oldEq?.model !== updatedEq.model; // Nova verificação: Mudou a família?
    const isNew = !oldEq;

    // Se customPlanId existe, usa ele. Se não, usa o plano padrão baseado no model (tipo)
    const targetPlanId = updatedEq.customPlanId;
    const defaultPlan = maintenancePlans.find(p => p.equipmentTypeId === updatedEq.model);
    
    // O plano a ser aplicado é: O Customizado SE existir, SENÃO o Padrão do Tipo
    const planToApply = targetPlanId 
        ? maintenancePlans.find(p => p.id === targetPlanId) 
        : defaultPlan;

    let finalEquipment = { ...updatedEq };

    // Se mudou o plano manual, mudou a família, ou é novo... tente regenerar
    if ((planChanged || modelChanged || isNew) && planToApply && planToApply.frequency > 0) {
        const message = isNew 
            ? `O equipamento foi criado sob o plano "${planToApply.description}". O cronograma inicial será gerado.`
            : `Houve alteração de Plano ou Família para "${planToApply.description}". Deseja regenerar o cronograma futuro (2026) deste equipamento com base na nova regra?`;

        const confirmUpdate = isNew ? true : window.confirm(message);
        
        if (confirmUpdate) {
             const now = new Date();
             const currentYear = now.getFullYear();
             const currentMonthIndex = now.getMonth();
             const targetYear = 2026; 

             let startMonthIndex = 0; 

             if (currentYear === targetYear) {
                 startMonthIndex = currentMonthIndex + 1;
             } else if (currentYear > targetYear) {
                 startMonthIndex = 12; 
             }

             // Preserva histórico
             const keptTasks = updatedEq.schedule.filter(t => {
                const taskMonthIndex = MONTHS.indexOf(t.month);
                if (t.status !== MaintenanceStatus.Scheduled) return true;
                if (t.year < targetYear) return true;
                if (t.year > targetYear) return true;
                return taskMonthIndex < startMonthIndex;
             });

             // Gerar novas tarefas futuras
             const newTasks: MaintenanceTask[] = [];
             
             for (let i = startMonthIndex; i < 12; i += planToApply.frequency) {
                 newTasks.push({
                     id: crypto.randomUUID(),
                     year: targetYear,
                     month: MONTHS[i],
                     status: MaintenanceStatus.Scheduled,
                     type: MType.Preventive,
                     description: planToApply.description,
                     planId: planToApply.id,
                     details: planToApply.tasks,
                     osNumber: ''
                 });
             }
             finalEquipment.schedule = [...keptTasks, ...newTasks];
        }
    }

    if (editingEquipment) {
      setEquipmentData(prev => prev.map(eq => eq.id === finalEquipment.id ? finalEquipment : eq));
    } else {
      setEquipmentData(prev => [...prev, finalEquipment].sort((a,b) => a.id.localeCompare(b.id)));
    }
    closeEquipmentModal();
  };
  
  const confirmDeleteEquipment = () => {
    if (!deletingEquipment) return;
    removeEquipment(deletingEquipment.id); // Usa função do contexto que deleta da nuvem
    setDeletingEquipment(null);
  }

  const openEquipmentModal = (equipment: Equipment | null = null) => {
    setEditingEquipment(equipment);
    setIsEquipmentModalOpen(true);
  };

  const closeEquipmentModal = () => {
    setEditingEquipment(null);
    setIsEquipmentModalOpen(false);
  };

  return (
    <>
      <Header
        title="Cadastro de Equipamentos"
        subtitle="Gerencie o inventário de ativos e vincule planos de manutenção."
        actions={
          <div className="flex gap-2">
              <button onClick={handlePrintChecklistReport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white font-semibold rounded-md transition-colors text-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                  <ClipboardListIcon className="w-4 h-4" /> Relatório de Checklists
              </button>
              <button onClick={() => openEquipmentModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm">
                  <PlusIcon className="w-4 h-4" /> Adicionar Equipamento
              </button>
          </div>
        }
      />
      
      <div className="mb-6">
           <input
            type="text"
            placeholder="Buscar por ID, nome ou localização..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 form-input"
          />
      </div>

      <div className="space-y-4">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map(eq => (
                <EditableEquipmentRow
                  key={eq.id}
                  equipment={eq}
                  onView={setViewingEquipment}
                  onEdit={openEquipmentModal}
                  onDelete={setDeletingEquipment}
                />
            ))
          ) : (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
                <p className="mt-1">Ajuste seus filtros ou adicione um novo equipamento.</p>
            </div>
          )}
      </div>

      {isEquipmentModalOpen && <EquipmentModal isOpen={isEquipmentModalOpen} onClose={closeEquipmentModal} onSave={handleSaveEquipment} existingEquipment={editingEquipment} equipmentTypes={equipmentTypes} maintenancePlans={maintenancePlans} />}
      {deletingEquipment && <ConfirmationModal isOpen={!!deletingEquipment} onClose={() => setDeletingEquipment(null)} onConfirm={confirmDeleteEquipment} title="Confirmar Exclusão" message={`Tem certeza que deseja excluir o equipamento ${deletingEquipment.name}?`} />}
      {viewingEquipment && <EquipmentReport equipment={viewingEquipment} onClose={() => setViewingEquipment(null)} />}
    </>
  );
};
