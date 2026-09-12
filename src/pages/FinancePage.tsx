import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Calendar,
  FolderKanban,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, statusColors } from '../utils/formatters';
import { FinanceChart } from '../components/common/FinanceChart';

export const FinancePage: React.FC = () => {
  const { finance, kpi, openCreateModal, openEditModal } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredFinance = useMemo(() => {
    return finance.filter((item) => {
      if (filterType === 'all') return true;
      if (filterType === 'income') return item.type === 'income' && item.status === 'Оплачено';
      if (filterType === 'expense') return item.type === 'expense';
      if (filterType === 'waiting') return item.status === 'Ожидает оплаты';
      return true;
    });
  }, [finance, filterType]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Wallet size={22} className="text-amber-400" />
            Финансы
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
            Денежные потоки, выставленные счета и финансовая аналитика
          </p>
        </div>
        <button
          onClick={() => openCreateModal('finance')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
        >
          <Plus size={16} />
          Записать операцию
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Income */}
        <div className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Доход (факт)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-2.5 tracking-tight">
            {formatMoney(kpi.income)}
          </div>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Поступило на счет</p>
        </div>

        {/* Expenses */}
        <div className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Расходы</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownRight size={14} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-200 mt-2.5 tracking-tight">
            {formatMoney(kpi.expenses)}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Софт, подписки, сервисы</p>
        </div>

        {/* Waiting payment */}
        <div className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Ожидает оплаты</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-400 mt-2.5 tracking-tight">
            {formatMoney(kpi.waitingPayment)}
          </div>
          <p className="text-[10px] text-amber-400 font-medium mt-0.5">Выставлено клиентам</p>
        </div>

        {/* Balance */}
        <div className="bg-[#11141A] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Чистый баланс</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wallet size={14} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-2.5 tracking-tight">
            {formatMoney(kpi.balance)}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Доход минус расходы</p>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Динамика выручки и расходов
        </h2>
        <FinanceChart records={finance} />
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">История операций</h2>

          {/* Type filters */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterType === 'all'
                  ? 'bg-white/[0.12] text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Все ({finance.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterType === 'income'
                  ? 'bg-white/[0.12] text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Доходы
            </button>
            <button
              onClick={() => setFilterType('waiting')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterType === 'waiting'
                  ? 'bg-white/[0.12] text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Ожидает оплаты
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterType === 'expense'
                  ? 'bg-white/[0.12] text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Расходы
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-[#11141A] rounded-2xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {filteredFinance.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Wallet size={22} />
              </div>
              <div className="text-sm font-bold text-white">Пока здесь ничего нет</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-normal">
                Зафиксируйте первую операцию: доход по проекту или регулярные расходы
              </p>
              <button
                onClick={() => openCreateModal('finance')}
                className="mt-4 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                Добавить операцию
              </button>
            </div>
          ) : (
            filteredFinance.map((record) => {
              const isIncome = record.type === 'income';
            const statusConfig = statusColors[record.status] || {
              bg: 'bg-white/[0.04]',
              text: 'text-slate-400',
            };

            return (
              <div
                key={record.id}
                onClick={() => openEditModal('finance', record)}
                className="p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? record.status === 'Оплачено'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-slate-200">
                      {record.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal flex items-center gap-2 mt-0.5">
                      <span>{record.category}</span>
                      {record.projectName && (
                        <>
                          <span>•</span>
                          <span className="truncate text-slate-400">{record.projectName}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-slate-500">{record.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-bold ${
                      isIncome
                        ? record.status === 'Оплачено'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatMoney(record.amount)}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5 border ${statusConfig.bg}`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
  );
};
