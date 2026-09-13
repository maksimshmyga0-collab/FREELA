import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, AlertCircle, RefreshCw, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebase';

interface EmailVerificationScreenProps {
  onBackToRegister: () => void;
  targetEmail?: string;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  onBackToRegister,
  targetEmail,
}) => {
  const { completeRegistration, resendVerificationCode, checkEmailVerified, pendingEmail } = useAuth();

  const emailToVerify = targetEmail || pendingEmail || auth.currentUser?.email || 'Ваш email';

  // Code digits input for users who copy/paste the verification code or action code from email
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsUntilResend, setSecondsUntilResend] = useState<number>(60);
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (secondsUntilResend <= 0) return;
    const timer = setInterval(() => {
      setSecondsUntilResend((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsUntilResend]);

  // Periodic automatic polling: if user confirms email in their mail client/browser, CLARYFE auto-detects it!
  useEffect(() => {
    let active = true;

    const interval = setInterval(async () => {
      if (!active) return;
      try {
        const verified = await checkEmailVerified();
        if (verified && active) {
          setSuccessMsg('Email успешно подтвержден! Выполняется вход...');
          clearInterval(interval);
        }
      } catch {
        // quiet check in background
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [checkEmailVerified]);

  const handleManualCheck = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const verified = await checkEmailVerified();
      if (verified) {
        setSuccessMsg('Email успешно подтвержден! Добро пожаловать в CLARYFE.');
      } else {
        setError('Ссылка подтверждения пока не активирована. Пожалуйста, откройте полученное письмо и нажмите на ссылку активации.');
      }
    } catch (err: any) {
      setError(err?.message || 'Не удалось проверить статус подтверждения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || codeDigits.join('');
    if (!fullCode.trim()) {
      setError('Введите код или вставьте ссылку из письма');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await completeRegistration(fullCode);
      setSuccessMsg('Email успешно подтвержден!');
    } catch (err: any) {
      setError(err?.message || 'Неверный код или ссылка подтверждения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    const cleaned = val.trim();

    if (cleaned.length <= 1) {
      const newDigits = [...codeDigits];
      newDigits[index] = cleaned;
      setCodeDigits(newDigits);

      if (cleaned && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (cleaned && index === 5 && newDigits.every((d) => d !== '')) {
        handleVerifyCode(newDigits.join(''));
      }
      return;
    }

    // Pasted code
    if (cleaned.length > 1) {
      const newDigits = [...codeDigits];
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((c, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = c;
        }
      });
      setCodeDigits(newDigits);

      const nextFocus = Math.min(5, index + chars.length);
      inputRefs.current[nextFocus]?.focus();

      if (newDigits.every((d) => d !== '')) {
        handleVerifyCode(newDigits.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!pastedData) return;

    // If pasted an oobCode or URL
    if (pastedData.includes('oobCode=') || pastedData.length > 6) {
      handleVerifyCode(pastedData);
      return;
    }

    const newDigits = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setCodeDigits(newDigits);
    if (pastedData.length >= 6) {
      handleVerifyCode(pastedData);
    }
  };

  const handleResend = async () => {
    if (secondsUntilResend > 0 || isResending) return;

    setError(null);
    setSuccessMsg(null);
    setIsResending(true);

    try {
      await resendVerificationCode();
      setSecondsUntilResend(60);
      setSuccessMsg('Новое письмо с подтверждением успешно отправлено на вашу почту');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err?.message || 'Не удалось отправить письмо повторно. Пожалуйста, попробуйте позже.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Icon and Title */}
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-inner">
          <Mail size={22} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Подтвердите email
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          На вашу почту отправлено письмо со ссылкой для активации аккаунта
        </p>
      </div>

      {/* Target Email Display */}
      <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-white truncate">
            {emailToVerify}
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 shrink-0">
          Firebase
        </span>
      </div>

      {/* Live Status Notice */}
      <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-start gap-3 text-xs text-violet-200">
        <ShieldCheck size={18} className="text-violet-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Проверьте ваш почтовый ящик</p>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Перейдите по ссылке в письме от CLARYFE (Firebase). После перехода аккаунт активируется автоматически, или нажмите кнопку ниже.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Verification Action */}
      <button
        type="button"
        onClick={handleManualCheck}
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-white text-slate-950 hover:bg-slate-200 text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer min-h-[44px]"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Я перешел по ссылке в письме</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>

      {/* Optional Code or URL Input accordion */}
      <div className="border border-white/[0.06] rounded-2xl p-3 bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">У вас есть код или ссылка?</span>
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer"
          >
            {showCodeInput ? 'Скрыть' : 'Ввести вручную'}
          </button>
        </div>

        {showCodeInput && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
            <label className="block text-[11px] text-slate-300 text-center">
              Вставьте код или ссылку подтверждения:
            </label>
            <div className="flex items-center justify-between gap-1.5" onPaste={handlePaste}>
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isSubmitting}
                  className={`w-10 h-11 text-center text-base font-mono font-bold bg-white/[0.04] border rounded-xl text-white focus:outline-none transition-all ${
                    digit
                      ? 'border-white/40 bg-[#161a22]'
                      : 'border-white/[0.08] hover:border-white/[0.18]'
                  } focus:border-white/50`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleVerifyCode()}
              disabled={isSubmitting || codeDigits.every((d) => !d)}
              className="w-full py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              Подтвердить введенный код
            </button>
          </div>
        )}
      </div>

      {/* Resend button with timer */}
      <div className="pt-1 text-center flex flex-col items-center gap-2">
        {secondsUntilResend > 0 ? (
          <span className="text-xs text-slate-400">
            Отправить повторно через <strong className="text-white font-mono">{secondsUntilResend} сек</strong>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
            <span>Отправить письмо повторно</span>
          </button>
        )}

        <button
          type="button"
          onClick={onBackToRegister}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer mt-1"
        >
          ← Вернуться к авторизации
        </button>
      </div>
    </div>
  );
};
