import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  MainNavSection,
  WorkSubTab,
  CreatorSubTab,
  NavSection,
  Client,
  Project,
  Task,
  FinanceRecord,
  Idea,
  ContentItem,
  ResultItem,
  DashboardWidgetConfig,
  DEFAULT_WIDGET_CONFIG,
  Board,
  BoardItem,
} from '../types';
import { dataService, subscribeToDataService } from '../services/dataService';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

export interface NextStepAction {
  id: string;
  title: string;
  reason: string;
  urgency: 'critical' | 'warning' | 'info' | 'success';
  badge: string;
  actionText: string;
  onClick: () => void;
}

interface AppContextType {
  // Navigation
  mainSection: MainNavSection;
  setMainSection: (section: MainNavSection) => void;
  workTab: WorkSubTab;
  setWorkTab: (tab: WorkSubTab) => void;
  creatorTab: CreatorSubTab;
  setCreatorTab: (tab: CreatorSubTab) => void;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;

  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Settings & Profile & Case Study Modals
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  caseStudyProject: Project | null;
  openCaseStudy: (project: Project) => void;
  closeCaseStudy: () => void;

  // Data Stores
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  finance: FinanceRecord[];
  ideas: Idea[];
  content: ContentItem[];
  results: ResultItem[];
  boards: Board[];
  boardItems: BoardItem[];

