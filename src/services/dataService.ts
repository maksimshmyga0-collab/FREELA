import {
  Client,
  Project,
  Task,
  FinanceRecord,
  Idea,
  ContentItem,
  ResultItem,
} from '../types';
import {
  initialClients,
  initialProjects,
  initialTasks,
  initialFinance,
  initialIdeas,
  initialContent,
  initialResults,
} from '../data/mockData';

// Local storage key prefix
const STORAGE_PREFIX = 'freela_db_';

function getStored<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return defaultData;
}

function saveStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// In-memory state with localStorage persistence
let clientsStore: Client[] = getStored('clients', initialClients);
let projectsStore: Project[] = getStored('projects', initialProjects);
let tasksStore: Task[] = getStored('tasks', initialTasks);
let financeStore: FinanceRecord[] = getStored('finance', initialFinance);
let ideasStore: Idea[] = getStored('ideas', initialIdeas);
let contentStore: ContentItem[] = getStored('content', initialContent);
let resultsStore: ResultItem[] = getStored('results', initialResults);

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

// Project progress recalculator based on tasks
function recalculateProjectProgress(projectId: string) {
  const projectTasks = tasksStore.filter((t) => t.projectId === projectId);
  if (projectTasks.length === 0) return;
  const completed = projectTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completed / projectTasks.length) * 100);

  projectsStore = projectsStore.map((p) =>
    p.id === projectId ? { ...p, progress: progressPercent } : p
  );
  saveStored('projects', projectsStore);
}

