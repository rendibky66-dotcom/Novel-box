import React from 'react';
import { Novel, UserProfile } from '../types';
import { BookCover } from './BookCover';
import { formatDateIndo, formatMinutesToHours } from '../utils/helpers';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Compass, 
  Bookmark,
  Plus
} from 'lucide-react';

interface HomeViewProps {
  novels: Novel[];
  user: UserProfile;
  onOpenReader: (novel: Novel) => void;
  onOpenDetail: (novel: Novel) => void;
  onOpenAddModal: () => void;
  onSelectCategory: (category: string) => void;
  onGoToShelf: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  novels,
  user,
  onOpenReader,
  onOpenDetail,
  onOpenAddModal,
  onSelectCategory,
  onGoToShelf,
  onToggleFavorite
}) => {
  // Statistics
  const totalCount = novels.length;
  const inProgressNovels = novels.filter(n => n.progress.percentage > 0 && !n.progress.completed);
  const completedNovels = novels.filter(n => n.progress.completed);
  const totalMinutes = novels.reduce((acc, curr) => acc + (curr.progress.totalReadingTimeMinutes || 0), 0);
  const favoriteCount = novels.filter(n => n.isFavorite).length;

  // Most recent in-progress novel for the "Lanjutkan Membaca" Hero
  const continueNovel = [...inProgressNovels].sort((a, b) => {
    const timeA = new Date(a.progress.lastReadAt || 0).getTime();
    const timeB = new Date(b.progress.lastReadAt || 0).getTime();
    return timeB - timeA;
  })[0] || novels[0];

  // Recently added novels (sorted by createdAt)
  const recentNovels = [...novels].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 6);

  // Category counts
  const categories = ['Fantasy', 'Romance', 'Mystery', 'Horror', 'Sci-Fi', 'Petualangan'];

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#231545] via-[#160f30] to-[#0d091e] border border-purple-800/40 p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ruang Baca Pribadi Rendy Prayoga</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Selamat datang kembali, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">{user.name}</span>!
            </h1>
            <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed">
              Semua novel favoritmu kini tersusun rapi di satu tempat. Buka kembali halaman terakhirmu dan nikmati petualangan imajinasi tanpa batas.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGoToShelf}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer"
              >
                <span>Buka Rak Buku Digital</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-[#1d173b] hover:bg-[#28204f] text-purple-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-2 border border-purple-700/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Tambah Novel Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-[#120d29]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-purple-900/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <span className="text-xs text-purple-300/70 font-medium">Total Novel</span>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">{totalCount}</div>
              <span className="text-[10px] text-purple-400/80 mt-0.5">di rak digitalmu</span>
            </div>

            <div className="bg-[#120d29]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-purple-900/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-400 mb-1">
                <span className="text-xs text-purple-300/70 font-medium">Sedang Dibaca</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">{inProgressNovels.length}</div>
              <span className="text-[10px] text-amber-400/80 mt-0.5">progres aktif</span>
            </div>

            <div className="bg-[#120d29]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-purple-900/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-xs text-purple-300/70 font-medium">Selesai Dibaca</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">{completedNovels.length}</div>
              <span className="text-[10px] text-emerald-400/80 mt-0.5">tamat sukses</span>
            </div>

            <div className="bg-[#120d29]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-purple-900/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <span className="text-xs text-purple-300/70 font-medium">Waktu Baca</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">
                {formatMinutesToHours(totalMinutes)}
              </div>
              <span className="text-[10px] text-purple-400/80 mt-0.5">total durasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lanjutkan Membaca (Hero Card) */}
      {continueNovel && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Lanjutkan Membaca
              </h2>
            </div>
            <span className="text-xs text-purple-300/70">
              Terakhir dibaca: {formatDateIndo(continueNovel.progress.lastReadAt)}
            </span>
          </div>

          <div className="relative rounded-2xl bg-gradient-to-r from-[#1c1236] via-[#170e2f] to-[#120a26] border border-purple-700/40 p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center gap-6 group hover:border-purple-600 transition-all">
            {/* Book Cover */}
            <div 
              className="shrink-0 cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => onOpenReader(continueNovel)}
            >
              <BookCover novel={continueNovel} size="sm" showProgress />
            </div>

            {/* Book Info & Direct Read Button */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {continueNovel.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-purple-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Estimasi sisa {Math.max(10, Math.round(continueNovel.estimatedMinutes * (1 - continueNovel.progress.percentage / 100)))} menit</span>
                </div>
              </div>

              <div>
                <h3 
                  className="text-lg sm:text-xl font-bold text-white hover:text-purple-300 cursor-pointer transition-colors"
                  onClick={() => onOpenReader(continueNovel)}
                >
                  {continueNovel.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-300/80">
                  Karya <span className="font-medium text-purple-200">{continueNovel.author}</span>
                </p>
              </div>

              {/* Current Chapter & Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-purple-200">
                  <span className="font-medium truncate max-w-xs sm:max-w-md">
                    {continueNovel.chapters && continueNovel.chapters[continueNovel.progress.currentChapterIndex]
                      ? continueNovel.chapters[continueNovel.progress.currentChapterIndex].title
                      : `Halaman ${continueNovel.progress.currentPage} dari ${continueNovel.pageCount}`}
                  </span>
                  <span className="font-bold text-purple-400">
                    {continueNovel.progress.percentage}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#0e0a1f] rounded-full overflow-hidden border border-purple-900/40">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full transition-all duration-500 shadow-sm shadow-purple-500"
                    style={{ width: `${Math.max(5, continueNovel.progress.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenReader(continueNovel)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/40 hover:shadow-purple-600/60 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lanjut Baca Sekarang</span>
                </button>
                <button
                  onClick={() => onOpenDetail(continueNovel)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 text-xs sm:text-sm font-semibold border border-purple-800/40 transition-colors cursor-pointer"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Genre Pills */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Jelajahi Genre Novel</span>
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const count = novels.filter(n => n.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onGoToShelf();
                }}
                className="px-4 py-2 rounded-xl bg-[#140e2b] hover:bg-purple-950/60 border border-purple-800/40 hover:border-purple-600 text-xs font-semibold text-purple-200 hover:text-white shrink-0 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{cat}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Novel Terbaru Ditambahkan */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Novel Terbaru Ditambahkan
            </h2>
          </div>
          <button
            onClick={onGoToShelf}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>Lihat Semua ({novels.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {recentNovels.map(novel => (
            <div 
              key={novel.id} 
              className="flex flex-col group cursor-pointer"
              onClick={() => onOpenDetail(novel)}
            >
              {/* Cover with interactive hover & buttons */}
              <div className="relative mb-2.5 transition-transform duration-300 group-hover:-translate-y-1.5">
                <BookCover novel={novel} size="md" className="w-full aspect-[2/3] h-auto" />
                
                {/* Favorite Button Overlay */}
                <button
                  onClick={(e) => onToggleFavorite(novel.id, e)}
                  className={`absolute top-2 right-2 z-30 p-1.5 rounded-full backdrop-blur-md transition-all ${
                    novel.isFavorite 
                      ? 'bg-rose-600/90 text-white' 
                      : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/80'
                  }`}
                  title={novel.isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                >
                  <Heart className={`w-3.5 h-3.5 ${novel.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Quick Read Overlay Button on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center p-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReader(novel);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/50 flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca</span>
                  </button>
                </div>
              </div>

              {/* Title & Author */}
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                  {novel.title}
                </h4>
                <p className="text-[11px] text-purple-300/70 truncate">
                  {novel.author}
                </p>
              </div>

              {/* Progress mini indicator */}
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-purple-400 font-medium">{novel.category}</span>
                <span className={novel.progress.completed ? 'text-emerald-400 font-bold' : 'text-purple-300/80'}>
                  {novel.progress.completed ? 'Tamat' : `${novel.progress.percentage}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
