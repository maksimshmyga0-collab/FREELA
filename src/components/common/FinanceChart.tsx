import React, { useState } from 'react';
import { FinanceRecord } from '../../types';
import { formatMoney } from '../../utils/formatters';

interface FinanceChartProps {
  records: FinanceRecord[];
}

export const FinanceChart: React.FC<FinanceChartProps> = ({ records }) => {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  // Group by months of 2026: Май, Июнь, Июль, Август, Сентябрь, Октябрь
  const months = [
    { label: 'Май', key: '2026-05', income: 75000, expense: 12000 },
    { label: 'Июн', key: '2026-06', income: 90000, expense: 16500 },
    { label: 'Июл', key: '2026-07', income: 110000, expense: 14200 },
    { label: 'Авг', key: '2026-08', income: 100000, expense: 6700 },
    { label: 'Сен', key: '2026-09', income: 57500, expense: 6700 }, // September dynamic
    { label: 'Окт (план)', key: '2026-10', income: 70000, expense: 5000 },
  ];

  // Recalculate September based on current live data
  let currentSepIncome = 0;
  let currentSepExpense = 0;
  records.forEach((r) => {
    if (r.date.startsWith('2026-09') && r.status === 'Оплачено') {
      if (r.type === 'income') currentSepIncome += r.amount;
      if (r.type === 'expense') currentSepExpense += r.amount;
    }
  });

  months[4].income = currentSepIncome > 0 ? currentSepIncome : 57500;
  months[4].expense = currentSepExpense > 0 ? currentSepExpense : 6700;

  const maxVal = Math.max(...months.map((m) => Math.max(m.income, m.expense))) * 1.15;

  return (
    <div className="w-full">
      {/* Legend & Chart controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 text-[11px] font-medium">Доход</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span className="text-slate-400 text-[11px] font-medium">Расходы</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-medium bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
          Динамика за 6 месяцев
        </div>
      </div>

      {/* HTML Bar visualization */}
      <div className="relative h-36 sm:h-44 w-full flex items-end justify-between gap-2 sm:gap-5 pt-4 pb-2 border-b border-white/[0.06]">
        {/* Background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-white/[0.06] w-full h-0"></div>
          <div className="border-b border-dashed border-white/[0.06] w-full h-0"></div>
          <div className="border-b border-dashed border-white/[0.06] w-full h-0"></div>
          <div className="border-b border-dashed border-white/[0.06] w-full h-0"></div>
        </div>

        {/* Bars */}
        {months.map((m, idx) => {
          const incomeHeight = Math.round((m.income / maxVal) * 100);
          const expenseHeight = Math.max(4, Math.round((m.expense / maxVal) * 100));
          const isHovered = activeBar === idx;

          return (
            <div
              key={m.label}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setActiveBar(idx)}
              onMouseLeave={() => setActiveBar(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[#0D0F14] border border-white/[0.12] text-white text-[10px] py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none flex flex-col items-center">
                  <span className="text-emerald-400 font-semibold">Доход: {formatMoney(m.income)}</span>
                  <span className="text-slate-400">Расход: {formatMoney(m.expense)}</span>
                  <div className="w-1.5 h-1.5 bg-[#0D0F14] border-r border-b border-white/[0.12] rotate-45 -mb-1 mt-0.5"></div>
                </div>
              )}

              {/* Bar Pair */}
              <div className="w-full max-w-[28px] flex items-end justify-center gap-1 sm:gap-1.5 h-full z-10">
                {/* Income bar */}
                <div
                  style={{ height: `${incomeHeight}%` }}
                  className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                    idx === 4
                      ? 'bg-emerald-400 hover:bg-emerald-300'
                      : 'bg-white/[0.15] group-hover:bg-white/[0.25]'
                  }`}
                />
                {/* Expense bar */}
                <div
                  style={{ height: `${expenseHeight}%` }}
                  className="w-1/2 rounded-t-sm bg-white/[0.05] group-hover:bg-white/[0.1] transition-all duration-300"
                />
              </div>

              {/* X Axis Label */}
              <span
                className={`text-[10px] mt-2 font-medium transition-colors ${
                  idx === 4 ? 'text-emerald-400 font-semibold' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
