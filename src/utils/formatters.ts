export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K';
  }
  return amount.toString();
}

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  // Project Statuses
  'В работе': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'На согласовании': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Ожидает оплаты': { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Завершен': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Завершён': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Отменен': { bg: 'bg-white/[0.04] text-slate-500 border-white/[0.08]', text: 'text-slate-500', dot: 'bg-slate-600' },
  'Отменён': { bg: 'bg-white/[0.04] text-slate-500 border-white/[0.08]', text: 'text-slate-500', dot: 'bg-slate-600' },
  'Пауза': { bg: 'bg-white/[0.04] text-slate-400 border-white/[0.08]', text: 'text-slate-400', dot: 'bg-slate-500' },

  // Client Statuses
  'Активный': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Потенциальный': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },

  // Task Statuses
  'Не начата': { bg: 'bg-white/[0.04] text-slate-400 border-white/[0.08]', text: 'text-slate-400', dot: 'bg-slate-500' },
  'К выполнению': { bg: 'bg-white/[0.04] text-slate-300 border-white/[0.08]', text: 'text-slate-300', dot: 'bg-slate-500' },
  'В процессе': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Готово': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Выполнено': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Отложена': { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },

  // Priority
  'Срочный': { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  'Высокий': { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  'Средний': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Низкий': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },

  // Finance Status
  'Оплачено': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Ожидает': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Просрочено': { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  'Отменено': { bg: 'bg-white/[0.04] text-slate-500 border-white/[0.08]', text: 'text-slate-500', dot: 'bg-slate-500' },

  // Idea Status
  'Новая': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Готова': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Архив': { bg: 'bg-white/[0.04] text-slate-500 border-white/[0.08]', text: 'text-slate-500', dot: 'bg-slate-500' },

  // Content Status
  'Идея': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Готов': { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  'Опубликован': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};
