import React, { useState, useEffect } from 'react';
import { Novel, UserProfile, ReadingSettings } from './types';
import { StorageService } from './services/storage';
import { GENRE_LIST } from './data/initialNovels';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { BookshelfView } from './components/BookshelfView';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { AddNovelModal } from './components/AddNovelModal';
import { NovelDetailModal } from './components/NovelDetailModal';
import { ReaderModal } from './components/ReaderModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { EditNovelModal } from './components/EditNovelModal';
import { 
  Home, 
  Library, 
  Heart, 
  History, 
  PlusCircle, 
  Search, 
  BookOpen,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [user, setUser] = useState<UserProfile>(StorageService.getUser());
  const [settings, setSettings] = useState<ReadingSettings>(StorageService.getReadingSettings());
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(StorageService.getThemeMode());
  
  // Navigation & Filters
  const [currentTab, setCurrentTab] = useState<'home' | 'shelf' | 'favorites' | 'history'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const [detailNovel, setDetailNovel] = useState<Novel | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [readingNovel, setReadingNovel] = useState<Novel | null>(null);
  const [readingChapterIndex, setReadingChapterIndex] = useState<number>(0);

  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on load
  useEffect(() => {
    async function loadData() {
      try {
        const loadedNovels = await StorageService.getNovels();
        setNovels(loadedNovels);
      } catch (err) {
        console.error('Error loading novels:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    StorageService.saveThemeMode(newTheme);
  };

  // Add Novel
  const handleAddNovel = async (newNovel: Novel) => {
    const updated = await StorageService.addNovel(newNovel);
    setNovels(updated);
    showNotification(`"${newNovel.title}" berhasil ditambahkan ke rak!`);
    setCurrentTab('shelf');
  };

  // Update Novel (Edit)
  const handleUpdateNovel = async (updatedNovel: Novel) => {
    const updated = await StorageService.updateNovel(updatedNovel);
    setNovels(updated);
    showNotification(`Data "${updatedNovel.title}" berhasil diperbarui di database online!`);
    if (detailNovel && detailNovel.id === updatedNovel.id) {
      setDetailNovel(updatedNovel);
    }
  };

  // Delete Novel
  const handleDeleteNovel = async (id: string, title: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm(`Yakin ingin menghapus novel "${title}" dari koleksi?`)) {
      const updated = await StorageService.deleteNovel(id);
      setNovels(updated);
      showNotification(`Novel "${title}" telah dihapus.`);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = await StorageService.toggleFavorite(id);
    setNovels(updated);
    const target = updated.find(n => n.id === id);
    if (target?.isFavorite) {
      showNotification(`"${target.title}" ditambahkan ke Favorit!`);
    }
  };

  // Save Reading Progress
  const handleSaveProgress = async (novelId: string, newProgress: Partial<Novel['progress']>) => {
    const current = novels.find(n => n.id === novelId);
    if (!current) return;

    const mergedProgress = {
      ...current.progress,
      ...newProgress,
      totalReadingTimeMinutes: (current.progress.totalReadingTimeMinutes || 0) + 1
    };

    const updatedNovel: Novel = {
      ...current,
      progress: mergedProgress
    };

    const updatedList = await StorageService.updateNovel(updatedNovel);
    setNovels(updatedList);

    // Keep active reader state in sync
    if (readingNovel && readingNovel.id === novelId) {
      setReadingNovel(updatedNovel);
    }
    if (detailNovel && detailNovel.id === novelId) {
      setDetailNovel(updatedNovel);
    }
  };

  // Open Reader
  const handleOpenReader = (novel: Novel, chapterIndex?: number) => {
    setDetailNovel(null);
    setReadingNovel(novel);
    setReadingChapterIndex(chapterIndex !== undefined ? chapterIndex : novel.progress.currentChapterIndex || 0);
  };

  // Export Backup File (HP & Laptop Sync)
  const handleExportBackup = async () => {
    try {
      const jsonStr = await StorageService.exportLibraryJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NOVEL_BOX_Koleksi_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('File cadangan koleksi berhasil diunduh!');
    } catch {
      showNotification('Gagal membuat file cadangan.');
    }
  };

  // Import Backup File
  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const importedNovels = await StorageService.importLibraryJSON(text);
      setNovels(importedNovels);
      setUser(StorageService.getUser());
      showNotification('Koleksi berhasil dipulihkan dari file cadangan!');
      setIsProfileModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses file cadangan.');
    }
  };

  // Reset to default sample novels
  const handleResetDefaults = async () => {
    const defaultList = await StorageService.resetToDefaults();
    setNovels(defaultList);
    setUser(StorageService.getUser());
    showNotification('Koleksi berhasil direset ke novel bawaan Rendy Prayoga.');
    setIsProfileModalOpen(false);
  };

  // User Profile update
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  // Logout / Switch Account
  const handleLogout = () => {
    setIsProfileModalOpen(false);
    setIsAuthModalOpen(true);
  };

  // Filtered novels based on top navbar search
  const displayedNovels = searchQuery.trim()
    ? novels.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : novels;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      themeMode === 'dark' 
        ? 'bg-[#090714] text-[#f1f2f6]' 
        : 'bg-[#f4f2fa] text-[#1c1333]'
    }`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-2xl bg-purple-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-purple-400/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        user={user}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-24 md:pb-16">
        
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
              Membuka Rak NOVEL BOX...
            </p>
          </div>
        ) : (
          <>
            {/* Search Filter Info Banner (if typing in navbar search) */}
            {searchQuery.trim() && (
              <div className="mb-6 p-4 rounded-2xl bg-[#160f33] border border-purple-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <Search className="w-4 h-4 text-purple-400" />
                  <span>
                    Hasil pencarian untuk "<strong className="text-white">{searchQuery}</strong>" (Ditemukan {displayedNovels.length} novel)
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-purple-400 hover:text-white font-semibold"
                >
                  Bersihkan
                </button>
              </div>
            )}

            {/* View 1: Beranda */}
            {currentTab === 'home' && (
              <HomeView
                novels={displayedNovels}
                user={user}
                onOpenReader={(novel) => handleOpenReader(novel)}
                onOpenDetail={(novel) => setDetailNovel(novel)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setCurrentTab('shelf');
                }}
                onGoToShelf={() => setCurrentTab('shelf')}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* View 2: Rak Koleksi Novel */}
            {currentTab === 'shelf' && (
              <BookshelfView
                novels={displayedNovels}
                onOpenReader={(novel) => handleOpenReader(novel)}
                onOpenDetail={(novel) => setDetailNovel(novel)}
                onToggleFavorite={handleToggleFavorite}
                onDeleteNovel={handleDeleteNovel}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenEdit={(novel) => setEditingNovel(novel)}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryList={GENRE_LIST}
              />
            )}

            {/* View 3: Favorit */}
            {currentTab === 'favorites' && (
              <FavoritesView
                novels={displayedNovels}
                onOpenReader={(novel) => handleOpenReader(novel)}
                onOpenDetail={(novel) => setDetailNovel(novel)}
                onToggleFavorite={handleToggleFavorite}
                onGoToShelf={() => setCurrentTab('shelf')}
              />
            )}

            {/* View 4: Riwayat Baca */}
            {currentTab === 'history' && (
              <HistoryView
                novels={displayedNovels}
                onOpenReader={(novel) => handleOpenReader(novel)}
                onOpenDetail={(novel) => setDetailNovel(novel)}
                onGoToShelf={() => setCurrentTab('shelf')}
              />
            )}
          </>
        )}

      </main>

      {/* Mobile Bottom Dock Navigation (Smartphone Navigation) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c091c]/95 backdrop-blur-lg border-t border-purple-900/40 px-3 py-2 flex items-center justify-around select-none">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-purple-400 font-bold' : 'text-purple-300/60'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={() => setCurrentTab('shelf')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'shelf' ? 'text-purple-400 font-bold' : 'text-purple-300/60'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px]">Rak Buku</span>
        </button>

        {/* Center Add Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 border border-purple-400/50 cursor-pointer"
          title="Tambah Novel"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentTab('favorites')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'favorites' ? 'text-purple-400 font-bold' : 'text-purple-300/60'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">Favorit</span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'history' ? 'text-purple-400 font-bold' : 'text-purple-300/60'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Riwayat</span>
        </button>
      </nav>

      {/* Modals */}
      <AddNovelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddNovel={handleAddNovel}
      />

      <EditNovelModal
        novel={editingNovel}
        isOpen={!!editingNovel}
        onClose={() => setEditingNovel(null)}
        onUpdateNovel={handleUpdateNovel}
      />

      <NovelDetailModal
        novel={detailNovel}
        isOpen={!!detailNovel}
        onClose={() => setDetailNovel(null)}
        onOpenReader={(novel, chapterIndex) => handleOpenReader(novel, chapterIndex)}
        onToggleFavorite={handleToggleFavorite}
        onDeleteNovel={handleDeleteNovel}
        onUpdateProgress={(novel, newProgress) => handleSaveProgress(novel.id, newProgress)}
        onOpenEdit={(novel) => {
          setEditingNovel(novel);
          setDetailNovel(null);
        }}
        onUpdateNovel={handleUpdateNovel}
      />

      <ReaderModal
        novel={readingNovel}
        initialChapterIndex={readingChapterIndex}
        isOpen={!!readingNovel}
        onClose={() => setReadingNovel(null)}
        onSaveProgress={handleSaveProgress}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          StorageService.saveReadingSettings(newSettings);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        novels={novels}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDefaults={handleResetDefaults}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async (loggedUser) => {
          setUser(loggedUser);
          showNotification(`Selamat datang, ${loggedUser.name}!`);
          setIsLoading(true);
          try {
            const userNovels = await StorageService.getNovels();
            setNovels(userNovels);
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        novels={novels}
        onOpenDetail={(novel) => setDetailNovel(novel)}
        onOpenReader={(novel) => handleOpenReader(novel)}
      />

    </div>
  );
}
