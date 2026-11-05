import React, { useState, useEffect, useRef } from 'react';
import { Novel, ReadingSettings, Chapter } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  Sun, 
  Moon, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  List, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  FileText,
  RotateCcw
} from 'lucide-react';

interface ReaderModalProps {
  novel: Novel | null;
  initialChapterIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveProgress: (novelId: string, progress: Partial<Novel['progress']>) => void;
  settings: ReadingSettings;
  onUpdateSettings: (settings: ReadingSettings) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  novel,
  initialChapterIndex = 0,
  isOpen,
  onClose,
  onSaveProgress,
  settings,
  onUpdateSettings
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync initial chapter
  useEffect(() => {
    if (novel) {
      const idx = initialChapterIndex !== undefined 
        ? initialChapterIndex 
        : novel.progress.currentChapterIndex || 0;
      setCurrentChapterIndex(idx);
    }
  }, [novel, initialChapterIndex]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Track scroll position to update reading progress automatically
  const handleScroll = () => {
    if (!contentRef.current || !novel) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const maxScroll = scrollHeight - clientHeight;
    const percentScrolled = maxScroll > 0 ? Math.min(100, Math.round((scrollTop / maxScroll) * 100)) : 100;
    
    // Overall novel progress calculation
    const totalChapters = novel.chapters?.length || 1;
    const chapterWeight = 100 / totalChapters;
    const overallPercent = Math.min(
      100,
      Math.round((currentChapterIndex * chapterWeight) + (percentScrolled * (chapterWeight / 100)))
    );

    const isFinished = currentChapterIndex === totalChapters - 1 && percentScrolled >= 95;

    onSaveProgress(novel.id, {
      currentChapterIndex,
      scrollPercent: percentScrolled,
      percentage: overallPercent,
      completed: isFinished,
      lastReadAt: new Date().toISOString()
    });

    if (isFinished && !novel.progress.completed) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // Next / Prev Chapter
  const goToNextChapter = () => {
    if (!novel || !novel.chapters) return;
    if (currentChapterIndex < novel.chapters.length - 1) {
      stopAudio();
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      if (contentRef.current) contentRef.current.scrollTop = 0;
      
      const overallPercent = Math.round((nextIdx / novel.chapters.length) * 100);
      onSaveProgress(novel.id, {
        currentChapterIndex: nextIdx,
        percentage: overallPercent,
        lastReadAt: new Date().toISOString()
      });
    } else {
      // Completed!
      onSaveProgress(novel.id, {
        percentage: 100,
        completed: true,
        lastReadAt: new Date().toISOString()
      });
      triggerConfetti();
    }
  };

  const goToPrevChapter = () => {
    if (!novel || !novel.chapters) return;
    if (currentChapterIndex > 0) {
      stopAudio();
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      if (contentRef.current) contentRef.current.scrollTop = 0;
      
      const overallPercent = Math.round((prevIdx / novel.chapters.length) * 100);
      onSaveProgress(novel.id, {
        currentChapterIndex: prevIdx,
        percentage: overallPercent,
        lastReadAt: new Date().toISOString()
      });
    }
  };

  // Text-To-Speech (Web Speech API with Indonesian voice)
  const toggleSpeechAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      if (!novel || !novel.chapters || !novel.chapters[currentChapterIndex]) return;
      const textToRead = `${novel.chapters[currentChapterIndex].title}. ${novel.chapters[currentChapterIndex].content}`;
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'id-ID'; // Bahasa Indonesia
        utterance.rate = 0.95;
        
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Add bookmark
  const handleAddBookmark = () => {
    if (!novel) return;
    setBookmarkToast(true);
    setTimeout(() => setBookmarkToast(false), 2500);
  };

  // Theme styles for Reader
  const THEME_STYLES: Record<string, { bg: string; text: string; header: string; border: string }> = {
    midnight: {
      bg: 'bg-[#090714]',
      text: 'text-[#e2e1ec]',
      header: 'bg-[#0f0c22]/90',
      border: 'border-purple-900/40'
    },
    dark: {
      bg: 'bg-[#121212]',
      text: 'text-[#d6d6d6]',
      header: 'bg-[#1a1a1a]/90',
      border: 'border-neutral-800'
    },
    sepia: {
      bg: 'bg-[#f8f1e3]',
      text: 'text-[#433422]',
      header: 'bg-[#efe5d2]/90',
      border: 'border-[#dfd3bc]'
    },
    light: {
      bg: 'bg-[#ffffff]',
      text: 'text-[#1e1e1e]',
      header: 'bg-[#f4f4f5]/90',
      border: 'border-neutral-200'
    },
    purple: {
      bg: 'bg-[#1e1338]',
      text: 'text-[#f3e8ff]',
      header: 'bg-[#291a4c]/90',
      border: 'border-purple-800/40'
    }
  };

  const currentTheme = THEME_STYLES[settings.theme] || THEME_STYLES.midnight;

  if (!isOpen || !novel) return null;

  const currentChapter: Chapter | undefined = novel.chapters?.[currentChapterIndex];
  const isPdf = novel.fileType === 'pdf' && novel.fileData?.startsWith('data:application/pdf');

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${currentTheme.bg} transition-colors duration-200`}>
      
      {/* Toast Notification */}
      {bookmarkToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Bookmark className="w-4 h-4 fill-current" />
          <span>Halaman dan bab berhasil ditandai!</span>
        </div>
      )}

      {/* Reader Top Navbar */}
      <header className={`h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b ${currentTheme.border} ${currentTheme.header} backdrop-blur-md select-none shrink-0 z-30`}>
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className={`p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 ${currentTheme.text} transition-colors cursor-pointer flex items-center gap-1.5`}
            title="Kembali ke Rak"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold hidden sm:inline">Kembali</span>
          </button>

          <div className="border-l border-white/10 pl-3">
            <h2 className={`font-bold text-xs sm:text-sm ${currentTheme.text} line-clamp-1`}>
              {novel.title}
            </h2>
            <p className="text-[10px] text-purple-400 font-medium truncate max-w-[180px] sm:max-w-xs">
              {currentChapter ? currentChapter.title : `Halaman ${novel.progress.currentPage}`}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table of Contents / Chapters */}
          <button
            onClick={() => setShowChapterDrawer(true)}
            className={`p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 ${currentTheme.text} transition-colors cursor-pointer relative`}
            title="Daftar Bab"
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="sr-only">Daftar Bab</span>
          </button>

          {/* Text to Speech Narration */}
          {!isPdf && (
            <button
              onClick={toggleSpeechAudio}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-purple-600 text-white animate-pulse'
                  : `hover:bg-black/10 dark:hover:bg-white/10 ${currentTheme.text}`
              }`}
              title={isPlayingAudio ? 'Hentikan Suara Narasi' : 'Dengarkan Bacaan (Suara AI)'}
            >
              {isPlayingAudio ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}

          {/* Bookmark */}
          <button
            onClick={handleAddBookmark}
            className={`p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 ${currentTheme.text} transition-colors cursor-pointer`}
            title="Tandai Halaman Ini"
          >
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Settings Drawer Toggle */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 ${currentTheme.text} transition-colors cursor-pointer`}
            title="Pengaturan Tampilan Baca"
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen Zen Mode */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 ${currentTheme.text} transition-colors cursor-pointer hidden md:flex`}
            title="Layar Penuh (Zen Mode)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex">
        
