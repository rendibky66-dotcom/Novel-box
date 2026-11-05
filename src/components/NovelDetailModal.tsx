import React, { useState } from 'react';
import { Novel } from '../types';
import { BookCover } from './BookCover';
import { formatDateIndo, formatMinutesToHours } from '../utils/helpers';
import { 
  X, 
  BookOpen, 
  Heart, 
  Trash2, 
  Clock, 
  Star, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Share2,
  Bookmark,
  Edit3,
  Upload
} from 'lucide-react';

interface NovelDetailModalProps {
  novel: Novel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReader: (novel: Novel, chapterIndex?: number) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteNovel: (id: string, title: string, e: React.MouseEvent) => void;
  onUpdateProgress: (novel: Novel, newProgress: Partial<Novel['progress']>) => void;
  onOpenEdit?: (novel: Novel) => void;
  onUpdateNovel?: (updatedNovel: Novel) => void;
}

export const NovelDetailModal: React.FC<NovelDetailModalProps> = ({
  novel,
  isOpen,
  onClose,
  onOpenReader,
  onToggleFavorite,
  onDeleteNovel,
  onUpdateProgress,
  onOpenEdit,
  onUpdateNovel
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'chapters'>('info');

  if (!isOpen || !novel) return null;

  const currentChapter = novel.chapters && novel.chapters[novel.progress.currentChapterIndex];

  const handleToggleCompleted = () => {
    const isNowCompleted = !novel.progress.completed;
    onUpdateProgress(novel, {
      completed: isNowCompleted,
      percentage: isNowCompleted ? 100 : novel.progress.percentage,
      currentPage: isNowCompleted ? novel.pageCount : novel.progress.currentPage,
      lastReadAt: new Date().toISOString()
    });
  };

  const handleResetProgress = () => {
    onUpdateProgress(novel, {
      completed: false,
      percentage: 0,
      currentPage: 0,
      currentChapterIndex: 0,
      scrollPercent: 0,
      lastReadAt: undefined
    });
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !novel) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const updated: Novel = {
        ...novel,
        fileType: 'pdf',
        fileName: file.name,
        fileSize: sizeMb,
        fileData: base64Data
      };
      if (onUpdateNovel) {
        onUpdateNovel(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#110c26] border border-purple-800/50 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ambient Top Glow */}
        <div 
          className="absolute top-0 inset-x-0 h-40 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${novel.coverGradient.accent || '#a855f7'}, transparent 70%)`
          }}
        />

        {/* Header Close */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-purple-200 hover:text-white border border-purple-500/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Top Section: Cover & Metadata */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Book Cover */}
            <div className="shrink-0 group">
              <BookCover novel={novel} size="lg" className="shadow-2xl shadow-purple-950" />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/40 text-xs font-semibold">
                  {novel.category}
                </span>
                {novel.isSample && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Data Contoh</span>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-black/50 text-purple-300 font-mono text-[11px] border border-white/10 uppercase">
                  {novel.fileType} • {novel.fileSize}
                </span>
                <span className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{novel.rating || '4.9'}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {novel.title}
              </h2>
              <p className="text-sm text-purple-300">
                Penulis: <span className="text-purple-100 font-semibold">{novel.author}</span>
              </p>

              {/* Progress Summary Card */}
              <div className="bg-[#191138]/80 p-3.5 rounded-2xl border border-purple-800/40 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300/80 font-medium">Progres Membaca</span>
                  <span className="font-bold text-white font-mono">
                    {novel.progress.completed ? '100% (Selesai)' : `${novel.progress.percentage}%`}
                  </span>
                </div>

                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full transition-all"
                    style={{ width: `${Math.max(4, novel.progress.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-purple-300/70 pt-0.5">
                  <span>
                    {currentChapter ? currentChapter.title : `Halaman ${novel.progress.currentPage} dari ${novel.pageCount}`}
                  </span>
                  <span>{formatDateIndo(novel.progress.lastReadAt)}</span>
                </div>
              </div>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                <button
                  onClick={() => onOpenReader(novel)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {novel.progress.percentage > 0 && !novel.progress.completed 
                      ? 'Lanjut Baca (Bab ' + (novel.progress.currentChapterIndex + 1) + ')' 
                      : 'Mulai Membaca'}
                  </span>
                </button>

                <button
                  onClick={(e) => onToggleFavorite(novel.id, e)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    novel.isFavorite
                      ? 'bg-rose-950/60 border-rose-600 text-rose-400'
                      : 'bg-white/5 border-purple-800/40 text-purple-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={novel.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                >
                  <Heart className={`w-4 h-4 ${novel.isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleToggleCompleted}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    novel.progress.completed
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                      : 'bg-white/5 border-purple-800/40 text-purple-300 hover:text-white'
                  }`}
                  title="Tandai buku selesai dibaca"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{novel.progress.completed ? 'Telah Selesai' : 'Tandai Selesai'}</span>
                </button>

                {novel.progress.percentage > 0 && (
                  <button
                    onClick={handleResetProgress}
                    className="p-2.5 rounded-xl bg-white/5 border border-purple-800/40 text-purple-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Ulangi dari awal (Reset Progres)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {novel.fileType !== 'pdf' ? (
                  <label 
                    className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Upload file PDF novel yang sebenarnya"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload PDF</span>
                    <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                  </label>
                ) : (
                  <label 
                    className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 hover:text-white transition-colors cursor-pointer"
                    title="Ganti file PDF novel ini"
                  >
                    <Upload className="w-4 h-4 text-purple-400" />
                    <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                  </label>
                )}

                {onOpenEdit && (
                  <button
                    onClick={() => {
                      onOpenEdit(novel);
                    }}
                    className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 hover:text-white transition-colors"
                    title="Edit data novel (judul, penulis, kategori, sampul)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    onDeleteNovel(novel.id, novel.title, e);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/40 text-rose-400 hover:text-rose-300 transition-colors"
                  title="Hapus novel dari koleksi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Sinopsis vs Daftar Bab) */}
          <div className="border-b border-purple-900/40 flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2.5 transition-all cursor-pointer border-b-2 ${
                activeTab === 'info'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              Sinopsis & Info
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-2.5 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === 'chapters'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-purple-300/70 hover:text-white'
              }`}
            >
              <span>Daftar Bab</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-300 text-[10px]">
                {novel.chapters?.length || 0}
              </span>
            </button>
          </div>

          {/* Tab 1: Sinopsis & Informasi */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-[#140e2d]/60 p-4 sm:p-5 rounded-2xl border border-purple-900/30">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                  Ringkasan Cerita
                </h4>
                <p className="text-sm text-purple-100/90 leading-relaxed font-reader-serif">
                  {novel.synopsis}
                </p>
              </div>

              {/* Extra Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#140e2d]/40 p-3 rounded-xl border border-purple-900/30">
                  <span className="text-purple-400/80 text-[10px] block">Jumlah Halaman</span>
                  <span className="text-white font-bold">{novel.pageCount} Halaman</span>
                </div>
                <div className="bg-[#140e2d]/40 p-3 rounded-xl border border-purple-900/30">
                  <span className="text-purple-400/80 text-[10px] block">Estimasi Baca</span>
                  <span className="text-white font-bold">{formatMinutesToHours(novel.estimatedMinutes)}</span>
                </div>
                <div className="bg-[#140e2d]/40 p-3 rounded-xl border border-purple-900/30">
                  <span className="text-purple-400/80 text-[10px] block">Nama File</span>
                  <span className="text-white font-bold truncate block">{novel.fileName}</span>
                </div>
                <div className="bg-[#140e2d]/40 p-3 rounded-xl border border-purple-900/30">
                  <span className="text-purple-400/80 text-[10px] block">Ditambahkan Pada</span>
                  <span className="text-white font-bold">{formatDateIndo(novel.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Daftar Bab */}
          {activeTab === 'chapters' && (
            <div className="space-y-2">
              {(!novel.chapters || novel.chapters.length === 0) ? (
                <p className="text-xs text-purple-300/70 text-center py-6">
                  Novel ini belum memiliki daftar bab terpisah. Kamu bisa membacanya secara langsung!
                </p>
              ) : (
                novel.chapters.map((ch, idx) => {
                  const isCurrent = idx === novel.progress.currentChapterIndex;
                  return (
                    <div
                      key={ch.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-purple-950/60 border-purple-500/70 text-white'
                          : 'bg-[#140e2d]/40 border-purple-900/30 text-purple-200 hover:bg-[#1a123a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-purple-400 w-6">
                          {idx + 1}.
                        </span>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-white">
                            {ch.title}
                          </p>
                          <p className="text-[10px] text-purple-400/70">
                            ~{Math.max(500, ch.content.length)} kata
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenReader(novel, idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white/5 hover:bg-purple-600 text-purple-200 hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'Sedang Dibaca' : 'Baca Bab Ini'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
