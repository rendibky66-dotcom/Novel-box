import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { UserProfile } from '../types';
import { BookOpen, Sparkles, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('rendibky66@gmail.com');
  const [password, setPassword] = useState('rendy123');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickLoginRendy = async () => {
    try {
      const user = await StorageService.loginUserOnline('rendibky66@gmail.com', 'rendy123');
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const user = await StorageService.loginUserOnline(email, password);
        onSuccess(user);
        onClose();
      } else {
        if (!name.trim()) {
          setErrorMsg('Nama lengkap wajib diisi.');
          return;
        }
        const newUser = await StorageService.registerUserOnline(name, email, password);
        onSuccess(newUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#110c26] border border-purple-800/50 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative ambient top header */}
        <div className="p-6 bg-gradient-to-br from-[#231447] to-[#120a26] text-center border-b border-purple-900/40 relative">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/40 mb-3 border border-purple-400/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            NOVEL<span className="text-purple-400">BOX</span>
          </h2>
          <p className="text-xs text-purple-300/80 mt-0.5">
            Your Novels, All in One Place.
          </p>

          {/* Quick Login Badge for Rendy Prayoga */}
          <div className="mt-4">
            <button
              onClick={handleQuickLoginRendy}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Masuk Cepat Sebagai Rendy (Demo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher (Masuk vs Buat Akun) */}
        <div className="flex border-b border-purple-900/40 bg-[#160f33]">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
              mode === 'login'
                ? 'text-white border-b-2 border-purple-500 bg-[#1c1340]'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
              mode === 'register'
                ? 'text-white border-b-2 border-purple-500 bg-[#1c1340]'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Buat Akun Baru
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-200">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Nama pembaca"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181136] text-white pl-9 pr-3 py-2 text-xs rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-200">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181136] text-white pl-9 pr-3 py-2 text-xs rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-200">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181136] text-white pl-9 pr-3 py-2 text-xs rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/40 transition-all cursor-pointer"
            >
              {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Baru'}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-purple-400 hover:text-white transition-colors"
            >
              Lanjutkan tanpa masuk (Mode Tamu)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
