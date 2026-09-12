import {
  Client,
  Project,
  Task,
  FinanceRecord,
  Idea,
  ContentItem,
  ResultItem,
  Board,
  BoardItem,
} from '../types';
import { initialClients, initialProjects, initialTasks, initialFinance, initialIdeas, initialContent, initialResults } from '../data/mockData';
import { workspaceDb, UserWorkspaceData } from './db/workspaceDb';

let activeUserId: string | null = null;

// In-memory state for current user
let clientsStore: Client[] = [];
let projectsStore: Project[] = [];
let tasksStore: Task[] = [];
let financeStore: FinanceRecord[] = [];
let ideasStore: Idea[] = [];
let contentStore: ContentItem[] = [];
let resultsStore: ResultItem[] = [];
let boardsStore: Board[] = [];
let boardItemsStore: BoardItem[] = [];

type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeToDataService(callback: ChangeListener) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Persist active user's workspace
function persistCurrentWorkspace() {
  if (!activeUserId) return;
  const data: UserWorkspaceData = {
    clients: clientsStore,
    projects: projectsStore,
    tasks: tasksStore,
    finance: financeStore,
    ideas: ideasStore,
    content: contentStore,
    results: resultsStore,
    boards: boardsStore,
    boardItems: boardItemsStore,
  };

  workspaceDb.saveWorkspace(activeUserId, data).catch((err) => {
    console.error('Failed to save workspace:', err);
  });
}

// Recalculate project progress
function recalculateProjectProgress(projectId: string) {
  const projectTasks = tasksStore.filter((t) => t.projectId === projectId);
  if (projectTasks.length === 0) return;
  const completed = projectTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completed / projectTasks.length) * 100);

  projectsStore = projectsStore.map((p) =>
    p.id === projectId ? { ...p, progress: progressPercent } : p
  );
  persistCurrentWorkspace();
}

