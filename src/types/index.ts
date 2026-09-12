export type ProjectStatus =
  | 'В работе'
  | 'На согласовании'
  | 'Ожидает оплаты'
  | 'Завершен'
  | 'Отменен';

export type ClientStatus = 'Активный' | 'Потенциальный' | 'Завершен';

export type TaskPriority = 'Высокий' | 'Средний' | 'Низкий' | 'Срочный';
export type TaskStatus = 'Не начата' | 'В работе' | 'Готово' | 'Отложена' | 'В процессе' | 'Выполнено' | 'К выполнению';

export type FinanceType = 'income' | 'expense';
export type FinanceStatus = 'Ожидает' | 'Ожидает оплаты' | 'Оплачено' | 'Просрочено' | 'Отменено';

export type IdeaStatus = 'Новая' | 'В работе' | 'В разработке' | 'Готова' | 'Готово к съемке' | 'Архив';
export type IdeaPriority = 'Низкий' | 'Средний' | 'Высокий';

export type ContentType = 'пост' | 'Reels' | 'видео' | 'статья' | 'другое' | 'Post' | 'Video' | 'Story' | 'Article' | 'Курс';
export type ContentStatus = 'Идея' | 'В работе' | 'Готов' | 'Опубликован' | 'Черновик' | 'Производство' | 'Готово';
export type ContentPlatform = 'Instagram' | 'Telegram' | 'YouTube' | 'VK' | 'Блог';

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  status: ClientStatus;
  notes?: string;
  dateAdded?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  cost: number;
  deadline: string;
  progress: number; // 0 - 100
  description?: string;
  color?: string;
  startDate?: string;
  hoursSpent?: number; // for financial efficiency (e.g. 8h, 36h)
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
}

export interface FinanceRecord {
  id: string;
  title: string;
  amount: number;
  type: FinanceType;
  status: FinanceStatus;
  date: string;
  projectId?: string;
  projectName?: string;
  category: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: 'Reels' | 'YouTube' | 'Статья' | 'Продукт' | 'Подкаст' | 'Курс' | string;
  status: IdeaStatus;
  priority?: IdeaPriority;
  tags?: string[];
  date?: string;
  notes?: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  platform: ContentPlatform;
  ideaId?: string;
  ideaTitle?: string;
  status: ContentStatus;
  publishDate: string;
  views?: number;
  engagement?: string;
  link?: string;
  notes?: string;
  createdAt: string;
}

export interface ResultItem {
  id: string;
  title: string;
  contentId?: string;
  contentTitle?: string;
  date: string;
  views?: number;
  likes?: number;
  comments?: number;
  leads?: number;
  revenue?: number;
  metricName?: string;
  metricValue?: string;
  change?: string;
  isPositive?: boolean;
  notes?: string;
}

// Top level navigation
export type MainNavSection = 'dashboard' | 'work' | 'finance' | 'creator';
export type WorkSubTab = 'projects' | 'clients' | 'tasks';
export type CreatorSubTab = 'ideas' | 'content' | 'results';

// Backward-compatible individual section routes
export type NavSection =
  | 'dashboard'
  | 'work'
  | 'projects'
  | 'clients'
  | 'tasks'
  | 'finance'
  | 'creator'
  | 'ideas'
  | 'content'
  | 'results';
