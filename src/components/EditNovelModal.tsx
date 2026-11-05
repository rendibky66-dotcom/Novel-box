import React, { useState, useEffect } from 'react';
import { Novel, CategoryType } from '../types';
import { COVER_GRADIENTS } from '../utils/helpers';
import { 
  X, 
  Save, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface EditNovelModalProps {
  novel: Novel | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNovel: (updatedNovel: Novel) => void;
}

export const EditNovelModal: React.FC<EditNovelModalProps> = ({
  novel,
  isOpen,
  onClose,
  onUpdateNovel
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<CategoryType>('Fantasy');
  const [synopsis, setSynopsis] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [coverType, setCoverType] = useState<'gradient' | 'upload'>('gradient');
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [selectedGradient, setSelectedGradient] = useState(COVER_GRADIENTS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (novel) {
      setTitle(novel.title);
      setAuthor(novel.author);
      setCategory(novel.category);
      setSynopsis(novel.synopsis);
      setIsFavorite(novel.isFavorite);
      if (novel.coverUrl) {
        setCoverType('upload');
        setCoverUrl(novel.coverUrl);
      } else {
        setCoverType('gradient');
        const found = COVER_GRADIENTS.find(g => g.from === novel.coverGradient?.from);
        if (found) setSelectedGradient(found);
      }
    }
  }, [novel]);

  if (!isOpen || !novel) return null;

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file gambar maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCoverUrl(reader.result as string);
        setCoverType('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setErrorMsg('Judul dan nama penulis wajib diisi.');
      return;
    }

    const updated: Novel = {
      ...novel,
      title: title.trim(),
      author: author.trim(),
      category,
      synopsis: synopsis.trim(),
      isFavorite,
      coverUrl: coverType === 'upload' ? coverUrl : undefined,
      coverGradient: {
        from: selectedGradient.from,
        to: selectedGradient.to,
        accent: selectedGradient.accent,
        icon: selectedGradient.icon
      }
    };

    onUpdateNovel(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#110c26] border border-purple-800/50 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#201540] to-[#140e2b] border-b border-purple-900/40 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Edit Data Novel
            </h2>
            <p className="text-xs text-purple-300/70">
              Perbarui informasi, kategori, sinopsis, atau sampul novel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-200">Judul Novel</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181136] text-white px-3.5 py-2.5 rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-200">Nama Penulis</label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-[#181136] text-white px-3.5 py-2.5 rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-200">Kategori</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['Fantasy', 'Romance', 'Mystery', 'Horror', 'Sci-Fi', 'Petualangan'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium text-center transition-all ${
                    category === cat
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'bg-[#181136] text-purple-300/80 hover:text-white border border-purple-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-200">Deskripsi / Sinopsis</label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-[#181136] text-white px-3.5 py-2.5 rounded-xl border border-purple-800/40 text-xs leading-relaxed"
            />
          </div>

          {/* Sampul Selection */}
          <div className="space-y-2 bg-[#160f33] p-3.5 rounded-2xl border border-purple-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-200">Sampul Novel</span>
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setCoverType('gradient')}
                  className={`px-2 py-0.5 rounded ${coverType === 'gradient' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}
                >
                  Gradien
                </button>
                <button
                  type="button"
                  onClick={() => setCoverType('upload')}
                  className={`px-2 py-0.5 rounded ${coverType === 'upload' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}
                >
                  Gambar
                </button>
              </div>
            </div>

            {coverType === 'gradient' ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {COVER_GRADIENTS.map((g, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedGradient(g)}
                    className={`h-12 rounded-xl relative p-1 flex items-end border ${
                      selectedGradient.name === g.name ? 'ring-2 ring-purple-400 border-white' : 'border-white/10 opacity-70'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  >
                    <span className="text-[8px] font-bold text-white drop-shadow truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                {coverUrl && (
                  <img src={coverUrl} alt="Cover preview" className="w-12 h-16 rounded object-cover border border-purple-500" />
                )}
                <label className="flex-1 border border-dashed border-purple-700/60 hover:border-purple-400 rounded-xl p-3 text-center cursor-pointer text-xs text-purple-200">
                  <span>Pilih file gambar baru</span>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Status Favorit */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editFav"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 accent-purple-600"
            />
            <label htmlFor="editFav" className="text-xs text-purple-200 font-medium cursor-pointer">
              Tandai sebagai novel favorit
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-purple-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 text-purple-300 text-xs font-semibold hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
