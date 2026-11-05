import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Heart, 
  History, 
  Library, 
  Home, 
  Sun, 
  Moon, 
  Menu, 
  X,
  User,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'shelf' | 'favorites' | 'history';
  onSelectTab: (tab: 'home' | 'shelf' | 'favorites' | 'history') => void;
  onOpenAddModal: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  user: UserProfile;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenProfile,
  onOpenSearch,
  user,
  themeMode,
  onToggleTheme,
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0b0c10]/90 border-b border-purple-900/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Slogan */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
            onClick={() => onSelectTab('home')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform border border-purple-400/40">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center">
                  NOVEL<span className="text-purple-400 ml-0.5">BOX</span>
                </span>
                <span className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 font-medium tracking-tight hidden sm:block">
                Your Novels, All in One Place.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#151128]/80 p-1.5 rounded-full border border-purple-900/40 shadow-inner">
            <button
              onClick={() => onSelectTab('home')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <button
              onClick={() => onSelectTab('shelf')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'shelf'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Rak Buku</span>
            </button>
            <button
              onClick={() => onSelectTab('favorites')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'favorites'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorit</span>
            </button>
            <button
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat</span>
            </button>
          </nav>

          {/* Search Bar (Inline Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative mx-2">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari judul atau penulis..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#130f26] text-white pl-9 pr-8 py-2 text-xs rounded-full border border-purple-800/40 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-purple-300/40"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-purple-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-lg text-purple-300 hover:text-white hover:bg-white/5 border border-purple-900/30"
              title="Cari Novel"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-[#140f29] hover:bg-[#1f173f] text-purple-300 hover:text-white border border-purple-800/40 transition-colors shadow-xs"
              title={themeMode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-purple-300" />
              )}
            </button>

            {/* Tambah Novel Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-purple-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Novel</span>
              <span className="sm:hidden">Tambah</span>
            </button>

            {/* Profile Avatar / Menu */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#140f29] hover:bg-[#1e173d] border border-purple-800/40 transition-all cursor-pointer group"
              title="Profil & Pengaturan"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-purple-400/40 group-hover:ring-purple-400"
              />
              <span className="hidden xl:inline text-xs font-semibold text-purple-100 group-hover:text-white truncate max-w-[90px]">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/5 border border-purple-900/30"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0a1c] border-b border-purple-900/50 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari judul novel atau penulis..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#171233] text-white pl-9 pr-4 py-2 text-xs rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { onSelectTab('home'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentTab === 'home' ? 'bg-purple-600 text-white' : 'bg-[#151128] text-purple-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </button>
            <button
              onClick={() => { onSelectTab('shelf'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentTab === 'shelf' ? 'bg-purple-600 text-white' : 'bg-[#151128] text-purple-200'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Rak Buku</span>
            </button>
            <button
              onClick={() => { onSelectTab('favorites'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentTab === 'favorites' ? 'bg-purple-600 text-white' : 'bg-[#151128] text-purple-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Favorit</span>
            </button>
            <button
              onClick={() => { onSelectTab('history'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentTab === 'history' ? 'bg-purple-600 text-white' : 'bg-[#151128] text-purple-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
