export type CategoryType = 
  | 'Romance' 
  | 'Fantasy' 
  | 'Horror' 
  | 'Mystery' 
  | 'Sci-Fi' 
  | 'Petualangan' 
  | 'Adventure'
  | 'Inspirasi'
  | 'Slice of Life'
  | 'Thriller'
  | 'Klasik'
  | string;

export interface Chapter {
  id: string;
  title: string;
  content: string; // rich text or plain text story
}

export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  currentChapterIndex: number;
  scrollPercent: number;
  percentage: number; // 0 - 100
  lastReadAt?: string;
  completed: boolean;
  totalReadingTimeMinutes: number;
}

export interface NovelBookmark {
  id: string;
  chapterIndex: number;
  page: number;
  note?: string;
  createdAt: string;
}

export interface NovelNote {
  id: string;
  chapterIndex: number;
  text: string;
  excerpt?: string;
  createdAt: string;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  category: CategoryType;
  synopsis: string;
  coverUrl?: string; // custom uploaded image base64
  coverGradient: {
    from: string;
    to: string;
    accent: string;
    icon?: string;
  };
  fileType: 'text' | 'pdf' | 'epub';
  fileName: string;
  fileSize: string;
  fileData?: string; // base64 for pdf/epub or text
  chapters: Chapter[];
  pageCount: number;
  estimatedMinutes: number;
  rating: number; // 1-5
  isFavorite: boolean;
  isSample?: boolean;
  progress: ReadingProgress;
  bookmarks: NovelBookmark[];
  notes: NovelNote[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  readingGoalPerYear: number;
  joinedAt: string;
}

export interface ReadingSettings {
  fontSize: number; // 14 - 30
  fontFamily: 'serif' | 'sans' | 'cinzel';
  lineHeight: number; // 1.5 - 2.4
  theme: 'dark' | 'midnight' | 'sepia' | 'light' | 'purple';
  brightness: number; // 50 - 100%
  autoScroll: boolean;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  status: 'all' | 'reading' | 'unread' | 'completed';
  onlyFavorites: boolean;
  sortBy: 'latest' | 'title' | 'author' | 'progress' | 'rating';
  viewMode: 'shelf' | 'grid' | 'list';
}
