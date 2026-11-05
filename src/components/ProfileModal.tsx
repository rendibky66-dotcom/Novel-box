import React, { useState } from 'react';
import { UserProfile, Novel } from '../types';
import { formatMinutesToHours } from '../utils/helpers';
import { 
  X, 
  User, 
  Mail, 
  Award, 
  Target, 
  Download, 
  Upload, 
  LogOut, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Laptop
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  novels: Novel[];
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetDefaults: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  novels,
  onExportBackup,
  onImportBackup,
  onResetDefaults,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [readingGoal, setReadingGoal] = useState(user.readingGoalPerYear);
  const [avatar, setAvatar] = useState(user.avatar);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const completedCount = novels.filter(n => n.progress.completed).length;
  const inProgressCount = novels.filter(n => n.progress.percentage > 0 && !n.progress.completed).length;
  const totalMinutes = novels.reduce((acc, curr) => acc + (curr.progress.totalReadingTimeMinutes || 0), 0);
  const goalPercent = Math.min(100, Math.round((completedCount / (user.readingGoalPerYear || 1)) * 100));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      bio: bio.trim(),
      readingGoalPerYear: Number(readingGoal) || 20,
      avatar
    });
    setIsEditing(false);
    setFeedbackMsg('Profil berhasil diperbarui!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#110c26] border border-purple-800/50 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#211542] to-[#140e2b] border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Profil Pembaca & Akun
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* User Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-[#160f33] border border-purple-800/40">
            <img
              src={avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500 shadow-lg"
            />
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-extrabold text-lg text-white">{user.name}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/40 font-mono">
                  Aktif Sejak {user.joinedAt}
                </span>
              </div>
              <p className="text-xs text-purple-300/80 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>{user.email}</span>
              </p>
              <p className="text-xs text-purple-200/90 pt-1 leading-relaxed font-reader-serif">
                "{user.bio}"
              </p>
            </div>
          </div>

          {/* Reading Target / Goal Progress */}
          <div className="p-4 rounded-2xl bg-[#160f33] border border-purple-800/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Target Membaca Tahunan</span>
              </span>
              <span className="font-bold text-white font-mono">
                {completedCount} / {user.readingGoalPerYear} Novel ({goalPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, goalPercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-purple-300/70">
              {goalPercent >= 100 
                ? 'Luar biasa! Target tahunanmu telah tercapai!' 
                : `Tinggal ${Math.max(0, user.readingGoalPerYear - completedCount)} novel lagi untuk mencapai targetmu.`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#140e2d] border border-purple-900/30">
              <BookOpen className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-base font-bold text-white">{novels.length}</div>
              <span className="text-[10px] text-purple-300/70">Total Koleksi</span>
            </div>
            <div className="p-3 rounded-xl bg-[#140e2d] border border-purple-900/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-base font-bold text-white">{completedCount}</div>
              <span className="text-[10px] text-purple-300/70">Tamat Dibaca</span>
            </div>
            <div className="p-3 rounded-xl bg-[#140e2d] border border-purple-900/30">
              <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <div className="text-base font-bold text-white">{formatMinutesToHours(totalMinutes)}</div>
              <span className="text-[10px] text-purple-300/70">Waktu Baca</span>
            </div>
          </div>

          {/* SINKRONISASI & CADANGAN (HP & LAPTOP SYNC) */}
          <div className="p-4 rounded-2xl bg-[#160f33] border border-purple-800/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
              <div className="flex items-center gap-1 text-purple-400">
                <Smartphone className="w-4 h-4" />
                <Laptop className="w-4 h-4" />
              </div>
              <span>Sinkronisasi Koleksi (HP & Laptop)</span>
            </div>
            <p className="text-[11px] text-purple-300/80 leading-relaxed">
              Pindahkan koleksi novel dan progres bacamu antara HP dan laptop dengan mengekspor file cadangan NOVEL BOX.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={onExportBackup}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-100 text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-500/40 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-purple-300" />
                <span>Unduh File Cadangan</span>
              </button>

              <label className="px-3.5 py-2.5 rounded-xl bg-[#201540] hover:bg-[#2b1c54] text-purple-100 text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-600/40 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-purple-300" />
                <span>Pulihkan Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Edit Profile Accordion */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 p-4 rounded-2xl bg-[#140e2d] border border-purple-900/40">
              <h4 className="text-xs font-bold text-white">Ubah Data Diri</h4>
              <div className="space-y-1">
                <label className="text-[11px] text-purple-300">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b123a] text-white px-3 py-2 rounded-xl text-xs border border-purple-800/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-purple-300">Bio Singkat</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#1b123a] text-white px-3 py-2 rounded-xl text-xs border border-purple-800/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-purple-300">Target Buku per Tahun</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={readingGoal}
                  onChange={(e) => setReadingGoal(Number(e.target.value))}
                  className="w-full bg-[#1b123a] text-white px-3 py-2 rounded-xl text-xs border border-purple-800/40"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-purple-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-xs shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 text-xs font-semibold border border-purple-900/40 transition-colors"
            >
              Ubah Data Profil
            </button>
          )}

          {/* Bottom Actions: Reset to defaults & Logout */}
          <div className="pt-4 border-t border-purple-900/40 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (window.confirm('Kembalikan seluruh koleksi ke data novel bawaan Rendy Prayoga?')) {
                  onResetDefaults();
                }
              }}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Novel Bawaan</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Yakin ingin keluar dari akun?')) {
                  onLogout();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
