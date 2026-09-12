import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  FinanceType,
  FinanceStatus,
  IdeaStatus,
  IdeaPriority,
  ContentType,
  ContentStatus,
  ContentPlatform,
} from '../../types';

export const ItemModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    saveItem,
    deleteItem,
    clients,
    projects,
    ideas,
    content,
  } = useApp();

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (activeModal?.initialData) {
      setFormData({ ...activeModal.initialData });
    } else {
      // Default initial states based on type
      switch (activeModal?.type) {
        case 'project':
          setFormData({
            title: '',
            clientId: clients[0]?.id || '',
            status: 'В работе' as ProjectStatus,
            cost: 30000,
            deadline: '20 сентября 2026',
            description: '',
            progress: 0,
          });
          break;
        case 'client':
          setFormData({
            name: '',
            company: '',
            email: '',
            phone: '',
            telegram: '',
            notes: '',
          });
          break;
        case 'task':
          setFormData({
            title: '',
            projectId: projects[0]?.id || '',
            deadline: '15 сентября 2026',
            priority: 'Средний' as TaskPriority,
            status: 'К выполнению' as TaskStatus,
            completed: false,
          });
          break;
        case 'finance':
          setFormData({
            title: '',
            amount: 15000,
            type: 'income' as FinanceType,
            status: 'Оплачено' as FinanceStatus,
            date: '2026-09-12',
            category: 'Дизайн',
            projectId: projects[0]?.id || '',
          });
          break;
        case 'idea':
          setFormData({
            title: '',
            description: '',
          });
          break;
        case 'content':
          setFormData({
            title: '',
            type: 'Reels' as ContentType,
            platform: 'Instagram' as ContentPlatform,
            status: 'Черновик' as ContentStatus,
            publishDate: '2026-09-16',
            ideaId: ideas[0]?.id || '',
          });
          break;
        case 'result':
          setFormData({
            title: '',
            contentId: content[0]?.id || '',
            metricName: 'Просмотры и конверсия',
            metricValue: '10K',
            change: '+15%',
            isPositive: true,
            date: '2026-09-12',
            notes: '',
          });
          break;
      }
    }
  }, [activeModal, clients, projects, ideas, content]);

  if (!activeModal || !activeModal.isOpen) return null;

  const isEdit = activeModal.mode === 'edit';
  const type = activeModal.type;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title && !formData.name) return;
    saveItem(type, formData, isEdit ? activeModal.initialData?.id : undefined);
  };

  const handleDelete = () => {
    if (activeModal.initialData?.id) {
      deleteItem(type, activeModal.initialData.id);
      closeModal();
    }
  };

  const titleMap: Record<string, string> = {
    project: isEdit ? 'Редактировать проект' : 'Новый проект',
    client: isEdit ? 'Редактировать клиента' : 'Новый клиент',
    task: isEdit ? 'Редактировать задачу' : 'Новая задача',
    finance: isEdit ? 'Редактировать транзакцию' : 'Новая финансовая запись',
    idea: isEdit ? 'Редактировать идею' : 'Новая идея',
    content: isEdit ? 'Редактировать единицу контента' : 'Новый контент',
    result: isEdit ? 'Редактировать результат' : 'Новый результат',
  };

  const inputClasses =
    'w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:bg-[#151921] focus:border-white/[0.25] focus:outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeModal}
      />

      {/* Modal Card / Bottom Sheet on mobile */}
      <div className="relative w-full max-w-lg bg-[#11141A] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            {titleMap[type] || 'Форма'}
          </h3>
          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 dark-scrollbar">
          {/* PROJECT FORM */}
          {type === 'project' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Название проекта *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Создание логотипа"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Клиент</label>
                  <select
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className={inputClasses}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#11141A] text-white">
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Статус</label>
                  <select
                    value={formData.status || 'В работе'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className={inputClasses}
                  >
                    <option value="В работе" className="bg-[#11141A] text-white">В работе</option>
                    <option value="На согласовании" className="bg-[#11141A] text-white">На согласовании</option>
                    <option value="Пауза" className="bg-[#11141A] text-white">Пауза</option>
                    <option value="Завершен" className="bg-[#11141A] text-white">Завершен</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Стоимость (₽)</label>
                  <input
                    type="number"
                    value={formData.cost || 0}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Дедлайн</label>
                  <input
                    type="text"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="Например: 18 сентября 2026"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Прогресс выполнения ({formData.progress || 0}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.progress || 0}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Описание</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Задачи, стек, требования к результату..."
                  className={inputClasses}
                />
              </div>
            </>
          )}

          {/* CLIENT FORM */}
          {type === 'client' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Имя и фамилия *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Александр Петров"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Компания</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Lumiere Coffee"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@mail.ru"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Telegram</label>
                  <input
                    type="text"
                    value={formData.telegram || ''}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="@client_username"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Телефон</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Заметки</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Особенности общения, график согласования..."
                  className={inputClasses}
                />
              </div>
            </>
          )}

          {/* TASK FORM */}
          {type === 'task' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Название задачи *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Сделать первый вариант логотипа"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Проект</label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={inputClasses}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#11141A] text-white">
                      {p.title} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Приоритет</label>
                  <select
                    value={formData.priority || 'Средний'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className={inputClasses}
                  >
                    <option value="Низкий" className="bg-[#11141A] text-white">Низкий</option>
                    <option value="Средний" className="bg-[#11141A] text-white">Средний</option>
                    <option value="Высокий" className="bg-[#11141A] text-white">Высокий</option>
                    <option value="Срочный" className="bg-[#11141A] text-white">Срочный</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Статус</label>
                  <select
                    value={formData.status || 'К выполнению'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className={inputClasses}
                  >
                    <option value="К выполнению" className="bg-[#11141A] text-white">К выполнению</option>
                    <option value="В процессе" className="bg-[#11141A] text-white">В процессе</option>
                    <option value="Выполнено" className="bg-[#11141A] text-white">Выполнено</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Дедлайн</label>
                <input
                  type="text"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="13 сентября 2026"
                  className={inputClasses}
                />
              </div>
            </>
          )}

          {/* FINANCE FORM */}
          {type === 'finance' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Назначение платежа *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Предоплата за логотип"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Тип</label>
                  <select
                    value={formData.type || 'income'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as FinanceType })}
                    className={inputClasses}
                  >
                    <option value="income" className="bg-[#11141A] text-white">Доход (+)</option>
                    <option value="expense" className="bg-[#11141A] text-white">Расход (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Сумма (₽)</label>
                  <input
                    type="number"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Статус</label>
                  <select
                    value={formData.status || 'Оплачено'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FinanceStatus })}
                    className={inputClasses}
                  >
                    <option value="Оплачено" className="bg-[#11141A] text-white">Оплачено</option>
                    <option value="Ожидает оплаты" className="bg-[#11141A] text-white">Ожидает оплаты</option>
                    <option value="Отменено" className="bg-[#11141A] text-white">Отменено</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Категория</label>
                  <input
                    type="text"
                    value={formData.category || 'Дизайн'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Связанный проект</label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={inputClasses}
                >
                  <option value="" className="bg-[#11141A] text-white">Без проекта</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#11141A] text-white">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* IDEA / NOTE FORM */}
          {type === 'idea' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Заголовок заметки *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="О чем эта мысль или идея..."
                  className={inputClasses}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Текст заметки / мысли
                </label>
                <textarea
                  rows={5}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Запишите детали, тезисы, ссылки или наблюдения..."
                  className={inputClasses}
                />
              </div>
            </>
          )}

          {/* CONTENT FORM */}
          {type === 'content' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Название контента *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Reels про FREELA №1"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Платформа</label>
                  <select
                    value={formData.platform || 'Instagram'}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentPlatform })}
                    className={inputClasses}
                  >
                    <option value="Instagram" className="bg-[#11141A] text-white">Instagram</option>
                    <option value="Telegram" className="bg-[#11141A] text-white">Telegram</option>
                    <option value="YouTube" className="bg-[#11141A] text-white">YouTube</option>
                    <option value="VK" className="bg-[#11141A] text-white">VK</option>
                    <option value="Блог" className="bg-[#11141A] text-white">Блог</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Статус</label>
                  <select
                    value={formData.status || 'Черновик'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                    className={inputClasses}
                  >
                    <option value="Черновик" className="bg-[#11141A] text-white">Черновик</option>
                    <option value="Производство" className="bg-[#11141A] text-white">Производство</option>
                    <option value="Готово" className="bg-[#11141A] text-white">Готово</option>
                    <option value="Опубликовано" className="bg-[#11141A] text-white">Опубликовано</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Связано с идеей</label>
                <select
                  value={formData.ideaId || ''}
                  onChange={(e) => setFormData({ ...formData, ideaId: e.target.value })}
                  className={inputClasses}
                >
                  <option value="" className="bg-[#11141A] text-white">Без идеи</option>
                  {ideas.map((i) => (
                    <option key={i.id} value={i.id} className="bg-[#11141A] text-white">
                      {i.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Дата публикации</label>
                <input
                  type="text"
                  value={formData.publishDate || ''}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  placeholder="2026-09-16"
                  className={inputClasses}
                />
              </div>
            </>
          )}

          {/* RESULT FORM */}
          {type === 'result' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Заголовок результата *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Reels про FREELA №1 — первый результат"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Связанный контент</label>
                <select
                  value={formData.contentId || ''}
                  onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                  className={inputClasses}
                >
                  <option value="" className="bg-[#11141A] text-white">Без привязки</option>
                  {content.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#11141A] text-white">
                      {c.title} ({c.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Метрика</label>
                  <input
                    type="text"
                    value={formData.metricName || ''}
                    onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
                    placeholder="Просмотры / Лиды"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Значение</label>
                  <input
                    type="text"
                    value={formData.metricValue || ''}
                    onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                    placeholder="28.4K"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Заметки и вывод</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Что сработало лучше всего? Какой бизнес-выхлоп?"
                  className={inputClasses}
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition-colors min-h-[40px]"
              >
                <Trash2 size={14} />
                Удалить
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors min-h-[40px]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
              >
                <Check size={14} />
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
