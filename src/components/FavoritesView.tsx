import React from 'react';
import { Novel } from '../types';
import { BookCover } from './BookCover';
import { Heart, BookOpen, Clock, ArrowRight } from 'lucide-react';

interface FavoritesViewProps {
  novels: Novel[];
  onOpenReader: (novel: Novel) => void;
  onOpenDetail: (novel: Novel) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onGoToShelf: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  novels,
  onOpenReader,
  onOpenDetail,
  onToggleFavorite,
  onGoToShelf
}) => {
  const favorites = novels.filter(n => n.isFavorite);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-[#140e2b]/80 p-5 rounded-2xl border border-purple-900/40 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-current" />
            <span>Koleksi Favorit</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
              {favorites.length} Novel
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Daftar novel yang kamu sukai dan tandai dengan bintang hati.
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 px-4 bg-[#120c26] rounded-3xl border border-purple-900/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-950/40 border border-rose-700/40 flex items-center justify-center text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Belum ada novel favorit</h3>
          <p className="text-xs text-purple-300/70 max-w-md mx-auto">
            Klik ikon hati pada novel mana pun di rak buku untuk menyimpannya di daftar favorit ini.
          </p>
          <button
            onClick={onGoToShelf}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Buka Rak Koleksi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {favorites.map(novel => (
            <div
              key={novel.id}
              className="bg-[#140e2c]/90 rounded-2xl p-3 border border-purple-900/40 hover:border-rose-500/50 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div 
                  className="relative cursor-pointer mb-3 rounded-lg overflow-hidden transition-transform group-hover:scale-[1.02]"
                  onClick={() => onOpenDetail(novel)}
                >
                  <BookCover novel={novel} size="md" className="w-full aspect-[2/3] h-auto" />
                  
                  <button
                    onClick={(e) => onToggleFavorite(novel.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-lg z-30"
                    title="Hapus dari favorit"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/30">
                    {novel.category}
                  </span>
                  <h3 
                    onClick={() => onOpenDetail(novel)}
                    className="font-bold text-sm text-white group-hover:text-purple-300 cursor-pointer line-clamp-1 transition-colors pt-1"
                  >
                    {novel.title}
                  </h3>
                  <p className="text-xs text-purple-300/70 truncate">
                    {novel.author}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-purple-900/30">
                <button
                  onClick={() => onOpenReader(novel)}
                  className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lanjut Baca</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
