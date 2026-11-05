import React, { useState } from 'react';
import { Novel, CategoryType, Chapter } from '../types';
import { COVER_GRADIENTS } from '../utils/helpers';
import { 
  X, 
  Upload, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Plus, 
  Check, 
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface AddNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNovel: (novel: Novel) => void;
}

export const AddNovelModal: React.FC<AddNovelModalProps> = ({
  isOpen,
  onClose,
  onAddNovel
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<CategoryType>('Fantasy');
  const [customCategory, setCustomCategory] = useState('');
  const [synopsis, setSynopsis] = useState('');
  
  // Cover options: 'gradient' or 'upload'
  const [coverType, setCoverType] = useState<'gradient' | 'upload'>('gradient');
  const [selectedGradient, setSelectedGradient] = useState(COVER_GRADIENTS[0]);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  
  // File options
  const [fileType, setFileType] = useState<'text' | 'pdf' | 'epub'>('text');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  
  // Chapters or manual text
  const [manualChapterTitle, setManualChapterTitle] = useState('Bab 1: Awal Petualangan');
  const [manualChapterContent, setManualChapterContent] = useState('');
  const [pageCount, setPageCount] = useState<number>(150);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(180);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Cover Image Upload
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

  // Handle Novel File Upload (PDF, EPUB, TXT)
  const handleNovelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    setFileName(file.name);
    setFileSize(sizeMb);

    // Auto calculate pages roughly
    const approxPages = Math.max(50, Math.round(file.size / 3000));
    setPageCount(approxPages);
    setEstimatedMinutes(Math.round(approxPages * 0.9));

    if (ext === 'pdf') {
      setFileType('pdf');
      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (ext === 'txt') {
      setFileType('text');
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setManualChapterContent(text.slice(0, 100000)); // load text
        setFileData(text);
      };
      reader.readAsText(file);
    } else {
      // epub or other
      setFileType('epub');
      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Judul novel wajib diisi.');
      return;
    }
    if (!author.trim()) {
      setErrorMsg('Nama penulis wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    const finalCategory = category === 'Kustom' ? (customCategory.trim() || 'Lainnya') : category;
    
    // Prepare Chapters
    const chapters: Chapter[] = [];
    if (manualChapterContent.trim()) {
      chapters.push({
        id: 'c-' + Date.now(),
        title: manualChapterTitle.trim() || 'Bab 1',
        content: manualChapterContent.trim()
      });
    } else {
      // Fallback default sample content so novel is instantly readable!
      chapters.push({
        id: 'c-' + Date.now(),
        title: 'Bab 1: Pembuka Cerita',
        content: `Matahari mulai condong ke barat saat angin berhembus sejuk membawa aroma dedaunan basah. ${title} bermula di sebuah kota tua yang dikelilingi perbukitan pinus yang tenang.\n\nSetiap langkah kaki terasa bergema di gang-gang berbatu. Tokoh utama kita tahu bahwa hari ini akan mengubah segalanya, sebuah takdir baru telah menanti di balik pintu berukir kayu mahoni kuno itu...`
      });
      chapters.push({
        id: 'c-' + (Date.now() + 1),
        title: 'Bab 2: Jejak yang Tersembunyi',
        content: `Di dalam ruangan yang remang oleh cahaya lentera tembaga, gulungan perkamen tua terbentang di atas meja. Tinta hitamnya mulai memudar, namun maknanya masih begitu tajam menusuk kesadaran.\n\n"Tidak ada yang bisa kembali setelah melintasi perbatasan ini," ucap sebuah suara berbisik pelan dari balik bayang-bayang rak buku.`
      });
    }

    const newNovel: Novel = {
      id: 'novel-' + Date.now(),
      title: title.trim(),
      author: author.trim(),
      category: finalCategory,
      synopsis: synopsis.trim() || `Sebuah karya memukau dari ${author.trim()} yang memikat para pembaca ke dalam dunia ${finalCategory} penuh misteri dan petualangan tak terduga.`,
      coverUrl: coverType === 'upload' ? coverUrl : undefined,
      coverGradient: {
        from: selectedGradient.from,
        to: selectedGradient.to,
        accent: selectedGradient.accent,
        icon: selectedGradient.icon
      },
      fileType,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.${fileType === 'pdf' ? 'pdf' : fileType === 'epub' ? 'epub' : 'txt'}`,
      fileSize,
      fileData,
      chapters,
      pageCount: pageCount || 150,
      estimatedMinutes: estimatedMinutes || 180,
      rating: 5.0,
      isFavorite: false,
      progress: {
        currentPage: 0,
        totalPages: pageCount || 150,
        currentChapterIndex: 0,
        scrollPercent: 0,
        percentage: 0,
        completed: false,
        totalReadingTimeMinutes: 0
      },
      bookmarks: [],
      notes: [],
      createdAt: new Date().toISOString()
    };

    onAddNovel(newNovel);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#110c26] border border-purple-800/50 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#201540] to-[#140e2b] border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Tambah Novel ke Koleksi
              </h2>
              <p className="text-xs text-purple-300/70">
                Lengkapi informasi novel, sampul, dan file bacaanmu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Judul & Penulis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-200">
                Judul Novel <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sang Pangeran Mahkota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#181136] text-white px-3.5 py-2.5 rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-200">
                Nama Penulis <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#181136] text-white px-3.5 py-2.5 rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500 text-xs"
              />
            </div>
          </div>

          {/* Row 2: Kategori / Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-200">
              Kategori / Genre
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['Fantasy', 'Romance', 'Mystery', 'Horror', 'Sci-Fi', 'Petualangan', 'Kustom'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                      : 'bg-[#181136] text-purple-300/80 hover:text-white border border-purple-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {category === 'Kustom' && (
              <input
                type="text"
                placeholder="Tulis nama genre kustom..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-2 bg-[#181136] text-white px-3.5 py-2 rounded-xl border border-purple-800/40 text-xs"
              />
            )}
          </div>

          {/* Row 3: Sinopsis */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-200">
              Sinopsis / Ringkasan Cerita
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan sedikit tentang jalan cerita novel ini..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-[#181136] text-white px-3.5 py-2.5 rounded-xl border border-purple-800/40 focus:outline-hidden focus:border-purple-500 text-xs leading-relaxed"
            />
          </div>

          {/* Row 4: Desain Sampul (Pilih Gradien atau Upload Gambar) */}
          <div className="space-y-2.5 bg-[#160f33] p-4 rounded-2xl border border-purple-800/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Desain Sampul Novel</span>
              </label>
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setCoverType('gradient')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    coverType === 'gradient' ? 'bg-purple-600 text-white' : 'text-purple-300'
                  }`}
                >
                  Gradien Estetik
                </button>
                <button
                  type="button"
                  onClick={() => setCoverType('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    coverType === 'upload' ? 'bg-purple-600 text-white' : 'text-purple-300'
                  }`}
                >
                  Upload Gambar
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
                    className={`h-16 rounded-xl relative p-1.5 flex flex-col justify-end text-left transition-all cursor-pointer border ${
                      selectedGradient.name === g.name
                        ? 'ring-2 ring-purple-400 scale-105 border-white'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  >
                    {selectedGradient.name === g.name && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-purple-900 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-white drop-shadow truncate">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4 pt-1">
                {coverUrl ? (
                  <div className="w-16 h-24 rounded-lg overflow-hidden border border-purple-500 shrink-0 relative group">
                    <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverUrl(undefined)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded p-1 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : null}
                <label className="flex-1 border-2 border-dashed border-purple-700/60 hover:border-purple-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-purple-950/20">
                  <ImageIcon className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <span className="text-xs text-purple-200 font-medium block">
                    Pilih File Gambar Sampul (JPG, PNG, WebP)
                  </span>
                  <span className="text-[10px] text-purple-400/70">Maksimal 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Row 5: Upload File Novel (PDF, EPUB, TXT) */}
          <div className="space-y-2.5 bg-[#160f33] p-4 rounded-2xl border border-purple-800/40">
            <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>File Dokumen Novel (PDF / EPUB / TXT)</span>
            </label>

            <label className="border-2 border-dashed border-purple-700/60 hover:border-purple-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-purple-950/20 block">
              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <FileCheck className="w-5 h-5" />
                  <span className="text-xs font-bold text-white">{fileName}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">
                    {fileSize} • {fileType.toUpperCase()}
                  </span>
                </div>
              ) : (
                <>
                  <FileText className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <span className="text-xs text-purple-200 font-medium block">
                    Klik untuk memilih file novel (.pdf, .epub, .txt)
                  </span>
                  <span className="text-[10px] text-purple-400/70">
                    File dapat langsung dibaca di dalam aplikasi NOVEL BOX
                  </span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.epub,.txt"
                onChange={handleNovelFileUpload}
                className="hidden"
              />
            </label>

            {/* Manual Chapter Preview/Editor */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-purple-300">
                  Teks Bab Novel (Opsional / Otomatis Dari File)
                </span>
                <span className="text-[10px] text-purple-400">
                  {manualChapterContent.length} karakter
                </span>
              </div>
              <input
                type="text"
                placeholder="Judul Bab (misal: Bab 1: Pertemuan Awal)"
                value={manualChapterTitle}
                onChange={(e) => setManualChapterTitle(e.target.value)}
                className="w-full bg-[#181136] text-white px-3 py-1.5 rounded-lg border border-purple-800/40 text-xs mb-1.5"
              />
              <textarea
                rows={3}
                placeholder="Jika tidak mengupload file, kamu bisa mengetikkan naskah atau potongan cerita di sini..."
                value={manualChapterContent}
                onChange={(e) => setManualChapterContent(e.target.value)}
                className="w-full bg-[#181136] text-white px-3 py-2 rounded-xl border border-purple-800/40 text-xs font-reader-serif leading-relaxed"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan ke Rak Digital</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
