import React from 'react';
import { Novel } from '../types';
import { Book, Sparkles, Heart, Search, Skull, Compass, Cpu, Bookmark } from 'lucide-react';

interface BookCoverProps {
  novel: Novel;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'spine';
  className?: string;
  showProgress?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="w-5 h-5 text-amber-300" />,
  heart: <Heart className="w-5 h-5 text-rose-400" />,
  search: <Search className="w-5 h-5 text-purple-300" />,
  skull: <Skull className="w-5 h-5 text-purple-400" />,
  compass: <Compass className="w-5 h-5 text-emerald-400" />,
  cpu: <Cpu className="w-5 h-5 text-cyan-400" />,
  book: <Book className="w-5 h-5 text-purple-300" />
};

export const BookCover: React.FC<BookCoverProps> = ({
  novel,
  size = 'md',
  className = '',
  showProgress = false
}) => {
  const gradient = novel.coverGradient || {
    from: '#4c1d95',
    to: '#1e1b4b',
    accent: '#c084fc',
    icon: 'book'
  };

  // Spine view for digital bookshelf
  if (size === 'spine') {
    return (
      <div
        className={`relative h-64 w-12 sm:w-14 rounded-r-sm cursor-pointer select-none transition-all duration-300 flex flex-col justify-between p-2 shadow-2xl overflow-hidden group ${className}`}
        style={{
          background: `linear-gradient(90deg, #110e24 0%, ${gradient.from} 35%, ${gradient.to} 100%)`,
          boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.7), 4px 0 10px rgba(0,0,0,0.5)'
        }}
        title={`${novel.title} - ${novel.author}`}
      >
        {/* Book spine ribs / emboss */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-black/40 border-b border-white/10" />
        <div className="absolute top-6 left-0 right-0 h-1 bg-black/40 border-b border-white/10" />
        
        {/* Top spine category badge */}
        <div className="pt-8 flex flex-col items-center gap-1">
          {novel.isSample && (
            <span className="text-[7px] bg-amber-400 text-amber-950 font-bold px-1 rounded uppercase tracking-wider">
              Contoh
            </span>
          )}
          <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[10px] text-purple-200 border border-purple-400/20">
            {novel.category.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Vertical Title */}
        <div className="flex-1 flex items-center justify-center my-3 overflow-hidden">
          <span 
            className="text-xs font-semibold tracking-wider text-purple-100 whitespace-nowrap transform -rotate-90 origin-center truncate max-w-[170px]"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
          >
            {novel.title}
          </span>
        </div>

        {/* Bottom spine author & bookmark */}
        <div className="pb-4 flex flex-col items-center gap-1">
          {novel.progress.completed ? (
            <span className="text-[9px] bg-emerald-500/80 text-white px-1 py-0.5 rounded font-mono font-bold">TAMAT</span>
          ) : novel.progress.percentage > 0 ? (
            <span className="text-[9px] bg-purple-600/90 text-purple-100 px-1 py-0.5 rounded font-mono font-bold">
              {novel.progress.percentage}%
            </span>
          ) : null}
          <div className="w-full h-1 bg-black/40 border-t border-white/10 mt-1" />
        </div>

        {/* Subtle bookmark ribbon hanging out */}
        {novel.isFavorite && (
          <div className="absolute -top-1 right-2 w-3 h-5 bg-rose-500 rounded-b shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  const sizeClasses = {
    xs: 'w-16 h-24 text-[9px]',
    sm: 'w-24 h-36 text-xs',
    md: 'w-40 h-60 text-sm',
    lg: 'w-52 h-76 text-base'
  }[size];

  return (
    <div
      className={`relative rounded-md overflow-hidden shadow-xl border border-purple-900/40 select-none flex flex-col justify-between transition-all duration-300 ${sizeClasses} ${className}`}
      style={{
        background: novel.coverUrl
          ? 'transparent'
          : `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
      }}
    >
      {/* If custom cover image is uploaded */}
      {novel.coverUrl ? (
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        /* Generated Typography Cover */
        <div className="relative z-10 p-3 h-full flex flex-col justify-between">
          {/* Subtle pattern & inner border */}
          <div className="absolute inset-2 border border-white/15 rounded-sm pointer-events-none" />
          
          {/* Header on Cover */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-purple-200/80 font-mono">
              NOVEL BOX
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-purple-200 border border-purple-400/20">
              {novel.category}
            </span>
          </div>

          {/* Center Emblem & Title */}
          <div className="relative z-10 my-auto text-center px-1">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
              {ICON_MAP[gradient.icon || 'book'] || <Book className="w-5 h-5 text-purple-200" />}
            </div>
            <h3
              className="font-bold text-white leading-tight line-clamp-3 font-reader-serif drop-shadow-md"
              style={{ fontSize: size === 'lg' ? '1.25rem' : size === 'md' ? '0.95rem' : '0.75rem' }}
            >
              {novel.title}
            </h3>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto my-1.5" />
          </div>

          {/* Footer on Cover (Author) */}
          <div className="relative z-10 text-center">
            <p className="text-[11px] font-medium text-purple-200/90 truncate tracking-wide">
              {novel.author}
            </p>
          </div>
        </div>
      )}

      {/* Book spine shadow effect (left edge 3D book feel) */}
      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10 pointer-events-none z-20" />

      {/* Favorite badge ribbon */}
      {novel.isFavorite && (
        <div className="absolute top-0 right-2 z-30">
          <div className="bg-rose-500 text-white p-1 rounded-b-md shadow-lg flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      )}

      {/* Sample Badge */}
      {novel.isSample && (
        <div className="absolute top-1.5 left-1.5 z-30">
          <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded bg-amber-400/90 text-amber-950 shadow-md">
            Contoh
          </span>
        </div>
      )}

      {/* Format badge (PDF / EPUB / TXT) */}
      <div className="absolute bottom-2 left-2 z-30">
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-black/70 text-purple-200 backdrop-blur-xs border border-purple-500/30">
          {novel.fileType}
        </span>
      </div>

      {/* Progress pill if requested */}
      {showProgress && novel.progress && (
        <div className="absolute bottom-2 right-2 z-30">
          {novel.progress.completed ? (
            <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-emerald-500/90 text-white shadow">
              Tamat
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-purple-600/90 text-white shadow">
              {novel.progress.percentage}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
