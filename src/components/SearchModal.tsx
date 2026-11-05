import React, { useState, useEffect, useRef } from 'react';
import { Novel } from '../types';
import { BookCover } from './BookCover';
import { Search, X, BookOpen, Clock, Heart, Star, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  novels: Novel[];
  onOpenDetail: (novel: Novel) => void;
  onOpenReader: (novel: Novel) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  novels,
  onOpenDetail,
  onOpenReader
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = novels.filter(n => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.synopsis.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#110c26] border border-purple-800/60 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-purple-900/40 flex items-center gap-3 bg-[#171036]">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari novel berdasarkan judul, penulis, atau genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-hidden placeholder:text-purple-300/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-purple-400 hover:text-white px-2 py-1"
            >
              Hapus
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-purple-300/60 space-y-2">
              <p>Ketik kata kunci untuk mencari seluruh koleksi novel digitalmu.</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {['Fantasy', 'Romance', 'Mystery', 'Horror', 'Sci-Fi'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[11px] hover:text-white"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-purple-300/60">
              Tidak ada novel yang cocok dengan pencarian "{query}".
            </div>
          ) : (
            results.map((novel) => (
              <div
                key={novel.id}
                onClick={() => {
                  onOpenDetail(novel);
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-[#160f33]/70 hover:bg-[#201548] border border-purple-900/30 flex items-center justify-between gap-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-14 shrink-0 rounded overflow-hidden">
                    <BookCover novel={novel} size="xs" className="w-full h-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-300 transition-colors">
                      {novel.title}
                    </h4>
                    <p className="text-[11px] text-purple-300/70">{novel.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                        {novel.category}
                      </span>
                      <span className="text-[10px] text-purple-400">
                        {novel.progress.completed ? 'Tamat' : `${novel.progress.percentage}% dibaca`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReader(novel);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Baca</span>
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