  // Boards Canvas State & Actions
  activeBoardId: string | null;
  setActiveBoardId: (id: string | null) => void;
  createBoard: (data: { title: string; description?: string; color?: string; icon?: string }) => Board;
  updateBoard: (id: string, data: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  createBoardItem: (data: Omit<BoardItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => BoardItem;
  updateBoardItem: (id: string, data: Partial<BoardItem>) => void;
  batchUpdateBoardItems: (items: (Partial<BoardItem> & { id: string })[]) => void;
  deleteBoardItem: (id: string) => void;

  // Dynamic KPIs & Metrics
  kpi: {
    income: number;
    waitingPayment: number;
    activeProjects: number;
    pendingTasks: number;
    expenses: number;
    balance: number;
    paidIncome: number;
    overduePayment: number;
  };

  // Financial Efficiency
  financialEfficiency: {
    averageRate: number; // e.g. 3750 ₽/ч
    totalLoggedHours: number;
    mostProfitableCategory: string;
  };

  // Automated Next Steps
  nextSteps: NextStepAction[];

  // Notifications
  notifications: AppNotification[];
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;

  // Modals state for CRUD
  activeModal: {
    isOpen: boolean;
    type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result';
    mode: 'create' | 'edit';
    initialData?: any;
  } | null;
  openCreateModal: (type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result', defaults?: any) => void;
  openEditModal: (type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result', data: any) => void;
  closeModal: () => void;

  // CRUD Actions
  toggleTask: (id: string) => void;
  deleteItem: (type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result', id: string) => void;
  saveItem: (type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result', data: any, id?: string) => void;
  resetDemoData: () => void;

  // Dashboard Widget Configuration (Этап 2)
  widgetConfig: DashboardWidgetConfig;
  setWidgetVisible: (widgetId: keyof DashboardWidgetConfig, visible: boolean) => void;
  resetWidgetConfig: () => void;
  isWidgetModalOpen: boolean;
  setIsWidgetModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateProfile } = useAuth();

  // Navigation State
  const [mainSection, setMainSectionState] = useState<MainNavSection>('dashboard');
  const [workTab, setWorkTab] = useState<WorkSubTab>('projects');
  const [creatorTab, setCreatorTab] = useState<CreatorSubTab>('ideas');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Global Search Modal
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [caseStudyProject, setCaseStudyProject] = useState<Project | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState<boolean>(false);

  // Dashboard Widget Visibility State (Isolated per user)
  const [widgetConfig, setWidgetConfig] = useState<DashboardWidgetConfig>(() => {
    if (currentUser?.dashboardWidgets) {
      return { ...DEFAULT_WIDGET_CONFIG, ...currentUser.dashboardWidgets };
    }
    if (currentUser?.uid) {
      try {
        const cached = localStorage.getItem(`freela_widgets_${currentUser.uid}`);
        if (cached) return { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(cached) };
      } catch {}
    }
    return DEFAULT_WIDGET_CONFIG;
  });

  // Re-synchronize widgets on currentUser change (switch user / login / logout)
  useEffect(() => {
    if (!currentUser) {
      setWidgetConfig(DEFAULT_WIDGET_CONFIG);
      return;
    }

    let loaded: DashboardWidgetConfig = DEFAULT_WIDGET_CONFIG;
    if (currentUser.dashboardWidgets) {
      loaded = { ...DEFAULT_WIDGET_CONFIG, ...currentUser.dashboardWidgets };
    } else {
      try {
        const cached = localStorage.getItem(`freela_widgets_${currentUser.uid}`);
        if (cached) {
          loaded = { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(cached) };
        }
      } catch {}
    }
    setWidgetConfig(loaded);
  }, [currentUser?.uid, currentUser?.dashboardWidgets]);

  const setWidgetVisible = (widgetId: keyof DashboardWidgetConfig, visible: boolean) => {
    setWidgetConfig((prev) => {
      const next = { ...prev, [widgetId]: visible };
      if (currentUser?.uid) {
        try {
          localStorage.setItem(`freela_widgets_${currentUser.uid}`, JSON.stringify(next));
        } catch {}
        // Persist to user profile database in background
        updateProfile({ dashboardWidgets: next }).catch((err) => {
          console.warn('Failed to persist widget config to user profile:', err);
        });
      }
      return next;
    });
  };

  const resetWidgetConfig = () => {
    setWidgetConfig(DEFAULT_WIDGET_CONFIG);
    if (currentUser?.uid) {
      try {
        localStorage.setItem(`freela_widgets_${currentUser.uid}`, JSON.stringify(DEFAULT_WIDGET_CONFIG));
      } catch {}
      updateProfile({ dashboardWidgets: DEFAULT_WIDGET_CONFIG }).catch((err) => {
        console.warn('Failed to reset widget config in user profile:', err);
      });
    }
  };

  // Local synced states from dataService
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [finance, setFinance] = useState<FinanceRecord[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // CRUD Modal State
  const [activeModal, setActiveModal] = useState<AppContextType['activeModal']>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Synchronize active user workspace on auth change
  useEffect(() => {
    let isMounted = true;

    const initWorkspace = async () => {
      const uid = currentUser ? currentUser.uid : null;
      await dataService.switchUser(uid);
      if (isMounted) {
        setClients(dataService.clients.getAll());
        setProjects(dataService.projects.getAll());
        setTasks(dataService.tasks.getAll());
        setFinance(dataService.finance.getAll());
        setIdeas(dataService.ideas.getAll());
        setContent(dataService.content.getAll());
        setResults(dataService.results.getAll());
        setBoards(dataService.boards.getAll());
        setBoardItems(dataService.boardItems.getAll());
        setActiveBoardId(null);

        // Notifications tailored to user
        if (!currentUser) {
          setNotifications([]);
        } else if (currentUser.uid === 'usr_demo_freela') {
          setNotifications([
            {
              id: 'notif-1',
              title: 'Предоплата получена',
              message: 'Александр Петров оплатил 15 000 ₽ за проект «Создание логотипа для бренда»',
              time: 'Сегодня, 11:20',
              read: false,
              type: 'success',
            },
            {
              id: 'notif-2',
              title: 'Дедлайн задачи',
              message: 'Задача «Завершить первый вариант логотипа» должна быть сдана завтра',
              time: 'Сегодня, 09:00',
              read: false,
              type: 'alert',
            },
          ]);
        } else {
          setNotifications([
            {
              id: 'notif-welcome',
              title: 'Добро пожаловать в FREELA!',
              message: `Рабочее пространство для ${currentUser.displayName} создано. Все данные изолированы.`,
              time: 'Только что',
              read: false,
              type: 'info',
            },
          ]);
        }
      }
    };

    initWorkspace();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  // Backward-compatible activeSection mapping
  const activeSection: NavSection = useMemo(() => {
    if (mainSection === 'dashboard') return 'dashboard';
    if (mainSection === 'boards') return 'boards';
    if (mainSection === 'finance') return 'finance';
    if (mainSection === 'work') return workTab;
    if (mainSection === 'creator') return creatorTab;
    return 'dashboard';
  }, [mainSection, workTab, creatorTab]);

  const setActiveSection = (section: NavSection) => {
    switch (section) {
      case 'dashboard':
        setMainSectionState('dashboard');
        break;
      case 'boards':
        setMainSectionState('boards');
        break;
      case 'work':
        setMainSectionState('work');
        break;
      case 'projects':
        setMainSectionState('work');
        setWorkTab('projects');
        break;
      case 'clients':
        setMainSectionState('work');
        setWorkTab('clients');
        break;
      case 'tasks':
        setMainSectionState('work');
        setWorkTab('tasks');
        break;
      case 'finance':
        setMainSectionState('finance');
        break;
      case 'creator':
        setMainSectionState('creator');
        break;
      case 'ideas':
        setMainSectionState('creator');
        setCreatorTab('ideas');
        break;
      case 'content':
        setMainSectionState('creator');
        setCreatorTab('content');
        break;
      case 'results':
        setMainSectionState('creator');
        setCreatorTab('results');
        break;
      default:
        setMainSectionState('dashboard');
    }
  };

  const setMainSection = (section: MainNavSection) => {
    setMainSectionState(section);
  };

  // Sync when dataService triggers update
  useEffect(() => {
    const unsubscribe = subscribeToDataService(() => {
      setClients(dataService.clients.getAll());
      setProjects(dataService.projects.getAll());
      setTasks(dataService.tasks.getAll());
      setFinance(dataService.finance.getAll());
      setIdeas(dataService.ideas.getAll());
      setContent(dataService.content.getAll());
      setResults(dataService.results.getAll());
      setBoards(dataService.boards.getAll());
      setBoardItems(dataService.boardItems.getAll());
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcut for search: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Dynamic KPIs
  const kpi = useMemo(() => {
    const finSummary = dataService.finance.getSummary();
    const activeProjects = projects.filter(
      (p) => p.status === 'В работе' || p.status === 'На согласовании'
    ).length;
    const pendingTasks = tasks.filter((t) => !t.completed).length;

    return {
      income: finSummary.income,
      waitingPayment: finSummary.waitingPayment,
      activeProjects,
      pendingTasks,
      expenses: finSummary.expenses,
      balance: finSummary.balance,
      paidIncome: finSummary.paidIncome,
      overduePayment: finSummary.overduePayment,
    };
  }, [finance, projects, tasks]);

  // Financial Efficiency
  const financialEfficiency = useMemo(() => {
    let totalCostWithHours = 0;
    let totalHours = 0;

    projects.forEach((p) => {
      if (p.hoursSpent && p.hoursSpent > 0) {
        totalCostWithHours += p.cost;
        totalHours += p.hoursSpent;
      }
    });

    const defaultRate = currentUser?.hourlyRate || 3500;
    const averageRate = totalHours > 0 ? Math.round(totalCostWithHours / totalHours) : defaultRate;

    return {
      averageRate,
      totalLoggedHours: totalHours,
      mostProfitableCategory: projects.length > 0 ? 'Дизайн & Разработка' : 'Не определено',
    };
  }, [projects, currentUser?.hourlyRate]);

  // Dynamic "Next Step" Block Analysis
  const nextSteps = useMemo(() => {
    const steps: NextStepAction[] = [];

    // For brand new users with no projects or tasks
    if (projects.length === 0 && tasks.length === 0) {
      steps.push({
        id: 'step-new-user-project',
        title: 'Создайте свой первый проект',
        reason: 'Зафиксируйте задачу заказчика, бюджет и дедлайн в системе',
        urgency: 'info',
        badge: 'Быстрый старт',
        actionText: '+ Проект',
        onClick: () => {
          openCreateModal('project');
        },
      });

      steps.push({
        id: 'step-new-user-client',
        title: 'Добавьте первого клиента',
        reason: 'Сохраните контакты заказчика и прикрепите к проектам',
        urgency: 'info',
        badge: 'Клиенты',
        actionText: '+ Клиент',
        onClick: () => {
          openCreateModal('client');
        },
      });

      return steps;
    }

    // 1. Check for urgent or high-priority incomplete tasks
    const urgentTask = tasks.find(
      (t) => !t.completed && (t.priority === 'Срочный' || t.priority === 'Высокий')
    );
    if (urgentTask) {
      steps.push({
        id: 'step-task-' + urgentTask.id,
        title: urgentTask.title,
        reason: `Дедлайн: ${urgentTask.deadline} • Проект «${urgentTask.projectName}»`,
        urgency: 'critical',
        badge: 'Срочная задача',
        actionText: 'Открыть задачу',
        onClick: () => {
          openEditModal('task', urgentTask);
        },
      });
    }

    // 2. Check for waiting payment invoices
    const pendingInvoice = finance.find(
      (f) => (f.status === 'Ожидает' || f.status === 'Ожидает оплаты') && f.type === 'income'
    );
    if (pendingInvoice) {
      steps.push({
        id: 'step-fin-' + pendingInvoice.id,
        title: `Проверить оплату «${pendingInvoice.title}»`,
        reason: `Ожидается ${pendingInvoice.amount.toLocaleString('ru-RU')} ₽ от ${pendingInvoice.projectName || 'клиента'}`,
        urgency: 'warning',
        badge: 'Контроль платежа',
        actionText: 'К финансам',
        onClick: () => {
          setActiveSection('finance');
        },
      });
    }

    // 3. Check for ready content that can be published
    const readyContent = content.find((c) => c.status === 'Готов' || c.status === 'Готово');
    if (readyContent) {
      steps.push({
        id: 'step-content-' + readyContent.id,
        title: `Опубликовать ${readyContent.type} «${readyContent.title}»`,
        reason: `Материал полностью смонтирован и готов для ${readyContent.platform}`,
        urgency: 'info',
        badge: 'Создавай',
        actionText: 'К контенту',
        onClick: () => {
          setActiveSection('content');
        },
      });
    }

    // Fallback if everything is completed
    if (steps.length === 0) {
      steps.push({
        id: 'step-new-idea',
        title: 'Запланировать следующий спринт или идею для блога',
        reason: 'Все текущие задачи выполнены. Время развивать поток заявок.',
        urgency: 'success',
        badge: 'Развитие',
        actionText: '+ Новая идея',
        onClick: () => {
          openCreateModal('idea');
        },
      });
    }

    return steps.slice(0, 3);
  }, [tasks, finance, content, projects]);

  // Modal handlers
  const openCreateModal = (
    type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result',
    defaults?: any
  ) => {
    setActiveModal({
      isOpen: true,
      type,
      mode: 'create',
      initialData: defaults,
    });
  };

  const openEditModal = (
    type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result',
    data: any
  ) => {
    setActiveModal({
      isOpen: true,
      type,
      mode: 'edit',
      initialData: data,
    });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const openCaseStudy = (project: Project) => setCaseStudyProject(project);
  const closeCaseStudy = () => setCaseStudyProject(null);

  const toggleTask = (id: string) => {
    dataService.tasks.toggleComplete(id);
  };

  const deleteItem = (
    type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result',
    id: string
  ) => {
    switch (type) {
      case 'project':
        dataService.projects.delete(id);
        break;
      case 'client':
        dataService.clients.delete(id);
        break;
      case 'task':
        dataService.tasks.delete(id);
        break;
      case 'finance':
        dataService.finance.delete(id);
        break;
      case 'idea':
        dataService.ideas.delete(id);
        break;
      case 'content':
        dataService.content.delete(id);
        break;
      case 'result':
        dataService.results.delete(id);
        break;
    }
  };

  const saveItem = (
    type: 'project' | 'client' | 'task' | 'finance' | 'idea' | 'content' | 'result',
    data: any,
    id?: string
  ) => {
    if (id) {
      switch (type) {
        case 'project':
          dataService.projects.update(id, data);
          break;
        case 'client':
          dataService.clients.update(id, data);
          break;
        case 'task':
          dataService.tasks.update(id, data);
          break;
        case 'finance':
          dataService.finance.update(id, data);
          break;
        case 'idea':
          dataService.ideas.update(id, data);
          break;
        case 'content':
          dataService.content.update(id, data);
          break;
        case 'result':
          dataService.results.update(id, data);
          break;
      }
    } else {
      switch (type) {
        case 'project':
          dataService.projects.create(data);
          break;
        case 'client':
          dataService.clients.create(data);
          break;
        case 'task':
          dataService.tasks.create(data);
          break;
        case 'finance':
          dataService.finance.create(data);
          break;
        case 'idea':
          dataService.ideas.create(data);
          break;
        case 'content':
          dataService.content.create(data);
          break;
        case 'result':
          dataService.results.create(data);
          break;
      }
    }
    closeModal();
  };

  const resetDemoData = () => {
    dataService.resetToDefault();
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Board actions
  const createBoard = (data: { title: string; description?: string; color?: string; icon?: string }) => {
    const newBoard = dataService.boards.create(data);
    setBoards(dataService.boards.getAll());
    setActiveBoardId(newBoard.id);
    return newBoard;
  };

  const updateBoard = (id: string, data: Partial<Board>) => {
    dataService.boards.update(id, data);
    setBoards(dataService.boards.getAll());
  };

  const deleteBoard = (id: string) => {
    dataService.boards.delete(id);
    setBoards(dataService.boards.getAll());
    setBoardItems(dataService.boardItems.getAll());
    if (activeBoardId === id) {
      setActiveBoardId(null);
    }
  };

  const createBoardItem = (data: Omit<BoardItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const item = dataService.boardItems.create(data);
    setBoardItems(dataService.boardItems.getAll());
    return item;
  };

  const updateBoardItem = (id: string, data: Partial<BoardItem>) => {
    dataService.boardItems.update(id, data);
    setBoardItems(dataService.boardItems.getAll());
  };

  const batchUpdateBoardItems = (items: (Partial<BoardItem> & { id: string })[]) => {
    dataService.boardItems.batchUpdate(items);
    setBoardItems(dataService.boardItems.getAll());
  };

  const deleteBoardItem = (id: string) => {
    dataService.boardItems.delete(id);
    setBoardItems(dataService.boardItems.getAll());
  };

  return (
    <AppContext.Provider
      value={{
        mainSection,
        setMainSection,
        workTab,
        setWorkTab,
        creatorTab,
        setCreatorTab,
        activeSection,
        setActiveSection,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        openSearch,
        closeSearch,
        isSettingsOpen,
        openSettings,
        closeSettings,
        isProfileOpen,
        openProfile,
        closeProfile,
        caseStudyProject,
        openCaseStudy,
        closeCaseStudy,
        clients,
        projects,
        tasks,
        finance,
        ideas,
        content,
        results,
        boards,
        boardItems,
        activeBoardId,
        setActiveBoardId,
        createBoard,
        updateBoard,
        deleteBoard,
        createBoardItem,
        updateBoardItem,
        batchUpdateBoardItems,
        deleteBoardItem,
        kpi,
        financialEfficiency,
        nextSteps,
        notifications,
        markAllNotificationsRead,
        unreadNotificationsCount,
        activeModal,
        openCreateModal,
        openEditModal,
        closeModal,
        toggleTask,
        deleteItem,
        saveItem,
        resetDemoData,
        widgetConfig,
        setWidgetVisible,
        resetWidgetConfig,
        isWidgetModalOpen,
        setIsWidgetModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
