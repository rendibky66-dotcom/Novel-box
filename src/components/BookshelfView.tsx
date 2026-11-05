import React, { useState } from 'react';
import { Novel } from '../types';
import { BookCover } from './BookCover';
import { formatDateIndo } from '../utils/helpers';
import { 
  BookOpen, 
  Heart, 
  Trash2, 
  Clock, 
  Star, 
  Grid3X3, 
  List, 
  Layers, 
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Info,
  Edit3
} from 'lucide-react';

interface BookshelfViewProps {
  novels: Novel[];
  onOpenReader: (novel: Novel) => void;
  onOpenDetail: (novel: Novel) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteNovel: (id: string, title: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
  onOpenEdit?: (novel: Novel) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryList: string[];
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  novels,
  onOpenReader,
  onOpenDetail,
  onToggleFavorite,
  onDeleteNovel,
  onOpenAddModal,
  onOpenEdit,
  selectedCategory,
  onSelectCategory,
  categoryList
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list'>('shelf');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reading' | 'unread' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'title' | 'author' | 'progress' | 'rating'>('latest');
  const [shelfSearch, setShelfSearch] = useState('');

  // Filtering
  const filteredNovels = novels.filter(novel => {
    // Category
    if (selectedCategory !== 'Semua' && novel.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Status
    if (statusFilter === 'reading' && (novel.progress.percentage === 0 || novel.progress.completed)) {
      return false;
    }
    if (statusFilter === 'unread' && novel.progress.percentage > 0) {
      return false;
    }
    if (statusFilter === 'completed' && !novel.progress.completed) {
      return false;
    }
    // Search keyword
    if (shelfSearch.trim()) {
      const q = shelfSearch.toLowerCase();
      const matchTitle = novel.title.toLowerCase().includes(q);
      const matchAuthor = novel.author.toLowerCase().includes(q);
      const matchCategory = novel.category.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchCategory) return false;
    }
    return true;
  });

  // Sorting
  const sortedNovels = [...filteredNovels].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'author') return a.author.localeCompare(b.author);
    if (sortBy === 'progress') return b.progress.percentage - a.progress.percentage;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    // default: latest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Group books into shelves (e.g. 6-8 books per shelf plank)
  const booksPerShelf = 7;
  const shelves: Novel[][] = [];
  for (let i = 0; i < sortedNovels.length; i += booksPerShelf) {
    shelves.push(sortedNovels.slice(i, i + booksPerShelf));
  }
  if (shelves.length === 0) {
    shelves.push([]); // empty shelf for visual
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#140e2b]/80 p-4 sm:p-5 rounded-2xl border border-purple-900/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            <span>Rak Koleksi Novel</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium">
              {sortedNovels.length} Novel
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Susun dan buka seluruh koleksi digitalmu layaknya di perpustakaan pribadi.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <div className="bg-[#0b0819] p-1 rounded-xl border border-purple-900/50 flex items-center gap-1">
            <button
              onClick={() => setViewMode('shelf')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'shelf'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-purple-300/70 hover:text-white hover:bg-white/5'
              }`}
              title="Tampilan Rak Buku Fisik (3D)"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Rak Buku</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-purple-300/70 hover:text-white hover:bg-white/5'
              }`}
              title="Tampilan Kartu Sampul (Grid)"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid Sampul</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-purple-300/70 hover:text-white hover:bg-white/5'
              }`}
              title="Tampilan Daftar Tabel (List)"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Daftar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-[#110c24]/90 p-4 rounded-2xl border border-purple-900/30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari di koleksi rak ini..."
              value={shelfSearch}
              onChange={(e) => setShelfSearch(e.target.value)}
              className="w-full bg-[#171131] text-white pl-9 pr-4 py-2 text-xs rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500"
            />
            {shelfSearch && (
              <button 
                onClick={() => setShelfSearch('')} 
                className="absolute right-3 top-2 text-xs text-purple-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter & Sort Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-[#160f33] p-1 rounded-xl border border-purple-800/40 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'all' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('reading')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'reading' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                Dibaca
              </button>
              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'unread' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                Belum
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'completed' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                Tamat
              </button>
            </div>

            {/* Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#160f33] text-purple-200 text-xs px-3 py-2 rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500"
            >
              <option value="latest">Terbaru Ditambahkan</option>
              <option value="title">Judul (A-Z)</option>
              <option value="author">Penulis (A-Z)</option>
              <option value="progress">Progres Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categoryList.map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-[#181136] text-purple-300/80 hover:text-white hover:bg-purple-900/40 border border-purple-800/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {sortedNovels.length === 0 && (
        <div className="text-center py-16 px-4 bg-[#120c26] rounded-3xl border border-purple-900/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-300">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Tidak ada novel yang cocok</h3>
          <p className="text-xs text-purple-300/70 max-w-md mx-auto">
            Coba ubah kata kunci pencarian, filter status, atau kategori genre di atas. Atau tambahkan novel baru ke rakmu.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            + Tambah Novel Baru
          </button>
        </div>
      )}

      {/* MODE 1: DIGITAL BOOKSHELF 3D */}
      {viewMode === 'shelf' && sortedNovels.length > 0 && (
        <div className="space-y-12 py-4">
          {shelves.map((shelfBooks, shelfIdx) => (
            <div key={shelfIdx} className="relative select-none">
              
              {/* Back Wall Glow & Shadow */}
              <div className="px-4 sm:px-8 flex items-end justify-start sm:justify-center gap-3 sm:gap-6 overflow-x-auto pb-0 min-h-[270px]">
                {shelfBooks.map(novel => (
                  <div
                    key={novel.id}
                    className="relative shrink-0 flex flex-col items-center group cursor-pointer"
                    onClick={() => onOpenDetail(novel)}
                  >
                    {/* Spine Card with Hover Tilt */}
                    <div className="book-spine-card relative">
                      <BookCover novel={novel} size="spine" />
                      
                      {/* Floating tooltip on hover */}
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#090614]/95 text-white text-[11px] px-3 py-1.5 rounded-lg border border-purple-500/40 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        <p className="font-bold">{novel.title}</p>
                        <p className="text-[10px] text-purple-300">{novel.author} • {novel.progress.percentage}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* The Physical Wooden Shelf Plank */}
              <div className="relative z-10 w-full">
                {/* Shelf Top Surface */}
                <div className="h-4 shelf-wood rounded-t-sm w-full border-t border-purple-500/30" />
                {/* Front Lip / Edge with Purple LED accent */}
                <div className="h-5 shelf-lip rounded-b-md w-full flex items-center justify-between px-6">
                  <span className="text-[9px] font-mono tracking-widest text-purple-200/50 uppercase">
                    NOVEL BOX • RAK {shelfIdx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                    <span className="text-[9px] font-mono text-purple-200/70">
                      {shelfBooks.length} BUKU
                    </span>
                  </div>
                </div>
                {/* Deep Drop Shadow under Shelf */}
                <div className="h-6 bg-gradient-to-b from-black/80 to-transparent w-full" />
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODE 2: GRID VIEW (KARTU SAMPUL) */}
      {viewMode === 'grid' && sortedNovels.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {sortedNovels.map(novel => (
            <div
              key={novel.id}
              className="bg-[#140e2c]/90 rounded-2xl p-3 border border-purple-900/40 hover:border-purple-600/70 transition-all group flex flex-col justify-between shadow-lg hover:shadow-purple-900/20"
            >
              <div>
                {/* Book Cover */}
                <div 
                  className="relative cursor-pointer mb-3 rounded-lg overflow-hidden transition-transform group-hover:scale-[1.02]"
                  onClick={() => onOpenDetail(novel)}
                >
                  <BookCover novel={novel} size="md" className="w-full aspect-[2/3] h-auto" />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => onToggleFavorite(novel.id, e)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-30 ${
                      novel.isFavorite 
                        ? 'bg-rose-600/90 text-white' 
                        : 'bg-black/60 text-white/70 hover:text-white'
                    }`}
                    title={novel.isFavorite ? 'Hapus dari favorit' : 'Tambah favorit'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${novel.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/30">
                        {novel.category}
                      </span>
                      {novel.isSample && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-semibold">
                          Contoh
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                      <Star className="w-3 h-3 fill-current" />
                      {novel.rating || '4.8'}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onOpenDetail(novel)}
                    className="font-bold text-sm text-white group-hover:text-purple-300 cursor-pointer line-clamp-1 transition-colors"
                  >
                    {novel.title}
                  </h3>
                  <p className="text-xs text-purple-300/70 truncate">
                    {novel.author}
                  </p>
                </div>
              </div>

              {/* Progress & Quick Read Button */}
              <div className="pt-3 mt-3 border-t border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-300/60 font-mono">
                    {novel.progress.completed ? 'Selesai' : `${novel.progress.percentage}% dibaca`}
                  </span>
                  <span className="text-[10px] text-purple-400">
                    {novel.pageCount} Hal
                  </span>
                </div>

                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                    style={{ width: `${novel.progress.percentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => onOpenReader(novel)}
                    className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Baca</span>
                  </button>
                  {onOpenEdit && (
                    <button
                      onClick={() => onOpenEdit(novel)}
                      className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit data novel"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => onDeleteNovel(novel.id, novel.title, e)}
                    className="p-1.5 rounded-lg text-purple-400/60 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Hapus novel dari rak"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE 3: LIST VIEW (TABEL DATABASE LENGKAP) */}
      {viewMode === 'list' && sortedNovels.length > 0 && (
        <div className="bg-[#130d29] rounded-2xl border border-purple-900/40 overflow-hidden shadow-2xl">
          <div className="p-3 bg-[#191037] border-b border-purple-900/40 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Database Tabel Koleksi</span>
              <span className="text-purple-400 font-mono">({sortedNovels.length} Data)</span>
            </span>
            <span className="text-[11px] text-purple-300/70">
              Sinkronisasi online realtime
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#160f33] border-b border-purple-900/40 text-[11px] font-semibold text-purple-300/80 uppercase tracking-wider">
                  <th className="py-3 px-3 text-center">ID</th>
                  <th className="py-3 px-4">Judul & Penulis</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">File / Ukuran</th>
                  <th className="py-3 px-3">Tanggal Ditambahkan</th>
                  <th className="py-3 px-4">Riwayat & Progres</th>
                  <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-xs">
                {sortedNovels.map((novel, idx) => (
                  <tr 
                    key={novel.id} 
                    className="hover:bg-purple-950/40 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-black/50 text-purple-300 border border-purple-800/40 font-bold">
                        #{idx + 1}
                      </span>
                    </td>

                    {/* Title & Author */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-13 shrink-0 rounded overflow-hidden cursor-pointer shadow-md"
                          onClick={() => onOpenDetail(novel)}
                        >
                          <BookCover novel={novel} size="xs" className="w-full h-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p 
                              className="font-bold text-white hover:text-purple-300 cursor-pointer transition-colors line-clamp-1"
                              onClick={() => onOpenDetail(novel)}
                            >
                              {novel.title}
                            </p>
                            {novel.isSample && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shrink-0">
                                Contoh
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-purple-300/70">{novel.author}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-200 border border-purple-700/40 text-[10px] font-medium whitespace-nowrap">
                        {novel.category}
                      </span>
                    </td>

                    {/* Format & File */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-purple-900/50 text-purple-200 border border-purple-500/30">
                          {novel.fileType}
                        </span>
                        <span className="text-[10px] text-purple-400 block font-mono">
                          {novel.fileSize}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-3 text-purple-300/80 text-[11px] whitespace-nowrap font-mono">
                      {new Date(novel.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] text-purple-300">
                          <span className="font-bold">{novel.progress.percentage}%</span>
                          {novel.progress.completed ? (
                            <span className="text-emerald-400 font-bold">Tamat</span>
                          ) : (
                            <span className="text-purple-400 text-[9px]">
                              {formatDateIndo(novel.progress.lastReadAt)}
                            </span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                            style={{ width: `${Math.max(5, novel.progress.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions (CRUD) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenReader(novel)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
                          title="Buka pembaca buku"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Baca</span>
                        </button>

                        {onOpenEdit && (
                          <button
                            onClick={() => onOpenEdit(novel)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-900/50 text-purple-300 hover:text-white transition-colors"
                            title="Edit data novel ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => onToggleFavorite(novel.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            novel.isFavorite ? 'text-rose-500 bg-rose-950/30' : 'text-purple-400 hover:text-white bg-white/5'
                          }`}
                          title={novel.isFavorite ? 'Hapus favorit' : 'Tambah favorit'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${novel.isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => onDeleteNovel(novel.id, novel.title, e)}
                          className="p-1.5 rounded-lg text-purple-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Hapus data novel ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