export const dataService = {
  // Switch active user workspace
  async switchUser(userId: string | null): Promise<void> {
    activeUserId = userId;
    if (!userId) {
      clientsStore = [];
      projectsStore = [];
      tasksStore = [];
      financeStore = [];
      ideasStore = [];
      contentStore = [];
      resultsStore = [];
      boardsStore = [];
      boardItemsStore = [];
      notify();
      return;
    }

    // Load user's private workspace
    const ws = await workspaceDb.getWorkspace(userId);
    clientsStore = ws.clients || [];
    projectsStore = ws.projects || [];
    tasksStore = ws.tasks || [];
    financeStore = ws.finance || [];
    ideasStore = ws.ideas || [];
    contentStore = ws.content || [];
    resultsStore = ws.results || [];
    boardsStore = ws.boards || [];
    boardItemsStore = ws.boardItems || [];
    notify();
  },

  getCurrentUserId(): string | null {
    return activeUserId;
  },

  // CLIENTS
  clients: {
    getAll(): Client[] {
      return [...clientsStore];
    },
    getById(id: string): Client | undefined {
      return clientsStore.find((c) => c.id === id);
    },
    create(data: Omit<Client, 'id' | 'createdAt'>): Client {
      const newClient: Client = {
        ...data,
        id: 'client-' + Date.now(),
        userId: activeUserId || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };
      clientsStore = [newClient, ...clientsStore];
      persistCurrentWorkspace();
      notify();
      return newClient;
    },
    update(id: string, updates: Partial<Client>): Client | null {
      const idx = clientsStore.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      clientsStore[idx] = { ...clientsStore[idx], ...updates };
      if (updates.name) {
        projectsStore = projectsStore.map((p) =>
          p.clientId === id ? { ...p, clientName: updates.name! } : p
        );
      }
      persistCurrentWorkspace();
      notify();
      return clientsStore[idx];
    },
    delete(id: string): boolean {
      clientsStore = clientsStore.filter((c) => c.id !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // PROJECTS
  projects: {
    getAll(): Project[] {
      return [...projectsStore];
    },
    getById(id: string): Project | undefined {
      return projectsStore.find((p) => p.id === id);
    },
    getByClientId(clientId: string): Project[] {
      return projectsStore.filter((p) => p.clientId === clientId);
    },
    create(data: Omit<Project, 'id' | 'createdAt' | 'progress'> & { progress?: number }): Project {
      const client = clientsStore.find((c) => c.id === data.clientId);
      const newProject: Project = {
        ...data,
        userId: activeUserId || undefined,
        clientName: data.clientName || client?.name || 'Прямой клиент',
        progress: data.progress ?? 0,
        id: 'proj-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      projectsStore = [newProject, ...projectsStore];
      persistCurrentWorkspace();
      notify();
      return newProject;
    },
    update(id: string, updates: Partial<Project>): Project | null {
      const idx = projectsStore.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      if (updates.clientId && !updates.clientName) {
        const client = clientsStore.find((c) => c.id === updates.clientId);
        if (client) updates.clientName = client.name;
      }
      projectsStore[idx] = { ...projectsStore[idx], ...updates };
      if (updates.title) {
        tasksStore = tasksStore.map((t) =>
          t.projectId === id ? { ...t, projectName: updates.title! } : t
        );
        financeStore = financeStore.map((f) =>
          f.projectId === id ? { ...f, projectName: updates.title! } : f
        );
      }
      persistCurrentWorkspace();
      notify();
      return projectsStore[idx];
    },
    delete(id: string): boolean {
      projectsStore = projectsStore.filter((p) => p.id !== id);
      tasksStore = tasksStore.filter((t) => t.projectId !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // TASKS
  tasks: {
    getAll(): Task[] {
      return [...tasksStore];
    },
    getById(id: string): Task | undefined {
      return tasksStore.find((t) => t.id === id);
    },
    getByProjectId(projectId: string): Task[] {
      return tasksStore.filter((t) => t.projectId === projectId);
    },
    create(data: Omit<Task, 'id' | 'createdAt'>): Task {
      const project = projectsStore.find((p) => p.id === data.projectId);
      const newTask: Task = {
        ...data,
        userId: activeUserId || undefined,
        projectName: data.projectName || project?.title || 'Без проекта',
        id: 'task-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      tasksStore = [newTask, ...tasksStore];
      persistCurrentWorkspace();
      if (data.projectId) recalculateProjectProgress(data.projectId);
      notify();
      return newTask;
    },
    update(id: string, updates: Partial<Task>): Task | null {
      const idx = tasksStore.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      const prevProjectId = tasksStore[idx].projectId;
      tasksStore[idx] = { ...tasksStore[idx], ...updates };
      persistCurrentWorkspace();
      if (updates.completed !== undefined || updates.projectId !== undefined) {
        if (prevProjectId) recalculateProjectProgress(prevProjectId);
        if (updates.projectId && updates.projectId !== prevProjectId) {
          recalculateProjectProgress(updates.projectId);
        }
      }
      notify();
      return tasksStore[idx];
    },
    toggleComplete(id: string): Task | null {
      const task = tasksStore.find((t) => t.id === id);
      if (!task) return null;
      return this.update(id, {
        completed: !task.completed,
        status: !task.completed ? 'Выполнено' : 'К выполнению',
      });
    },
    delete(id: string): boolean {
      const task = tasksStore.find((t) => t.id === id);
      const projId = task?.projectId;
      tasksStore = tasksStore.filter((t) => t.id !== id);
      persistCurrentWorkspace();
      if (projId) recalculateProjectProgress(projId);
      notify();
      return true;
    },
  },

  // FINANCE
  finance: {
    getAll(): FinanceRecord[] {
      return [...financeStore];
    },
    getById(id: string): FinanceRecord | undefined {
      return financeStore.find((f) => f.id === id);
    },
    create(data: Omit<FinanceRecord, 'id'>): FinanceRecord {
      const project = projectsStore.find((p) => p.id === data.projectId);
      const newRecord: FinanceRecord = {
        ...data,
        userId: activeUserId || undefined,
        projectName: data.projectName || project?.title || undefined,
        id: 'fin-' + Date.now(),
      };
      financeStore = [newRecord, ...financeStore];
      persistCurrentWorkspace();
      notify();
      return newRecord;
    },
    update(id: string, updates: Partial<FinanceRecord>): FinanceRecord | null {
      const idx = financeStore.findIndex((f) => f.id === id);
      if (idx === -1) return null;
      financeStore[idx] = { ...financeStore[idx], ...updates };
      persistCurrentWorkspace();
      notify();
      return financeStore[idx];
    },
    delete(id: string): boolean {
      financeStore = financeStore.filter((f) => f.id !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
    getSummary() {
      let income = 0;
      let expenses = 0;
      let waitingPayment = 0;
      let overduePayment = 0;
      let paidIncome = 0;

      financeStore.forEach((r) => {
        if (r.type === 'income') {
          if (r.status === 'Оплачено') {
            income += r.amount;
            paidIncome += r.amount;
          } else if (r.status === 'Ожидает' || r.status === 'Ожидает оплаты') {
            waitingPayment += r.amount;
          } else if (r.status === 'Просрочено') {
            overduePayment += r.amount;
          }
        } else if (r.type === 'expense') {
          expenses += r.amount;
        }
      });

      return {
        income,
        expenses,
        waitingPayment,
        overduePayment,
        paidIncome,
        balance: income - expenses,
      };
    },
  },

  // IDEAS
  ideas: {
    getAll(): Idea[] {
      return [...ideasStore];
    },
    getById(id: string): Idea | undefined {
      return ideasStore.find((i) => i.id === id);
    },
    create(data: Omit<Idea, 'id' | 'createdAt'>): Idea {
      const newIdea: Idea = {
        ...data,
        userId: activeUserId || undefined,
        id: 'idea-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      ideasStore = [newIdea, ...ideasStore];
      persistCurrentWorkspace();
      notify();
      return newIdea;
    },
    update(id: string, updates: Partial<Idea>): Idea | null {
      const idx = ideasStore.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      ideasStore[idx] = { ...ideasStore[idx], ...updates };
      persistCurrentWorkspace();
      notify();
      return ideasStore[idx];
    },
    delete(id: string): boolean {
      ideasStore = ideasStore.filter((i) => i.id !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // CONTENT
  content: {
    getAll(): ContentItem[] {
      return [...contentStore];
    },
    getById(id: string): ContentItem | undefined {
      return contentStore.find((c) => c.id === id);
    },
    create(data: Omit<ContentItem, 'id' | 'createdAt'>): ContentItem {
      const idea = ideasStore.find((i) => i.id === data.ideaId);
      const newContent: ContentItem = {
        ...data,
        userId: activeUserId || undefined,
        ideaTitle: data.ideaTitle || idea?.title || undefined,
        id: 'cnt-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      contentStore = [newContent, ...contentStore];
      persistCurrentWorkspace();
      notify();
      return newContent;
    },
    update(id: string, updates: Partial<ContentItem>): ContentItem | null {
      const idx = contentStore.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      contentStore[idx] = { ...contentStore[idx], ...updates };
      persistCurrentWorkspace();
      notify();
      return contentStore[idx];
    },
    delete(id: string): boolean {
      contentStore = contentStore.filter((c) => c.id !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // RESULTS
  results: {
    getAll(): ResultItem[] {
      return [...resultsStore];
    },
    getById(id: string): ResultItem | undefined {
      return resultsStore.find((r) => r.id === id);
    },
    create(data: Omit<ResultItem, 'id'>): ResultItem {
      const contentItem = contentStore.find((c) => c.id === data.contentId);
      const newResult: ResultItem = {
        ...data,
        userId: activeUserId || undefined,
        contentTitle: data.contentTitle || contentItem?.title || undefined,
        id: 'res-' + Date.now(),
      };
      resultsStore = [newResult, ...resultsStore];
      persistCurrentWorkspace();
      notify();
      return newResult;
    },
    update(id: string, updates: Partial<ResultItem>): ResultItem | null {
      const idx = resultsStore.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      resultsStore[idx] = { ...resultsStore[idx], ...updates };
      persistCurrentWorkspace();
      notify();
      return resultsStore[idx];
    },
    delete(id: string): boolean {
      resultsStore = resultsStore.filter((r) => r.id !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // CASE STUDY GENERATOR
  generateCaseStudy(projectId: string) {
    const project = projectsStore.find((p) => p.id === projectId);
    if (!project) return null;

    const client = clientsStore.find((c) => c.id === project.clientId);
    const relatedTasks = tasksStore.filter((t) => t.projectId === projectId);
    const completedTasks = relatedTasks.filter((t) => t.completed);
    const financeRecords = financeStore.filter((f) => f.projectId === projectId);
    const totalPaid = financeRecords
      .filter((f) => f.type === 'income' && f.status === 'Оплачено')
      .reduce((sum, f) => sum + f.amount, 0);

    const hours = project.hoursSpent || 16;
    const effectiveRate = Math.round(project.cost / hours);

    const tasksList = relatedTasks.length
      ? relatedTasks.map((t) => `- [${t.completed ? 'x' : ' '}] ${t.title}`).join('\n')
      : '- [x] Первичный бриф и концепция\n- [x] Разработка визуальных решений\n- [x] Финальная сдача заказчику';

    const markdown = `# КЕЙС: ${project.title}

## Общая информация
- **Клиент**: ${client ? client.name : project.clientName || 'Конфиденциально'} ${client?.company ? `(${client.company})` : ''}
- **Статус**: ${project.status}
- **Бюджет**: ${project.cost.toLocaleString('ru-RU')} ₽
- **Дедлайн**: ${project.deadline}
- **Трудозатраты**: ${hours} часов (эффективная ставка: ${effectiveRate.toLocaleString('ru-RU')} ₽/ч)

## Задача
${project.description || 'Комплексная реализация проекта под ключ с полным сопровождением заказчика.'}

## Выполненные этапы и задачи
${tasksList}

## Финансовые показатели
- Общая стоимость: **${project.cost.toLocaleString('ru-RU')} ₽**
- Фактически оплачено: **${totalPaid.toLocaleString('ru-RU')} ₽**
- Выполнение этапов: **${project.progress}%**

---
*Сгенерировано в FREELA Workspace — «Работай. Создавай. Развивайся.»*`;

    return {
      project,
      client,
      totalPaid,
      effectiveRate,
      markdown,
    };
  },

  // Optional manual demo data load for users who explicitly request it in Settings
  loadDemoData() {
    if (!activeUserId) return;
    clientsStore = initialClients.map((c) => ({ ...c, userId: activeUserId! }));
    projectsStore = initialProjects.map((p) => ({ ...p, userId: activeUserId! }));
    tasksStore = initialTasks.map((t) => ({ ...t, userId: activeUserId! }));
    financeStore = initialFinance.map((f) => ({ ...f, userId: activeUserId! }));
    ideasStore = initialIdeas.map((i) => ({ ...i, userId: activeUserId! }));
    contentStore = initialContent.map((c) => ({ ...c, userId: activeUserId! }));
    resultsStore = initialResults.map((r) => ({ ...r, userId: activeUserId! }));
    persistCurrentWorkspace();
    notify();
  },

  // Search across active user's workspace
  search(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        projects: [],
        clients: [],
        tasks: [],
        finance: [],
        ideas: [],
        content: [],
        results: [],
      };
    }
    return {
      projects: projectsStore.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      ),
      clients: clientsStore.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          (c.telegram && c.telegram.toLowerCase().includes(q))
      ),
      tasks: tasksStore.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q)
      ),
      finance: financeStore.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.projectName && f.projectName.toLowerCase().includes(q))
      ),
      ideas: ideasStore.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      ),
      content: contentStore.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q)
      ),
      results: resultsStore.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.metricName.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      ),
    };
  },

  // Export current workspace to JSON
  exportData(): string {
    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId: activeUserId,
      workspace: {
        clients: clientsStore,
        projects: projectsStore,
        tasks: tasksStore,
        finance: financeStore,
        ideas: ideasStore,
        content: contentStore,
        results: resultsStore,
      },
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  // BOARDS
  boards: {
    getAll(): Board[] {
      return [...boardsStore];
    },
    getById(id: string): Board | undefined {
      return boardsStore.find((b) => b.id === id);
    },
    create(data: { title: string; description?: string; color?: string; icon?: string }): Board {
      const now = new Date().toISOString();
      const newBoard: Board = {
        id: 'board-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        userId: activeUserId || '',
        title: data.title.trim(),
        description: data.description?.trim() || '',
        color: data.color || '#3B82F6',
        icon: data.icon || '🎨',
        createdAt: now,
        updatedAt: now,
      };
      boardsStore = [newBoard, ...boardsStore];
      persistCurrentWorkspace();
      notify();
      return newBoard;
    },
    update(id: string, updates: Partial<Board>): Board | null {
      const idx = boardsStore.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      boardsStore[idx] = {
        ...boardsStore[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistCurrentWorkspace();
      notify();
      return boardsStore[idx];
    },
    delete(id: string): boolean {
      boardsStore = boardsStore.filter((b) => b.id !== id);
      // Remove all items belonging to this board
      boardItemsStore = boardItemsStore.filter((item) => item.boardId !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // BOARD ITEMS
  boardItems: {
    getAll(boardId?: string): BoardItem[] {
      if (boardId) {
        return boardItemsStore.filter((item) => item.boardId === boardId);
      }
      return [...boardItemsStore];
    },
    getById(id: string): BoardItem | undefined {
      return boardItemsStore.find((item) => item.id === id);
    },
    create(data: Omit<BoardItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): BoardItem {
      const now = new Date().toISOString();
      const newItem: BoardItem = {
        ...data,
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        userId: activeUserId || '',
        createdAt: now,
        updatedAt: now,
      };
      boardItemsStore = [...boardItemsStore, newItem];
      persistCurrentWorkspace();
      notify();
      return newItem;
    },
    update(id: string, updates: Partial<BoardItem>): BoardItem | null {
      const idx = boardItemsStore.findIndex((item) => item.id === id);
      if (idx === -1) return null;
      boardItemsStore[idx] = {
        ...boardItemsStore[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistCurrentWorkspace();
      notify();
      return boardItemsStore[idx];
    },
    batchUpdate(itemsToUpdate: (Partial<BoardItem> & { id: string })[]): void {
      const updateMap = new Map(itemsToUpdate.map((u) => [u.id, u]));
      const now = new Date().toISOString();
      boardItemsStore = boardItemsStore.map((item) => {
        const u = updateMap.get(item.id);
        if (u) {
          return { ...item, ...u, updatedAt: now };
        }
        return item;
      });
      persistCurrentWorkspace();
      notify();
    },
    delete(id: string): boolean {
      boardItemsStore = boardItemsStore.filter((item) => item.id !== id);
      persistCurrentWorkspace();
      notify();
      return true;
    },
  },

  // Import workspace from JSON
  importData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      const ws = parsed.workspace || parsed;
      if (!ws) return false;
      clientsStore = Array.isArray(ws.clients) ? ws.clients : [];
      projectsStore = Array.isArray(ws.projects) ? ws.projects : [];
      tasksStore = Array.isArray(ws.tasks) ? ws.tasks : [];
      financeStore = Array.isArray(ws.finance) ? ws.finance : [];
      ideasStore = Array.isArray(ws.ideas) ? ws.ideas : [];
      contentStore = Array.isArray(ws.content) ? ws.content : [];
      resultsStore = Array.isArray(ws.results) ? ws.results : [];
      boardsStore = Array.isArray(ws.boards) ? ws.boards : [];
      boardItemsStore = Array.isArray(ws.boardItems) ? ws.boardItems : [];
      persistCurrentWorkspace();
      notify();
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  // Reset workspace
  resetToDefault() {
    this.clearWorkspace();
  },

  // Clear workspace completely
  clearWorkspace() {
    if (!activeUserId) return;
    clientsStore = [];
    projectsStore = [];
    tasksStore = [];
    financeStore = [];
    ideasStore = [];
    contentStore = [];
    resultsStore = [];
    boardsStore = [];
    boardItemsStore = [];
    persistCurrentWorkspace();
    notify();
  },
};
