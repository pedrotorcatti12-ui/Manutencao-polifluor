import React, { useEffect } from 'react';
import { useAppContext } from './contexts/AppContext';
import { useDataContext } from './contexts/DataContext';
import { useToast } from './contexts/ToastContext';

// Import Pages
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { InventoryPage } from './pages/InventoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { PlansPage } from './pages/PlansPage';
import { WorkCenterPage } from './pages/WorkCenterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkOrderPage } from './pages/WorkOrderPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdvancedReportsPage } from './pages/AdvancedReportsPage';
import { WorkOrderSearchPage } from './pages/WorkOrderSearchPage';
import { QualityPage } from './pages/QualityPage';
import { InformationPage } from './pages/InformationPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { ManagerialReportPage } from './pages/ManagerialReportPage';

// Import Components
import { AppHeader } from './components/AppHeader';
import { Sidebar } from './components/Sidebar';
import { WorkOrderControlModal } from './components/WorkOrderControlModal';
import { MaintenanceStatus, WorkOrder, MaintenanceType, MaintenanceTask } from './types';
import { getNextOSNumber } from './utils/osGenerator';
import { MONTHS } from './constants';

const App: React.FC = () => {
    const { isLoggedIn, currentPage, theme, handleLogin, isOSModalOpen, setIsOSModalOpen, editingOrder, setEditingOrder } = useAppContext();
    const { equipmentData, setEquipmentData, workOrders, setWorkOrders, inventoryData, maintainers, requesters } = useDataContext();
    const { showToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);
    
    const handleSaveUnifiedOS = (updatedOrder: WorkOrder) => {
        // 1. SINCRONIZAÇÃO CRÍTICA COM O CRONOGRAMA VISUAL
        let taskInScheduleFound = false;
        
        const newEquipmentData = equipmentData.map(eq => {
            if (eq.id === updatedOrder.equipmentId) {
                const updatedSchedule = eq.schedule.map(task => {
                    // Match exato por Número da OS ou pelo ID da tarefa original
                    if (task.osNumber === updatedOrder.id || task.id === updatedOrder.id) {
                        taskInScheduleFound = true;
                        return {
                            ...task,
                            status: updatedOrder.status,
                            description: updatedOrder.description,
                            startDate: updatedOrder.scheduledDate,
                            endDate: updatedOrder.endDate,
                            requestDate: updatedOrder.requestDate, // SYNC REQUEST DATE
                            rootCause: updatedOrder.rootCause,
                            correctiveCategory: updatedOrder.correctiveCategory,
                            purchaseRequests: updatedOrder.purchaseRequests,
                            materialsUsed: updatedOrder.materialsUsed,
                            manHours: updatedOrder.manHours.reduce((acc, curr) => acc + curr.hours, 0)
                        };
                    }
                    return task;
                });
                return { ...eq, schedule: updatedSchedule };
            }
            return eq;
        });

        // 2. TRATAMENTO DE O.S. AVULSA (Aparecer no histórico visual se não for do plano)
        if (!taskInScheduleFound) {
            const date = new Date(updatedOrder.scheduledDate);
            const newTask: MaintenanceTask = {
                id: updatedOrder.id, 
                year: date.getFullYear(),
                month: MONTHS[date.getMonth()],
                status: updatedOrder.status,
                type: updatedOrder.type,
                description: updatedOrder.description,
                osNumber: updatedOrder.id,
                startDate: updatedOrder.scheduledDate,
                requestDate: updatedOrder.requestDate, // SYNC REQUEST DATE
                endDate: updatedOrder.endDate,
                rootCause: updatedOrder.rootCause,
                correctiveCategory: updatedOrder.correctiveCategory,
                purchaseRequests: updatedOrder.purchaseRequests,
                materialsUsed: updatedOrder.materialsUsed,
                manHours: updatedOrder.manHours.reduce((acc, curr) => acc + curr.hours, 0)
            };

            const finalEquipmentData = newEquipmentData.map(eq => {
                if (eq.id === updatedOrder.equipmentId) {
                    // Evita duplicidade se já existir
                    if (!eq.schedule.some(t => t.id === newTask.id || t.osNumber === newTask.osNumber)) {
                        return { ...eq, schedule: [...eq.schedule, newTask] };
                    }
                }
                return eq;
            });
            setEquipmentData(finalEquipmentData);
        } else {
            setEquipmentData(newEquipmentData);
        }

        // 3. SINCRONIZAÇÃO COM A LISTA MESTRE DE ORDENS
        setWorkOrders(prev => {
            const exists = prev.some(o => o.id === updatedOrder.id);
            if (exists) {
                return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            } else {
                return [...prev, updatedOrder];
            }
        });

        setIsOSModalOpen(false);
        setEditingOrder(null);
        showToast(`Ordem #${updatedOrder.id} registrada e sincronizada com o cronograma!`, 'success');
    };

    const handleOpenCorrectiveFromHeader = () => {
        setEditingOrder(null);
        setIsOSModalOpen(true);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage />;
            case 'dashboard': return <DashboardPage />;
            case 'work_center': return <WorkCenterPage />;
            case 'schedule': return <SchedulePage />;
            case 'work_orders': return <WorkOrderPage />;
            case 'equipment': return <EquipmentPage />;
            case 'plans': return <PlansPage />;
            case 'inventory': return <InventoryPage />;
            case 'history': return <HistoryPage />;
            case 'managerial_report': return <ManagerialReportPage />;
            case 'advanced_reports': return <AdvancedReportsPage />;
            case 'search_os': return <WorkOrderSearchPage />;
            case 'quality': return <QualityPage />;
            case 'information': return <InformationPage />;
            case 'documentation': return <DocumentationPage />;
            case 'settings': return <SettingsPage />;
            default: return <HomePage />;
        }
    };
    
    if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
    
    return (
        <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''} flex overflow-hidden`}>
            <div className={`fixed inset-0 z-50 bg-gray-800/50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
                <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
            </div>

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
                <AppHeader 
                    onOpenCorrectiveRequest={handleOpenCorrectiveFromHeader} 
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900/50 scroll-smooth">
                    {renderPage()}
                </div>
            </main>

            {isOSModalOpen && (
                <WorkOrderControlModal
                    isOpen={isOSModalOpen}
                    onClose={() => { setIsOSModalOpen(false); setEditingOrder(null); }}
                    onSave={handleSaveUnifiedOS}
                    existingOrder={editingOrder}
                    equipmentData={equipmentData}
                    inventoryData={inventoryData}
                    nextOSNumber={getNextOSNumber(equipmentData, workOrders)}
                    maintainers={maintainers}
                    requesters={requesters}
                />
            )}
        </div>
    );
};

export default App;
