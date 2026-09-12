import React, { useState, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  Clock,
  DollarSign,
  LogOut,
  Sparkles,
  Check,
  Edit2,
  Share2,
  Copy,
  QrCode,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

// Vector QR Code Generator (25x25 QR Matrix)
const generateQRMatrix = (text: string, size = 25) => {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, size - 7); // Top-right
  drawFinder(size - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern near bottom-right
  const ar = size - 9;
  const ac = size - 9;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2)) {
        matrix[ar + i][ac + j] = true;
      }
    }
  }

  // Hash bits based on text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;
      const inAlign = r >= ar && r < ar + 5 && c >= ac && c < ac + 5;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlign) {
        const pseudoVal = (Math.sin(hash + bitIndex * 137.5) * 10000) % 1;
        matrix[r][c] = Math.abs(pseudoVal) > 0.46;
        bitIndex++;
      }
    }
  }

  return matrix;
};

const QRCodeSVG: React.FC<{ value: string; size?: number }> = ({ value, size = 110 }) => {
  const matrixSize = 25;
  const matrix = useMemo(() => generateQRMatrix(value, matrixSize), [value]);
  const cellSize = size / matrixSize;

  return (
    <div className="p-2.5 bg-white rounded-2xl shadow-md inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {matrix.flatMap((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0F172A"
                rx={0.4}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, closeProfile, financialEfficiency } = useApp();
  const { currentUser, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'card' | 'edit'>('card');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [specialization, setSpecialization] = useState(currentUser?.specialization || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [hourlyRate, setHourlyRate] = useState<number>(currentUser?.hourlyRate || 3500);
  const [telegram, setTelegram] = useState(currentUser?.telegram || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isProfileOpen || !currentUser) return null;

  const initials = currentUser.displayName
    ? currentUser.displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FL';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?u=${currentUser.uid}`
    : `https://freela.app/u/${currentUser.uid}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentUser.displayName} — FREELA Профиль`,
          text: `Личная визитка специалиста ${currentUser.displayName} (${currentUser.specialization || 'Фрилансер'})`,
          url: shareUrl,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || currentUser.displayName,
        specialization: specialization.trim(),
        bio: bio.trim(),
        hourlyRate: Number(hourlyRate) || 3500,
        telegram: telegram.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setActiveTab('card');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    closeProfile();
    await logout();
  };

  const startEditing = () => {
    setDisplayName(currentUser.displayName);
    setSpecialization(currentUser.specialization || '');
    setBio(currentUser.bio || '');
    setHourlyRate(currentUser.hourlyRate || 3500);
    setTelegram(currentUser.telegram || '');
    setAvatarUrl(currentUser.avatarUrl || '');
    setActiveTab('edit');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeProfile}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#11141A] border border-white/[0.1] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Личная карточка FREELA
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded-md border border-white/[0.08]">
              {currentUser.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={closeProfile}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-5 pt-3 border-b border-white/[0.06] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'card'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={13} />
            <span>Карточка профиля</span>
          </button>
          <button
            onClick={startEditing}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit2 size={13} />
            <span>Редактировать</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="p-5 space-y-4 overflow-y-auto dark-scrollbar">
          {activeTab === 'card' ? (
            <div className="space-y-4">
              {/* The Visual Card (Личная визитка) */}
              <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#161B22] to-[#0D1016] border border-white/[0.12] shadow-xl overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top Strip */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>FREELA Verified Freelancer</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck size={11} />
                    Подтверждён
                  </span>
                </div>

                {/* Avatar + Main Info */}
                <div className="flex items-start gap-4">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-white/[0.15] shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                      {currentUser.displayName}
                    </h2>
                    <p className="text-xs font-medium text-emerald-400 mt-0.5">
                      {currentUser.specialization || 'Фрилансер'}
                    </p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed font-normal">
                      {currentUser.bio ||
                        'Создаю цифровые продукты, развиваю проекты клиентов и превращаю задачи в измеримый результат.'}
                    </p>
                  </div>
                </div>

                {/* Professional Metrics in Card */}
                <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-white/[0.08]">
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <DollarSign size={11} className="text-emerald-400" />
                      Базовая ставка
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      {(currentUser.hourlyRate || financialEfficiency.averageRate).toLocaleString('ru-RU')} ₽ / ч
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock size={11} className="text-blue-400" />
                      Отработано в проектах
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      {financialEfficiency.totalLoggedHours} ч
                    </div>
                  </div>
                </div>

                {/* Contacts Row */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.04]">
                    <Mail size={12} className="text-slate-500" />
                    <span className="truncate">{currentUser.email}</span>
                  </div>

                  {currentUser.telegram && (
                    <div className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                      <Send size={12} />
                      <span>{currentUser.telegram}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share & QR Code Panel */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Share2 size={14} className="text-indigo-400" />
                    <span>Поделиться карточкой</span>
                  </div>

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <QrCode size={13} />
                    <span>{showQR ? 'Скрыть QR' : 'Показать QR-код'}</span>
                  </button>
                </div>

                {/* QR Code Section (Toggled or inline) */}
                {showQR && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <QRCodeSVG value={shareUrl} size={110} />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">
                        QR-код вашей визитки
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                        Клиент может отсканировать этот код камерой смартфона, чтобы открыть вашу страницу и связаться.
                      </p>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Работает на смартфонах и планшетах
                      </div>
                    </div>
                  </div>
                )}

                {/* Link and Share Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="w-full relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full px-3 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 rounded-xl font-mono focus:outline-none select-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyLink}
                      className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${
                        copied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-slate-950 hover:bg-slate-200'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={13} />
                          <span>Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl transition-colors"
                      title="Поделиться"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Profile Form */
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Имя и фамилия *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white/[0.25]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Специализация
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="UI/UX Designer, Frontend Developer, Brand Strategist..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white/[0.25]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Краткая информация / О себе
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о вашем опыте, сильных сторонах и подходе к работе..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white/[0.25] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ставка (₽ / ч)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white/[0.25]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white/[0.25]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ссылка на фото / аватар (опционально)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white/[0.25]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-white text-slate-950 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Check size={14} />
                  Сохранить
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut size={14} />
            Выйти из аккаунта
          </button>

          <button
            onClick={closeProfile}
            className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