export const dataService = {
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
        createdAt: new Date().toISOString().split('T')[0],
      };
      clientsStore = [newClient, ...clientsStore];
      saveStored('clients', clientsStore);
      notify();
      return newClient;
    },
    update(id: string, updates: Partial<Client>): Client | null {
      const idx = clientsStore.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      clientsStore[idx] = { ...clientsStore[idx], ...updates };
      // Also update clientName in connected projects if name changed
      if (updates.name) {
        projectsStore = projectsStore.map((p) =>
          p.clientId === id ? { ...p, clientName: updates.name! } : p
        );
        saveStored('projects', projectsStore);
      }
      saveStored('clients', clientsStore);
      notify();
      return clientsStore[idx];
    },
    delete(id: string): boolean {
      clientsStore = clientsStore.filter((c) => c.id !== id);
      saveStored('clients', clientsStore);
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
        clientName: data.clientName || client?.name || 'Без клиента',
        progress: data.progress ?? 0,
        id: 'proj-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      projectsStore = [newProject, ...projectsStore];
      saveStored('projects', projectsStore);
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

      // Update project name in connected tasks and finance
      if (updates.title) {
        tasksStore = tasksStore.map((t) =>
          t.projectId === id ? { ...t, projectName: updates.title! } : t
        );
        saveStored('tasks', tasksStore);
        financeStore = financeStore.map((f) =>
          f.projectId === id ? { ...f, projectName: updates.title! } : f
        );
        saveStored('finance', financeStore);
      }
      saveStored('projects', projectsStore);
      notify();
      return projectsStore[idx];
    },
    delete(id: string): boolean {
      projectsStore = projectsStore.filter((p) => p.id !== id);
      saveStored('projects', projectsStore);
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
    create(data: Omit<Task, 'id' | 'createdAt' | 'completed'> & { completed?: boolean }): Task {
      const project = projectsStore.find((p) => p.id === data.projectId);
      const isDone = data.status === 'Готово' || data.status === 'Выполнено';
      const newTask: Task = {
        ...data,
        projectName: data.projectName || project?.title || 'Общий проект',
        completed: data.completed ?? isDone,
        id: 'task-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      tasksStore = [newTask, ...tasksStore];
      saveStored('tasks', tasksStore);
      if (newTask.projectId) {
        recalculateProjectProgress(newTask.projectId);
      }
      notify();
      return newTask;
    },
    update(id: string, updates: Partial<Task>): Task | null {
      const idx = tasksStore.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      if (updates.status !== undefined && updates.completed === undefined) {
        updates.completed = updates.status === 'Готово' || updates.status === 'Выполнено';
      }
      if (updates.completed !== undefined && updates.status === undefined) {
        updates.status = updates.completed ? 'Готово' : 'В работе';
      }
      tasksStore[idx] = { ...tasksStore[idx], ...updates };
      saveStored('tasks', tasksStore);
      if (tasksStore[idx].projectId) {
        recalculateProjectProgress(tasksStore[idx].projectId);
      }
      notify();
      return tasksStore[idx];
    },
    toggleComplete(id: string): Task | null {
      const task = tasksStore.find((t) => t.id === id);
      if (!task) return null;
      const newCompleted = !task.completed;
      const newStatus = newCompleted ? 'Готово' : 'В работе';
      return this.update(id, { completed: newCompleted, status: newStatus });
    },
    delete(id: string): boolean {
      const task = tasksStore.find((t) => t.id === id);
      const projectId = task?.projectId;
      tasksStore = tasksStore.filter((t) => t.id !== id);
      saveStored('tasks', tasksStore);
      if (projectId) {
        recalculateProjectProgress(projectId);
      }
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
      const project = data.projectId ? projectsStore.find((p) => p.id === data.projectId) : undefined;
      const newRecord: FinanceRecord = {
        ...data,
        projectName: data.projectName || project?.title,
        id: 'fin-' + Date.now(),
      };
      financeStore = [newRecord, ...financeStore];
      saveStored('finance', financeStore);
      notify();
      return newRecord;
    },
    update(id: string, updates: Partial<FinanceRecord>): FinanceRecord | null {
      const idx = financeStore.findIndex((f) => f.id === id);
      if (idx === -1) return null;
      financeStore[idx] = { ...financeStore[idx], ...updates };
      saveStored('finance', financeStore);
      notify();
      return financeStore[idx];
    },
    delete(id: string): boolean {
      financeStore = financeStore.filter((f) => f.id !== id);
      saveStored('finance', financeStore);
      notify();
      return true;
    },
    getSummary() {
      let income = 0;
      let expenses = 0;
      let waitingPayment = 0;
      let paidIncome = 0;
      let overduePayment = 0;

      financeStore.forEach((item) => {
        if (item.type === 'income') {
          if (item.status === 'Оплачено') {
            income += item.amount;
            paidIncome += item.amount;
          } else if (item.status === 'Ожидает' || item.status === 'Ожидает оплаты') {
            waitingPayment += item.amount;
          } else if (item.status === 'Просрочено') {
            overduePayment += item.amount;
          }
        } else if (item.type === 'expense') {
          if (item.status === 'Оплачено') {
            expenses += item.amount;
          }
        }
      });

      const balance = income - expenses;
      return {
        income,
        expenses,
        waitingPayment,
        paidIncome,
        overduePayment,
        balance,
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
        id: 'idea-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      ideasStore = [newIdea, ...ideasStore];
      saveStored('ideas', ideasStore);
      notify();
      return newIdea;
    },
    update(id: string, updates: Partial<Idea>): Idea | null {
      const idx = ideasStore.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      ideasStore[idx] = { ...ideasStore[idx], ...updates };
      saveStored('ideas', ideasStore);
      notify();
      return ideasStore[idx];
    },
    delete(id: string): boolean {
      ideasStore = ideasStore.filter((i) => i.id !== id);
      saveStored('ideas', ideasStore);
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
    getByIdeaId(ideaId: string): ContentItem[] {
      return contentStore.filter((c) => c.ideaId === ideaId);
    },
    create(data: Omit<ContentItem, 'id' | 'createdAt'>): ContentItem {
      const idea = data.ideaId ? ideasStore.find((i) => i.id === data.ideaId) : undefined;
      const newContent: ContentItem = {
        ...data,
        ideaTitle: data.ideaTitle || idea?.title,
        id: 'content-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      contentStore = [newContent, ...contentStore];
      saveStored('content', contentStore);
      notify();
      return newContent;
    },
    update(id: string, updates: Partial<ContentItem>): ContentItem | null {
      const idx = contentStore.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      contentStore[idx] = { ...contentStore[idx], ...updates };
      saveStored('content', contentStore);
      notify();
      return contentStore[idx];
    },
    delete(id: string): boolean {
      contentStore = contentStore.filter((c) => c.id !== id);
      saveStored('content', contentStore);
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
    getByContentId(contentId: string): ResultItem[] {
      return resultsStore.filter((r) => r.contentId === contentId);
    },
    create(data: Omit<ResultItem, 'id'>): ResultItem {
      const content = data.contentId ? contentStore.find((c) => c.id === data.contentId) : undefined;
      const newResult: ResultItem = {
        ...data,
        contentTitle: data.contentTitle || content?.title,
        id: 'res-' + Date.now(),
      };
      resultsStore = [newResult, ...resultsStore];
      saveStored('results', resultsStore);
      notify();
      return newResult;
    },
    update(id: string, updates: Partial<ResultItem>): ResultItem | null {
      const idx = resultsStore.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      resultsStore[idx] = { ...resultsStore[idx], ...updates };
      saveStored('results', resultsStore);
      notify();
      return resultsStore[idx];
    },
    delete(id: string): boolean {
      resultsStore = resultsStore.filter((r) => r.id !== id);
      saveStored('results', resultsStore);
      notify();
      return true;
    },
  },

  // GLOBAL SEARCH ACROSS ALL 7 ENTITIES
  search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { projects: [], clients: [], tasks: [], finance: [], ideas: [], content: [], results: [] };

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
          (c.telegram && c.telegram.toLowerCase().includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      ),
      tasks: tasksStore.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q)
      ),
      finance: financeStore.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.projectName && f.projectName.toLowerCase().includes(q)) ||
          f.category.toLowerCase().includes(q)
      ),
      ideas: ideasStore.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.tags && i.tags.some((tag) => tag.toLowerCase().includes(q)))
      ),
      content: contentStore.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q)
      ),
      results: resultsStore.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.contentTitle && r.contentTitle.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      ),
    };
  },

  // CASE STUDY GENERATOR
  generateCaseStudy(projectId: string) {
    const project = projectsStore.find((p) => p.id === projectId);
    if (!project) return null;

    const client = clientsStore.find((c) => c.id === project.clientId);
    const pTasks = tasksStore.filter((t) => t.projectId === projectId);
    const pFinance = financeStore.filter((f) => f.projectId === projectId);
    const totalPaid = pFinance
      .filter((f) => f.status === 'Оплачено' && f.type === 'income')
      .reduce((s, f) => s + f.amount, 0);

    const completedTasksList = pTasks
      .filter((t) => t.completed)
      .map((t) => `• ${t.title}`)
      .join('\n');

    const effectiveRate =
      project.hoursSpent && project.hoursSpent > 0
        ? `${Math.round(project.cost / project.hoursSpent).toLocaleString('ru-RU')} ₽/час (${project.hoursSpent} ч)`
        : 'Не указано';

    const markdown = `# КЕЙС: ${project.title.toUpperCase()}

**Клиент:** ${client?.name || project.clientName}${client?.company ? ` (${client.company})` : ''}
**Бюджет:** ${project.cost.toLocaleString('ru-RU')} ₽ (Оплачено: ${totalPaid.toLocaleString('ru-RU')} ₽)
**Эффективная ставка:** ${effectiveRate}
**Сроки:** ${project.startDate || '2026-09'} — ${project.deadline}
**Статус:** ${project.status} (Прогресс: ${project.progress}%)

---

### 1. Задача и контекст
${project.description || 'Разработка комплексного дизайн-решения под бизнес-задачи клиента.'}

### 2. Ключевые этапы реализации
${completedTasksList || '• Все этапы проекта согласованы и выполнены'}

### 3. Результат и бизнес-эффект
Проект успешно сдан заказчику в оговоренные сроки. Материалы подготовлены к публикации в портфолио и презентации новым клиентам.

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

  // EXPORT / IMPORT
  exportData(): string {
    return JSON.stringify(
      {
        version: '2.0',
        exportDate: new Date().toISOString(),
        clients: clientsStore,
        projects: projectsStore,
        tasks: tasksStore,
        finance: financeStore,
        ideas: ideasStore,
        content: contentStore,
        results: resultsStore,
      },
      null,
      2
    );
  },

  importData(rawJson: string): boolean {
    try {
      const data = JSON.parse(rawJson);
      if (Array.isArray(data.clients)) clientsStore = data.clients;
      if (Array.isArray(data.projects)) projectsStore = data.projects;
      if (Array.isArray(data.tasks)) tasksStore = data.tasks;
      if (Array.isArray(data.finance)) financeStore = data.finance;
      if (Array.isArray(data.ideas)) ideasStore = data.ideas;
      if (Array.isArray(data.content)) contentStore = data.content;
      if (Array.isArray(data.results)) resultsStore = data.results;

      saveStored('clients', clientsStore);
      saveStored('projects', projectsStore);
      saveStored('tasks', tasksStore);
      saveStored('finance', financeStore);
      saveStored('ideas', ideasStore);
      saveStored('content', contentStore);
      saveStored('results', resultsStore);
      notify();
      return true;
    } catch {
      return false;
    }
  },

  // Reset to initial demo data
  resetToDefault() {
    clientsStore = [...initialClients];
    projectsStore = [...initialProjects];
    tasksStore = [...initialTasks];
    financeStore = [...initialFinance];
    ideasStore = [...initialIdeas];
    contentStore = [...initialContent];
    resultsStore = [...initialResults];
    saveStored('clients', clientsStore);
    saveStored('projects', projectsStore);
    saveStored('tasks', tasksStore);
    saveStored('finance', financeStore);
    saveStored('ideas', ideasStore);
    saveStored('content', contentStore);
    saveStored('results', resultsStore);
    notify();
  },
};
