import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Euro,
  ArrowRight,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface ExchangeRateData {
  usdRub: number;
  eurRub: number;
  lastUpdated: Date;
  source: string;
}

export const CurrencyWidget: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatorAmount, setCalculatorAmount] = useState<string>('1000');
  const [calculatorCurrency, setCalculatorCurrency] = useState<'USD' | 'EUR'>('USD');

  // Fetch exchange rates from free open API
  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Primary source: open.er-api.com
      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      if (data && data.rates && data.rates.RUB) {
        const usdRub = data.rates.RUB;
        // Calculate EUR/RUB: (USD/RUB) / (USD/EUR)
        const eurRub = data.rates.EUR ? usdRub / data.rates.EUR : usdRub * 1.16;

        setRates({
          usdRub,
          eurRub,
          lastUpdated: new Date(),
          source: 'Open Exchange Rates (Live)',
        });
        return;
      }

      throw new Error('Некорректный формат данных от API');
    } catch (primaryErr) {
      console.warn('Primary exchange API failed, trying fallback:', primaryErr);

      // Fallback source: api.exchangerate-api.com
      try {
        const fallbackRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!fallbackRes.ok) {
          throw new Error(`Fallback HTTP error ${fallbackRes.status}`);
        }
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.rates && fallbackData.rates.RUB) {
          const usdRub = fallbackData.rates.RUB;
          const eurRub = fallbackData.rates.EUR ? usdRub / fallbackData.rates.EUR : usdRub * 1.16;

          setRates({
            usdRub,
            eurRub,
            lastUpdated: new Date(),
            source: 'ExchangeRate-API (Fallback)',
          });
          return;
        }
      } catch (fallbackErr) {
        console.error('All exchange API attempts failed:', fallbackErr);
        setError('Не удалось загрузить актуальные курсы валют. Проверьте интернет-соединение.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Format currency
  const formatRate = (num: number): string => {
    return num.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Converted value calculation
  const parsedAmount = parseFloat(calculatorAmount.replace(/\s+/g, '').replace(',', '.')) || 0;
  const currentRate = calculatorCurrency === 'USD' ? rates?.usdRub : rates?.eurRub;
  const convertedTotal = currentRate ? parsedAmount * currentRate : 0;

  // Format timestamp
  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div
      id="currency-widget"
      className="bg-[#11141A] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all flex flex-col justify-between h-full"
    >
      {/* 1. Header: Title, Live indicator & Refresh button */}
      <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Курсы валют</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Онлайн
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Актуальные курсы валют
            </p>
          </div>
        </div>

        <button
          id="currency-refresh-btn"
          onClick={fetchRates}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-40 rounded-xl transition-all min-w-[34px] min-h-[34px] flex items-center justify-center"
          title="Обновить курсы валют"
          aria-label="Обновить курсы валют"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
        </button>
      </div>

      {/* 2. Main Rates Cards: USD and EUR */}
      <div className="my-3.5 space-y-3 flex-1 flex flex-col justify-between">
        {/* Error State */}
        {error && !rates && (
          <div className="p-3 bg-rose-500/[0.08] border border-rose-500/20 rounded-xl flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-rose-300 font-medium leading-snug">{error}</p>
              <button
                onClick={fetchRates}
                className="mt-2 text-[11px] text-white underline hover:no-underline font-semibold"
              >
                Повторить попытку
              </button>
            </div>
          </div>
        )}

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* USD Card */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-between hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                  $
                </div>
                <span className="text-xs font-semibold text-slate-200">USD</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">К рублю</span>
            </div>

            <div className="mt-1">
              {isLoading && !rates ? (
                <div className="h-6 w-20 bg-white/[0.06] rounded animate-pulse"></div>
              ) : (
                <div className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {rates ? `${formatRate(rates.usdRub)} ₽` : '—'}
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-0.5">
                $1 000 = {rates ? `${Math.round(rates.usdRub * 1000).toLocaleString('ru-RU')} ₽` : '—'}
              </div>
            </div>
          </div>

          {/* EUR Card */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-between hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  €
                </div>
                <span className="text-xs font-semibold text-slate-200">EUR</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">К рублю</span>
            </div>

            <div className="mt-1">
              {isLoading && !rates ? (
                <div className="h-6 w-20 bg-white/[0.06] rounded animate-pulse"></div>
              ) : (
                <div className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {rates ? `${formatRate(rates.eurRub)} ₽` : '—'}
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-0.5">
                €1 000 = {rates ? `${Math.round(rates.eurRub * 1000).toLocaleString('ru-RU')} ₽` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Fast Freelance Currency Calculator */}
        <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300">Калькулятор</span>
            {/* Currency selector toggle */}
            <div className="flex items-center p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setCalculatorCurrency('USD')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                  calculatorCurrency === 'USD'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCalculatorCurrency('EUR')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                  calculatorCurrency === 'EUR'
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EUR (€)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {calculatorCurrency === 'USD' ? '$' : '€'}
              </span>
              <input
                type="text"
                value={calculatorAmount}
                onChange={(e) => setCalculatorAmount(e.target.value)}
                placeholder="1000"
                className="w-full pl-6 pr-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] text-white text-xs font-medium rounded-lg focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="shrink-0 text-right min-w-[110px] py-1 px-2 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-lg">
              <div className="text-[9px] text-slate-400">Сумма в рублях</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 truncate">
                {convertedTotal.toLocaleString('ru-RU', {
                  maximumFractionDigits: 0,
                })}{' '}
                ₽
              </div>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500">Пресеты:</span>
            {['100', '500', '1500', '3000'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCalculatorAmount(preset)}
                className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                  calculatorAmount === preset
                    ? 'bg-white/[0.1] text-white border-white/[0.2]'
                    : 'text-slate-400 border-white/[0.04] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {calculatorCurrency === 'USD' ? '$' : '€'}{preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Footer: Last Updated timestamp & status */}
      <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Clock size={11} className="text-slate-500" />
          <span>
            {rates?.lastUpdated
              ? `Обновлено: ${formatTime(rates.lastUpdated)}`
              : 'Загрузка...'}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 truncate max-w-[150px]">
          {rates?.source || 'ЦБ РФ / Рыночный'}
        </span>
      </div>
    </div>
  );
};