        {/* Reading Text Container */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12"
        >
          <div className="max-w-2xl lg:max-w-3xl mx-auto space-y-8">
            
            {/* If PDF document */}
            {isPdf ? (
              <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-purple-900/40 shadow-2xl">
                <iframe
                  src={novel.fileData}
                  title={novel.title}
                  className="w-full h-full bg-neutral-900"
                />
              </div>
            ) : (
              /* Chapter Text Reading Experience */
              <article className="space-y-6">
                {/* Chapter Title Header */}
                <div className="text-center space-y-2 pb-6 border-b border-purple-900/20">
                  <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase">
                    BAB {currentChapterIndex + 1} DARI {novel.chapters?.length || 1}
                  </span>
                  <h1 
                    className={`text-xl sm:text-3xl font-bold ${currentTheme.text} tracking-tight ${
                      settings.fontFamily === 'cinzel' ? 'font-reader-cinzel' : ''
                    }`}
                  >
                    {currentChapter ? currentChapter.title : novel.title}
                  </h1>
                </div>

                {/* Chapter Content Paragraphs */}
                <div
                  className={`leading-relaxed space-y-5 ${
                    settings.fontFamily === 'serif' 
                      ? 'font-reader-serif' 
                      : settings.fontFamily === 'cinzel'
                      ? 'font-reader-cinzel'
                      : 'font-reader-sans'
                  }`}
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight
                  }}
                >
                  {currentChapter ? (
                    currentChapter.content.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx} className={`${currentTheme.text} text-justify`}>
                        {para}
                      </p>
                    ))
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <FileText className="w-12 h-12 text-purple-400 mx-auto" />
                      <p className={currentTheme.text}>
                        File novel telah tersimpan ({novel.fileName}).
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom of Chapter Nav buttons */}
                <div className="pt-12 pb-6 flex items-center justify-between gap-4 border-t border-purple-900/20">
                  <button
                    onClick={goToPrevChapter}
                    disabled={currentChapterIndex === 0}
                    className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-30 disabled:pointer-events-none text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab Sebelumnya</span>
                  </button>

                  <button
                    onClick={goToNextChapter}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <span>
                      {currentChapterIndex >= (novel.chapters?.length || 1) - 1
                        ? 'Selesaikan Novel'
                        : 'Bab Selanjutnya'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            )}

          </div>
        </div>

        {/* Sidebar: Table of Contents (Daftar Bab) */}
        {showChapterDrawer && (
          <div className="w-72 sm:w-80 bg-[#100b26] border-l border-purple-900/50 p-4 flex flex-col z-40 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <List className="w-4 h-4 text-purple-400" />
                <span>Daftar Bab Novel</span>
              </h3>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="p-1.5 rounded-lg text-purple-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
              {novel.chapters?.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    stopAudio();
                    setCurrentChapterIndex(idx);
                    setShowChapterDrawer(false);
                    if (contentRef.current) contentRef.current.scrollTop = 0;
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    idx === currentChapterIndex
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'text-purple-200/80 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate pr-2">{idx + 1}. {ch.title}</span>
                  {idx < currentChapterIndex && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar: Reading Settings Drawer */}
        {showSettingsDrawer && (
          <div className="w-72 sm:w-80 bg-[#120c2b] border-l border-purple-900/50 p-5 flex flex-col space-y-6 z-40 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Pengaturan Tampilan</span>
              </h3>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1.5 rounded-lg text-purple-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tema Pembaca (Color Palette) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-300">
                Tema Halaman
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'midnight', label: 'Midnight', bg: 'bg-[#090714]', border: 'border-purple-600' },
                  { id: 'dark', label: 'Hitam', bg: 'bg-[#121212]', border: 'border-neutral-600' },
                  { id: 'purple', label: 'Ungu', bg: 'bg-[#1e1338]', border: 'border-purple-400' },
                  { id: 'sepia', label: 'Sepia', bg: 'bg-[#f8f1e3]', border: 'border-[#dfd3bc]' },
                  { id: 'light', label: 'Terang', bg: 'bg-[#ffffff]', border: 'border-neutral-300' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ ...settings, theme: t.id as any })}
                    className={`h-10 rounded-xl ${t.bg} border-2 flex items-center justify-center transition-all cursor-pointer ${
                      settings.theme === t.id ? `${t.border} scale-110 shadow-lg` : 'border-transparent opacity-60'
                    }`}
                    title={t.label}
                  >
                    {settings.theme === t.id && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Ukuran Font */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-purple-300">
                <span className="font-semibold">Ukuran Teks</span>
                <span className="font-mono">{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateSettings({ ...settings, fontSize: Math.max(14, settings.fontSize - 2) })}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs cursor-pointer"
                >
                  A-
                </button>
                <input
                  type="range"
                  min="14"
                  max="28"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })}
                  className="flex-1 accent-purple-500 cursor-pointer"
                />
                <button
                  onClick={() => onUpdateSettings({ ...settings, fontSize: Math.min(28, settings.fontSize + 2) })}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs cursor-pointer"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Gaya Huruf (Font Family) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-300">
                Gaya Tulisan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'serif', label: 'Serif (Lora)' },
                  { id: 'sans', label: 'Sans (Modern)' },
                  { id: 'cinzel', label: 'Klasik' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ ...settings, fontFamily: f.id as any })}
                    className={`py-2 px-1 text-xs rounded-xl font-medium transition-all ${
                      settings.fontFamily === f.id
                        ? 'bg-purple-600 text-white font-bold shadow-md'
                        : 'bg-white/5 text-purple-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spasi Baris (Line Height) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-300">
                Kerapatan Paragraf
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1.5, label: 'Rapat' },
                  { val: 1.8, label: 'Normal' },
                  { val: 2.2, label: 'Longgar' }
                ].map((lh) => (
                  <button
                    key={lh.val}
                    onClick={() => onUpdateSettings({ ...settings, lineHeight: lh.val })}
                    className={`py-1.5 text-xs rounded-xl transition-all ${
                      settings.lineHeight === lh.val
                        ? 'bg-purple-600 text-white font-bold shadow-md'
                        : 'bg-white/5 text-purple-300 hover:text-white'
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Reader Bottom Bar: Reading Progress */}
      <footer className={`h-12 px-6 flex items-center justify-between border-t ${currentTheme.border} ${currentTheme.header} backdrop-blur-md select-none shrink-0 z-30 text-xs`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-purple-400 font-bold">
            {novel.progress.percentage}%
          </span>
          <span className="text-purple-300/60 hidden sm:inline">selesai dibaca</span>
        </div>

        {/* Center Progress Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${novel.progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-purple-300/80 text-[11px]">
            Bab {currentChapterIndex + 1} / {novel.chapters?.length || 1}
          </span>
        </div>
      </footer>

    </div>
  );
};
