import React from 'react';
import { Novel } from '../types';
import { BookCover } from './BookCover';
import { formatDateIndo, formatMinutesToHours } from '../utils/helpers';
import { History, BookOpen, Clock, ArrowRight, CheckCircle2, Bookmark } from 'lucide-react';

interface HistoryViewProps {
  novels: Novel[];
  onOpenReader: (novel: Novel) => void;
  onOpenDetail: (novel: Novel) => void;
  onGoToShelf: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  novels,
  onOpenReader,
  onOpenDetail,
  onGoToShelf
}) => {
  // Filter novels that have been read at least once
  const historyNovels = novels
    .filter(n => n.progress.lastReadAt || n.progress.percentage > 0)
    .sort((a, b) => {
      const timeA = new Date(a.progress.lastReadAt || 0).getTime();
      const timeB = new Date(b.progress.lastReadAt || 0).getTime();
      return timeB - timeA;
    });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-[#140e2b]/80 p-5 rounded-2xl border border-purple-900/40 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            <span>Riwayat Bacaan</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 font-medium">
              {historyNovels.length} Novel
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Lacak buku yang terakhir kamu baca dan lanjutkan membaca tepat di titik terakhirmu.
          </p>
        </div>
      </div>

      {historyNovels.length === 0 ? (
        <div className="text-center py-20 px-4 bg-[#120c26] rounded-3xl border border-purple-900/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-300">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Belum ada riwayat baca</h3>
          <p className="text-xs text-purple-300/70 max-w-md mx-auto">
            Mulai membaca novel dari rak buku dan posisimu akan otomatis tercatat di sini.
          </p>
          <button
            onClick={onGoToShelf}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Buka Rak Novel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {historyNovels.map((novel, idx) => {
            const currentChapter = novel.chapters && novel.chapters[novel.progress.currentChapterIndex];
            return (
              <div
                key={novel.id}
                className="bg-[#130d2a]/90 rounded-2xl p-4 sm:p-5 border border-purple-900/40 hover:border-purple-600/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Timeline Index */}
                  <span className="text-xs font-mono font-bold text-purple-400/60 w-5 hidden md:block">
                    #{idx + 1}
                  </span>

                  {/* Cover */}
                  <div 
                    className="w-14 h-20 shrink-0 rounded-lg overflow-hidden cursor-pointer shadow-md group-hover:scale-105 transition-transform"
                    onClick={() => onOpenDetail(novel)}
                  >
                    <BookCover novel={novel} size="xs" className="w-full h-full" />
                  </div>

                  {/* Info */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40 font-medium">
                        {novel.category}
                      </span>
                      {novel.progress.completed ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tamat</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Progres: {novel.progress.percentage}%
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => onOpenDetail(novel)}
                      className="font-bold text-base text-white group-hover:text-purple-300 cursor-pointer transition-colors"
                    >
                      {novel.title}
                    </h3>

                    <p className="text-xs text-purple-300/80">
                      Terakhir baca:{' '}
                      <span className="text-purple-200 font-medium">
                        {currentChapter ? currentChapter.title : `Halaman ${novel.progress.currentPage}`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Progress bar & Time info */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-900/30">
                  <div className="text-left sm:text-right space-y-1">
                    <div className="text-[11px] text-purple-300/70 flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateIndo(novel.progress.lastReadAt)}</span>
                    </div>
                    <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-purple-900/40">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                        style={{ width: `${Math.max(5, novel.progress.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReader(novel)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lanjutkan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
