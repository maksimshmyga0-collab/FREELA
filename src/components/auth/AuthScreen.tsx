import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenMode } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { EmailVerificationScreen } from './EmailVerificationScreen';
import { UnverifiedEmailError } from '../../services/authService';

export const AuthScreen: React.FC = () => {
  const { login, prepareRegistration, resetPassword, pendingEmail } = useAuth();

  const [mode, setMode] = useState<AuthScreenMode>(() => {
    return pendingEmail ? 'email_verification' : 'login';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pendingEmail) {
      setMode('email_verification');
    }
  }, [pendingEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const cleanEmail = email.trim();
        if (!cleanEmail || !password) {
          throw new Error('Заполните все обязательные поля');
        }
        await login(cleanEmail, password);
      } else if (mode === 'register') {
        const cleanEmail = email.trim();
        const cleanName = displayName.trim();

        if (!cleanName) {
          throw new Error('Укажите ваше имя');
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
          throw new Error('Укажите корректный адрес электронной почты');
        }
        if (password.length < 6) {
          throw new Error('Пароль должен содержать минимум 6 символов');
        }
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают');
        }

        // Firebase registration + send real email verification
        await prepareRegistration(cleanEmail, password, cleanName, specialization);
        setMode('email_verification');
      } else if (mode === 'forgot_password') {
        const cleanEmail = email.trim();
        if (!cleanEmail || !cleanEmail.includes('@')) {
          throw new Error('Укажите корректный адрес электронной почты');
        }
        await resetPassword(cleanEmail);
        setSuccessMsg('Письмо со ссылкой для сброса пароля отправлено на ваш email. Проверьте почту.');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setSuccessMsg(null);
        }, 3500);
      }
    } catch (err: any) {
      if (err instanceof UnverifiedEmailError) {
        setMode('email_verification');
        setError('Ваш email еще не подтвержден. Мы отправили ссылку активации на вашу почту.');
      } else {
        setError(err?.message || 'Произошла ошибка при авторизации');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0A0C10] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-[#11141A] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Brand Header */}
        {mode !== 'email_verification' && (
          <div className="text-center mb-7 flex flex-col items-center">
            <BrandLogo size="md" className="mb-3 justify-center" />

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'login' && 'Вход в аккаунт'}
              {mode === 'register' && 'Создание аккаунта'}
              {mode === 'forgot_password' && 'Восстановление пароля'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login' && 'Работай. Создавай. Развивайся.'}
              {mode === 'register' && 'Работай. Создавай. Развивайся.'}
              {mode === 'forgot_password' && 'Укажите email для получения ссылки на сброс пароля'}
            </p>
          </div>
        )}

        {/* Email verification screen view */}
        {mode === 'email_verification' ? (
          <EmailVerificationScreen
            targetEmail={email}
            onBackToRegister={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
          />
        ) : (
          <>
            {/* Tab switch: Вход / Регистрация */}
            {mode !== 'forgot_password' && (
              <div className="flex items-center p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-white/[0.1] text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-white/[0.1] text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Регистрация
                </button>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Extra Fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Ваше имя *
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Например: Максим"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:bg-[#151921] focus:border-white/[0.25] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Специализация
                    </label>
                    <div className="relative">
                      <Briefcase
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Product Designer, Разработчик..."
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:bg-[#151921] focus:border-white/[0.25] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email *
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:bg-[#151921] focus:border-white/[0.25] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Пароль *</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        Забыли пароль?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:bg-[#151921] focus:border-white/[0.25] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Подтверждение пароля *
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:bg-[#151921] focus:border-white/[0.25] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-white text-slate-950 hover:bg-slate-200 text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Войти в CLARYFE'}
                      {mode === 'register' && 'Создать аккаунт'}
                      {mode === 'forgot_password' && 'Отправить ссылку для сброса'}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              {mode === 'forgot_password' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Вернуться ко входу
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Firebase Authentication + Изолированное хранилище Firestore
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
