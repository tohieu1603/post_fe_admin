// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5445/api';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('managepost_access_token');
}

// Transform _id to id in response data (MongoDB returns _id, frontend uses id)
function transformId<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(item => transformId(item)) as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = { ...data as Record<string, unknown> };

    // Transform _id to id
    if ('_id' in result && !('id' in result)) {
      result.id = result._id;
    }

    // Recursively transform nested objects
    for (const key of Object.keys(result)) {
      if (result[key] && typeof result[key] === 'object') {
        result[key] = transformId(result[key]);
      }
    }

    return result as T;
  }

  return data;
}

// Generic fetch wrapper with error handling and auto-attach token
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Auto-attach token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  const data = await res.json();
  return transformId(data);
}

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// === Content Structure Types ===
export interface TocItem {
  id: string;
  text: string;
  level: number;
  anchor: string;
}

export interface ImageBlock {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ReviewBlock {
  provider: string;
  rating: number;
  summary?: string;
  pros: string[];
  cons: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TableBlock {
  headers: string[];
  rows: string[][];
}

export interface ListBlock {
  type: 'ordered' | 'unordered';
  items: string[];
}

export type SectionType = 'heading' | 'paragraph' | 'image' | 'review' | 'faq' | 'table' | 'list' | 'quote' | 'code' | 'html';

export interface ContentSection {
  id: string;
  type: SectionType;
  order: number;
  level?: number;
  text?: string;
  anchor?: string;
  content?: string;
  image?: ImageBlock;
  review?: ReviewBlock;
  faqs?: FaqItem[];
  table?: TableBlock;
  list?: ListBlock;
  language?: string;
}

export interface ContentStructure {
  summary?: string;
  toc: TocItem[];
  sections: ContentSection[];
  wordCount?: number;
  estimatedReadTime?: number;
  lastStructureUpdate?: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle: string | null;  // Tiêu đề phụ
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  categoryId: string;
  category?: Category;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  viewCount: number;
  // Author & Tags
  author: string | null;
  tags: string[] | null;
  // SEO - Basic Meta
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  // SEO - Open Graph
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  // SEO - Twitter Card
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  // Advanced Options
  isFeatured: boolean;
  allowComments: boolean;
  readingTime: number | null;
  template: string | null;
  customFields: Record<string, unknown> | null;
  // Content Structure
  contentStructure?: ContentStructure | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostStatistics {
  total: number;
  byStatus: {
    draft: number;
    published: number;
    archived: number;
  };
}

// Category API
export const categoryApi = {
  getAll: (params?: {
    search?: string;
    parentId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.parentId) searchParams.set('parentId', params.parentId);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const query = searchParams.toString();
    return fetchApi<Category[]>(`/categories${query ? `?${query}` : ''}`);
  },

  getTree: () => fetchApi<Category[]>('/categories/tree'),

  getDropdown: () => fetchApi<Category[]>('/categories/dropdown'),

  getById: (id: string) => fetchApi<Category>(`/categories/${id}`),

  create: (data: Partial<Category>) =>
    fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Category>) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  toggleActive: (id: string) =>
    fetchApi<Category>(`/categories/${id}/toggle-active`, {
      method: 'PATCH',
    }),

  generateSlug: (name: string) =>
    fetchApi<{ slug: string }>('/categories/generate-slug', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
};

// Post API
export const postApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const query = searchParams.toString();
    return fetchApi<PostsResponse>(`/posts${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => fetchApi<Post>(`/posts/${id}`),

  getBySlug: (slug: string) => fetchApi<Post>(`/posts/slug/${slug}`),

  getRecent: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchApi<Post[]>(`/posts/recent${query}`);
  },

  getStatistics: () => fetchApi<PostStatistics>('/posts/statistics'),

  getByCategory: (categoryId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchApi<Post[]>(`/posts/category/${categoryId}${query}`);
  },

  create: (data: Partial<Post>) =>
    fetchApi<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Post>) =>
    fetchApi<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: string) =>
    fetchApi<Post>(`/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  generateSlug: (title: string) =>
    fetchApi<{ slug: string }>('/posts/generate-slug', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  // === Content Structure APIs ===
  getStructure: (postId: string) =>
    fetchApi<{ success: boolean; data: ContentStructure; parsed?: boolean }>(`/posts/${postId}/structure`),

  saveStructure: (postId: string, structure: ContentStructure, updateContent = false) =>
    fetchApi<{ success: boolean; data: Post }>(`/posts/${postId}/structure`, {
      method: 'PUT',
      body: JSON.stringify({ structure, updateContent }),
    }),

  parseToStructure: (postId: string, html: string) =>
    fetchApi<{ success: boolean; data: ContentStructure }>(`/posts/${postId}/structure/parse`, {
      method: 'POST',
      body: JSON.stringify({ html }),
    }),

  structureToHtml: (postId: string, structure: ContentStructure) =>
    fetchApi<{ success: boolean; data: { html: string; tocHtml: string } }>(`/posts/${postId}/structure/to-html`, {
      method: 'POST',
      body: JSON.stringify({ structure }),
    }),

  syncStructureFromContent: (postId: string) =>
    fetchApi<{ success: boolean; data: ContentStructure; message: string }>(`/posts/${postId}/structure/sync`, {
      method: 'POST',
    }),

  addSection: (postId: string, section: Partial<ContentSection>, afterSectionId?: string) =>
    fetchApi<{ success: boolean; data: ContentStructure }>(`/posts/${postId}/structure/section`, {
      method: 'POST',
      body: JSON.stringify({ section, afterSectionId }),
    }),

  updateSection: (postId: string, sectionId: string, updates: Partial<ContentSection>) =>
    fetchApi<{ success: boolean; data: ContentStructure }>(`/posts/${postId}/structure/section/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    }),

  removeSection: (postId: string, sectionId: string) =>
    fetchApi<{ success: boolean; data: ContentStructure }>(`/posts/${postId}/structure/section/${sectionId}`, {
      method: 'DELETE',
    }),

  reorderSections: (postId: string, sectionIds: string[]) =>
    fetchApi<{ success: boolean; data: ContentStructure }>(`/posts/${postId}/structure/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ sectionIds }),
    }),
};

// =====================
// Tags Types & API
// =====================
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const tagApi = {
  getAll: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<Tag[]>(`/tags${query}`);
  },

  getById: (id: string) => fetchApi<Tag>(`/tags/${id}`),

  create: (data: Partial<Tag>) =>
    fetchApi<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Tag>) =>
    fetchApi<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/tags/${id}`, {
      method: 'DELETE',
    }),

  merge: (sourceId: string, targetId: string) =>
    fetchApi<Tag>(`/tags/${sourceId}/merge/${targetId}`, {
      method: 'POST',
    }),

  getWithPostCount: () => fetchApi<Tag[]>('/tags/with-post-count'),
};

// =====================
// Media Types & API
// =====================
export interface MediaAssignment {
  pageSlug: string;
  sectionKey: string;
  elementId?: string;
}

export interface Media {
  id: string;
  _id?: string;  // MongoDB returns _id, virtuals add id
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  title: string | null;  // Tiêu đề ảnh
  altText: string | null;
  caption: string | null;
  folder: string | null;
  categoryId: string | null;  // Danh mục ảnh
  usedIn: { type: string; id: string; title: string }[] | null;
  assignments?: MediaAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaListResponse {
  data: Media[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const mediaApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    mimeType?: string;
    folder?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.mimeType) searchParams.set('mimeType', params.mimeType);
    if (params?.folder) searchParams.set('folder', params.folder);
    const query = searchParams.toString();
    return fetchApi<MediaListResponse>(`/media${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => fetchApi<Media>(`/media/${id}`),

  upload: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    return res.json() as Promise<Media>;
  },

  update: (id: string, data: { altText?: string; caption?: string; folder?: string }) =>
    fetchApi<Media>(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/media/${id}`, {
      method: 'DELETE',
    }),

  getUsage: (id: string) => fetchApi<{ type: string; id: string; title: string }[]>(`/media/${id}/usage`),
};

// =====================
// User Types & API
// =====================
export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const userApi = {
  getAll: (params?: { search?: string; role?: UserRole; isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    const query = searchParams.toString();
    return fetchApi<User[]>(`/users${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => fetchApi<User>(`/users/${id}`),

  create: (data: { email: string; name: string; password: string; role: UserRole }) =>
    fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<User> & { password?: string }) =>
    fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  toggleActive: (id: string) =>
    fetchApi<User>(`/users/${id}/toggle-active`, {
      method: 'PATCH',
    }),

  getActivityLogs: (id: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchApi<ActivityLog[]>(`/users/${id}/activity${query}`);
  },
};

// =====================
// SEO Types & API
// =====================
export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  note: string | null;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SitemapConfig {
  enabled: boolean;
  excludePatterns: string[];
  changeFrequency: string;
  priority: number;
}

export const seoApi = {
  // Redirects
  getAllRedirects: () => fetchApi<Redirect[]>('/seo/redirects'),

  getRedirectById: (id: string) => fetchApi<Redirect>(`/seo/redirects/${id}`),

  createRedirect: (data: Partial<Redirect>) =>
    fetchApi<Redirect>('/seo/redirects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRedirect: (id: string, data: Partial<Redirect>) =>
    fetchApi<Redirect>(`/seo/redirects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRedirect: (id: string) =>
    fetchApi<{ message: string }>(`/seo/redirects/${id}`, {
      method: 'DELETE',
    }),

  // Robots.txt
  getRobotsTxt: () => fetchApi<{ content: string }>('/seo/robots'),

  updateRobotsTxt: (content: string) =>
    fetchApi<{ message: string }>('/seo/robots', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  // Sitemap config
  getSitemapConfig: () => fetchApi<SitemapConfig>('/seo/sitemap-config'),

  updateSitemapConfig: (config: Partial<SitemapConfig>) =>
    fetchApi<{ message: string }>('/seo/sitemap-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};

// =====================
// Settings Types & API
// =====================
export interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  siteLogo?: string;
  siteFavicon?: string;
  siteUrl?: string;
}

export interface EmailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface ApiKeySettings {
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  facebookPixelId?: string;
}

export interface SeoGlobalSettings {
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImage?: string;
  schemaOrganization?: {
    name?: string;
    logo?: string;
    url?: string;
    sameAs?: string[];
  };
}

export const settingsApi = {
  getAll: () => fetchApi<Setting[]>('/settings'),

  getByCategory: (category: string) => fetchApi<Setting[]>(`/settings/category/${category}`),

  get: (key: string) => fetchApi<Setting>(`/settings/${key}`),

  set: (key: string, value: unknown, category: string = 'general') =>
    fetchApi<Setting>('/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value, category }),
    }),

  delete: (key: string) =>
    fetchApi<{ message: string }>(`/settings/${key}`, {
      method: 'DELETE',
    }),

  // Convenience methods for typed settings
  getSiteSettings: async (): Promise<SiteSettings> => {
    const settings = await fetchApi<Setting[]>('/settings/category/site');
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as SiteSettings);
  },

  getEmailSettings: async (): Promise<EmailSettings> => {
    const settings = await fetchApi<Setting[]>('/settings/category/email');
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as EmailSettings);
  },

  getApiKeySettings: async (): Promise<ApiKeySettings> => {
    const settings = await fetchApi<Setting[]>('/settings/category/api-keys');
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as ApiKeySettings);
  },

  getSeoGlobalSettings: async (): Promise<SeoGlobalSettings> => {
    const settings = await fetchApi<Setting[]>('/settings/category/seo');
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as SeoGlobalSettings);
  },

  updateSiteSettings: async (data: SiteSettings) => {
    const promises = Object.entries(data).map(([key, value]) =>
      fetchApi<Setting>('/settings', {
        method: 'POST',
        body: JSON.stringify({ key, value, category: 'site' }),
      })
    );
    return Promise.all(promises);
  },

  updateEmailSettings: async (data: EmailSettings) => {
    const promises = Object.entries(data).map(([key, value]) =>
      fetchApi<Setting>('/settings', {
        method: 'POST',
        body: JSON.stringify({ key, value, category: 'email' }),
      })
    );
    return Promise.all(promises);
  },

  updateApiKeySettings: async (data: ApiKeySettings) => {
    const promises = Object.entries(data).map(([key, value]) =>
      fetchApi<Setting>('/settings', {
        method: 'POST',
        body: JSON.stringify({ key, value, category: 'api-keys' }),
      })
    );
    return Promise.all(promises);
  },

  updateSeoGlobalSettings: async (data: SeoGlobalSettings) => {
    const promises = Object.entries(data).map(([key, value]) =>
      fetchApi<Setting>('/settings', {
        method: 'POST',
        body: JSON.stringify({ key, value, category: 'seo' }),
      })
    );
    return Promise.all(promises);
  },
};

// =====================
// Auto SEO Types & API
// =====================
export interface SeoScore {
  id: string;
  postId: string;
  overallScore: number;
  titleScore: number;
  metaDescriptionScore: number;
  contentScore: number;
  headingScore: number;
  keywordScore: number;
  readabilityScore: number;
  internalLinkScore: number;
  imageScore: number;
  technicalScore: number;
  analysis: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    avgWordsPerSentence: number;
    headings: { h1: number; h2: number; h3: number; h4: number };
    images: { total: number; withAlt: number; withoutAlt: number };
    links: { internal: number; external: number };
    keywordDensity: number;
    focusKeyword?: string;
    focusKeywordCount?: number;
  };
  suggestions: Array<{
    type: 'error' | 'warning' | 'success' | 'info';
    category: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number | null;
  currentRank: number | null;
  previousRank: number | null;
  targetUrl: string | null;
  postId: string | null;
  clicks: number;
  impressions: number;
  ctr: number;
  isTracking: boolean;
  language: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndexStatus {
  id: string;
  url: string;
  postId: string | null;
  status: 'pending' | 'submitted' | 'indexed' | 'not_indexed' | 'error' | 'removed';
  submittedAt: string | null;
  indexedAt: string | null;
  lastChecked: string | null;
  mobileScore: number | null;
  desktopScore: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeoLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  entityUrl: string | null;
  status: 'success' | 'failed' | 'pending' | 'skipped';
  message: string | null;
  details: Record<string, unknown> | null;
  duration: number | null;
  isScheduled: boolean;
  createdAt: string;
}

export interface AutoSeoDashboard {
  totalPosts: number;
  analyzedPosts: number;
  avgScore: number;
  indexedUrls: number;
  pendingUrls: number;
  trackedKeywords: number;
  recentActivity: SeoLog[];
  scoreDistribution: { range: string; count: number }[];
}

export interface SeoAnalysisResult {
  success: boolean;
  data?: {
    overallScore: number;
    scores: {
      title: number;
      metaDescription: number;
      content: number;
      heading: number;
      keyword: number;
      readability: number;
      internalLink: number;
      image: number;
      technical: number;
    };
    analysis: SeoScore['analysis'];
    suggestions: SeoScore['suggestions'];
  };
  error?: string;
}

export const autoSeoApi = {
  // Dashboard
  getDashboard: () => fetchApi<AutoSeoDashboard>('/auto-seo/dashboard'),

  // SEO Analysis
  analyzePost: (postId: string, focusKeyword?: string) =>
    fetchApi<SeoAnalysisResult>(`/auto-seo/analyze/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ focusKeyword }),
    }),

  getSeoScore: (postId: string) => fetchApi<SeoScore>(`/auto-seo/score/${postId}`),

  getSeoScores: (postIds: string[]) =>
    fetchApi<SeoScore[]>(`/auto-seo/scores?postIds=${postIds.join(',')}`),

  bulkAnalyze: (postIds: string[]) =>
    fetchApi<{ processed: number; results: SeoAnalysisResult[] }>('/auto-seo/bulk-analyze', {
      method: 'POST',
      body: JSON.stringify({ postIds }),
    }),

  // Google Indexing
  submitUrlForIndexing: (url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') =>
    fetchApi<{ success: boolean; error?: string }>('/auto-seo/submit-index', {
      method: 'POST',
      body: JSON.stringify({ url, type }),
    }),

  inspectUrl: (url: string) =>
    fetchApi<{ success: boolean; data?: unknown; error?: string }>('/auto-seo/inspect-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  getIndexStatus: (url?: string, status?: string) => {
    const params = new URLSearchParams();
    if (url) params.set('url', url);
    if (status) params.set('status', status);
    const query = params.toString();
    return fetchApi<IndexStatus[]>(`/auto-seo/index-status${query ? `?${query}` : ''}`);
  },

  bulkSubmitForIndexing: (urls: string[]) =>
    fetchApi<{ processed: number; results: { url: string; success: boolean; error?: string }[] }>(
      '/auto-seo/bulk-submit',
      {
        method: 'POST',
        body: JSON.stringify({ urls }),
      }
    ),

  // PageSpeed
  getPageSpeedInsights: (url: string, strategy: 'mobile' | 'desktop' = 'mobile') =>
    fetchApi<{
      success: boolean;
      data?: {
        performanceScore: number;
        accessibilityScore?: number;
        seoScore?: number;
        metrics: Record<string, string | undefined>;
        suggestions: string[];
      };
      error?: string;
    }>('/auto-seo/pagespeed', {
      method: 'POST',
      body: JSON.stringify({ url, strategy }),
    }),

  // Keywords
  getKeywords: (postId?: string) => {
    const query = postId ? `?postId=${postId}` : '';
    return fetchApi<Keyword[]>(`/auto-seo/keywords${query}`);
  },

  trackKeyword: (data: { keyword: string; targetUrl?: string; postId?: string; searchVolume?: number }) =>
    fetchApi<Keyword>('/auto-seo/keywords', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteKeyword: (id: string) =>
    fetchApi<{ message: string }>(`/auto-seo/keywords/${id}`, {
      method: 'DELETE',
    }),

  syncKeywords: () =>
    fetchApi<{ success: boolean; synced: number; error?: string }>('/auto-seo/keywords/sync', {
      method: 'POST',
    }),

  // Search Analytics
  getSearchAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    dimensions?: string[];
    rowLimit?: number;
  }) =>
    fetchApi<{
      success: boolean;
      data?: { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
      error?: string;
    }>('/auto-seo/search-analytics', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  // Logs
  getLogs: (params?: { limit?: number; action?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.action) searchParams.set('action', params.action);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return fetchApi<SeoLog[]>(`/auto-seo/logs${query ? `?${query}` : ''}`);
  },
};

// =====================
// Auth Types & API
// =====================
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => {
    // Just clear local storage, no API call needed
    if (typeof window !== 'undefined') {
      localStorage.removeItem('managepost_access_token');
      localStorage.removeItem('managepost_refresh_token');
    }
  },

  refreshToken: (refreshToken: string) =>
    fetchApi<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getProfile: () => fetchApi<AuthUser>('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    fetchApi<AuthUser>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchApi<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// =====================
// AI SEO Types & API (DeepSeek)
// =====================
export interface AiSeoAnalysis {
  overallScore: number;
  titleAnalysis: {
    score: number;
    suggestions: string[];
    improvedTitle?: string;
  };
  metaDescriptionAnalysis: {
    score: number;
    suggestions: string[];
    improvedDescription?: string;
  };
  contentAnalysis: {
    score: number;
    readability: string;
    suggestions: string[];
  };
  keywordAnalysis: {
    score: number;
    detectedKeywords: string[];
    suggestedKeywords: string[];
    density: string;
  };
  structureAnalysis: {
    score: number;
    headingStructure: string;
    suggestions: string[];
  };
  competitorInsights?: string[];
  summary: string;
}

export interface AiTitleSuggestion {
  title: string;
  reason: string;
  keywords: string[];
}

export interface AiMetaDescription {
  description: string;
  characterCount: number;
  keywords: string[];
}

export interface AiKeywordSuggestion {
  keyword: string;
  type: 'primary' | 'secondary' | 'long-tail';
  searchIntent: string;
  competition: 'low' | 'medium' | 'high';
}

export interface AiContentOutline {
  title: string;
  introduction: string;
  sections: Array<{
    heading: string;
    subheadings: string[];
    keyPoints: string[];
  }>;
  conclusion: string;
  estimatedWordCount: number;
}

export interface AiContentImprovement {
  improvedContent: string;
  changes: Array<{
    type: string;
    description: string;
  }>;
  keywordOptimization: {
    added: string[];
    density: string;
  };
}

// Smart Meta Response
export interface SmartMetaResponse {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
}

// Realtime SEO Score Response
export interface RealtimeSeoScore {
  score: number;
  breakdown: {
    title: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    metaDescription: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    content: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    keyword: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    readability: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    headings: { score: number; message: string; status: 'good' | 'warning' | 'error' };
  };
  suggestions: string[];
}

// Internal Link Suggestion
export interface InternalLinkSuggestion {
  postId: string;
  postTitle: string;
  postSlug: string;
  anchorText: string;
  context: string;
  relevanceScore: number;
}

// Duplicate Check Result
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarityScore: number;
  matches: Array<{
    postId: string;
    postTitle: string;
    similarity: number;
    matchedPhrases: string[];
  }>;
  recommendation: string;
}

// Schema Response
export interface SchemaResponse {
  articleSchema: object;
  breadcrumbSchema: object;
  faqSchema?: object;
}

export const aiSeoApi = {
  // AI-powered post analysis
  analyzePost: (postId: string, focusKeyword?: string) =>
    fetchApi<{ success: boolean; data?: AiSeoAnalysis; error?: string }>(`/auto-seo/ai/analyze/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ focusKeyword }),
    }),

  // Generate title suggestions
  suggestTitles: (postId: string, count: number = 5) =>
    fetchApi<{ success: boolean; data?: AiTitleSuggestion[]; error?: string }>(`/auto-seo/ai/suggest-titles/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),

  // Generate meta description
  generateMetaDescription: (postId: string) =>
    fetchApi<{ success: boolean; data?: AiMetaDescription; error?: string }>(`/auto-seo/ai/generate-meta/${postId}`, {
      method: 'POST',
    }),

  // Suggest keywords for a topic
  suggestKeywords: (topic: string, count: number = 10) =>
    fetchApi<{ success: boolean; data?: AiKeywordSuggestion[]; error?: string }>('/auto-seo/ai/suggest-keywords', {
      method: 'POST',
      body: JSON.stringify({ topic, count }),
    }),

  // Generate content outline
  generateOutline: (topic: string, targetKeyword?: string) =>
    fetchApi<{ success: boolean; data?: AiContentOutline; error?: string }>('/auto-seo/ai/generate-outline', {
      method: 'POST',
      body: JSON.stringify({ topic, targetKeyword }),
    }),

  // Improve content for SEO
  improveContent: (content: string, focusKeyword?: string) =>
    fetchApi<{ success: boolean; data?: AiContentImprovement; error?: string }>('/auto-seo/ai/improve-content', {
      method: 'POST',
      body: JSON.stringify({ content, focusKeyword }),
    }),

  // Smart Meta Generator - generate meta from title
  generateSmartMeta: (title: string, content?: string) =>
    fetchApi<{ success: boolean; data?: SmartMetaResponse; error?: string }>('/auto-seo/ai/smart-meta', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  // Real-time SEO Score
  getRealtimeSeoScore: (data: { title: string; metaDescription?: string; content: string; focusKeyword?: string }) =>
    fetchApi<{ success: boolean; data?: RealtimeSeoScore; error?: string }>('/auto-seo/ai/realtime-score', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Suggest internal links
  suggestInternalLinks: (content: string, excludePostId?: string) =>
    fetchApi<{ success: boolean; data?: { suggestions: InternalLinkSuggestion[] }; error?: string }>('/auto-seo/ai/suggest-links', {
      method: 'POST',
      body: JSON.stringify({ content, excludePostId }),
    }),

  // Check duplicate content
  checkDuplicateContent: (content: string, excludePostId?: string) =>
    fetchApi<{ success: boolean; data?: DuplicateCheckResult; error?: string }>('/auto-seo/ai/check-duplicate', {
      method: 'POST',
      body: JSON.stringify({ content, excludePostId }),
    }),

  // Generate schema for post
  generateSchema: (postId: string, siteUrl?: string) =>
    fetchApi<{ success: boolean; data?: SchemaResponse; error?: string }>(`/auto-seo/ai/schema/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ siteUrl }),
    }),

  // Generate alt text for image
  generateImageAltText: (imageUrl: string, pageContext?: string) =>
    fetchApi<{ success: boolean; data?: { altText: string }; error?: string }>('/auto-seo/ai/generate-alt', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, pageContext }),
    }),

  // Content Optimizer - analyze and provide specific improvement suggestions
  optimizeContent: (data: { title: string; content: string; focusKeyword?: string; excludePostId?: string }) =>
    fetchApi<{ success: boolean; data?: ContentOptimizationResult; error?: string }>('/auto-seo/ai/optimize-content', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Content Optimization types
export interface ContentOptimizationSuggestion {
  type: 'add_heading' | 'add_keyword' | 'add_internal_link' | 'add_faq' | 'improve_intro' | 'add_section' | 'improve_readability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  position?: string;
  relatedKeyword?: string;
}

export interface HeadingSuggestion {
  type: 'h2' | 'h3';
  text: string;
  reason: string;
  afterSection?: string;
}

export interface KeywordSuggestion {
  keyword: string;
  currentCount: number;
  suggestedCount: number;
  placements: string[];
}

export interface InternalLinkOptSuggestion {
  anchorText: string;
  targetPost: string;
  targetSlug: string;
  context: string;
}

export interface FaqSuggestion {
  question: string;
  suggestedAnswer: string;
}

export interface ContentOptimizationResult {
  suggestions: ContentOptimizationSuggestion[];
  headingSuggestions: HeadingSuggestion[];
  keywordSuggestions: KeywordSuggestion[];
  internalLinkSuggestions: InternalLinkOptSuggestion[];
  faqSuggestions: FaqSuggestion[];
  summary: {
    totalSuggestions: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    estimatedImprovementScore: number;
  };
}

// Scheduler types
export interface SchedulerStatus {
  isRunning: boolean;
  tasksCount: number;
  lastReport: SeoReport | null;
}

export interface ScheduledTaskResult {
  task: string;
  success: boolean;
  startTime: string;
  endTime: string;
  duration: number;
  details: Record<string, unknown>;
  error?: string;
}

export interface SeoReport {
  generatedAt: string;
  period: 'daily' | 'weekly' | 'monthly';
  summary: {
    totalPosts: number;
    analyzedPosts: number;
    avgScore: number;
    scoreChange: number;
    indexedUrls: number;
    newIndexed: number;
    trackedKeywords: number;
    avgPosition: number;
    positionChange: number;
  };
  topPerformers: Array<{
    postId: string;
    title: string;
    score: number;
    position?: number;
  }>;
  needsAttention: Array<{
    postId: string;
    title: string;
    score: number;
    issues: string[];
  }>;
  keywordRankings: Array<{
    keyword: string;
    position: number;
    previousPosition: number;
    change: number;
    clicks: number;
    impressions: number;
  }>;
  actions: Array<{
    type: string;
    description: string;
    affectedCount: number;
  }>;
}

// Scheduler API
export const schedulerApi = {
  // Get scheduler status
  getStatus: () =>
    fetchApi<{ success: boolean; data?: SchedulerStatus; error?: string }>('/auto-seo/scheduler/status'),

  // Get last report
  getLastReport: () =>
    fetchApi<{ success: boolean; data?: SeoReport | null; error?: string }>('/auto-seo/scheduler/report'),

  // Generate report on demand
  generateReport: (period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
    fetchApi<{ success: boolean; data?: SeoReport; error?: string }>('/auto-seo/scheduler/report', {
      method: 'POST',
      body: JSON.stringify({ period }),
    }),

  // Trigger daily tasks
  triggerDailyTasks: () =>
    fetchApi<{ success: boolean; data?: ScheduledTaskResult[]; error?: string }>('/auto-seo/scheduler/trigger/daily', {
      method: 'POST',
    }),

  // Trigger weekly tasks
  triggerWeeklyTasks: () =>
    fetchApi<{ success: boolean; data?: ScheduledTaskResult[]; error?: string }>('/auto-seo/scheduler/trigger/weekly', {
      method: 'POST',
    }),

  // Trigger monthly tasks
  triggerMonthlyTasks: () =>
    fetchApi<{ success: boolean; data?: ScheduledTaskResult[]; error?: string }>('/auto-seo/scheduler/trigger/monthly', {
      method: 'POST',
    }),
};

// =====================
// PageContent Types & API
// =====================
export interface PageContent {
  _id: string;
  pageSlug: string;
  pageName: string;
  content: Record<string, { id: string; html: string }>; // Raw JSON content
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const pageContentApi = {
  // Get all pages
  getAll: (activeOnly = true) => {
    const query = activeOnly ? '' : '?activeOnly=false';
    return fetchApi<PageContent[]>(`/page-content${query}`);
  },

  // Get page by slug - returns raw JSON content
  getBySlug: (pageSlug: string) =>
    fetchApi<PageContent>(`/page-content/${pageSlug}`),

  // Create new page
  create: (data: { pageSlug: string; pageName: string; content: Record<string, unknown> }) =>
    fetchApi<PageContent>('/page-content', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update page
  update: (pageSlug: string, data: Partial<PageContent>) =>
    fetchApi<PageContent>(`/page-content/${pageSlug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Upsert page
  upsert: (pageSlug: string, data: { pageName: string; content: Record<string, unknown>; isActive?: boolean }) =>
    fetchApi<PageContent>(`/page-content/${pageSlug}/upsert`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete page
  delete: (pageSlug: string) =>
    fetchApi<{ message: string }>(`/page-content/${pageSlug}`, {
      method: 'DELETE',
    }),

  // Toggle page active
  toggleActive: (pageSlug: string) =>
    fetchApi<PageContent>(`/page-content/${pageSlug}/toggle-active`, {
      method: 'PATCH',
    }),

  // Import from JSON
  importFromJson: (pageSlug: string, pageName: string, content: Record<string, unknown>) =>
    fetchApi<{ message: string; page: PageContent }>('/page-content/import', {
      method: 'POST',
      body: JSON.stringify({ pageSlug, pageName, content }),
    }),
};

// =====================
// Public API (Frontend Portal)
// =====================

export interface PublicPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  viewCount: number;
  isFeatured?: boolean;
  category?: { _id: string; name: string; slug: string };
  tagsRelation?: { _id: string; name: string; slug: string; color: string }[];
  content?: string;
  author?: string;
  readingTime?: number;
  contentStructure?: ContentStructure | null;
}

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: { _id: string; name: string; slug: string };
}

export interface PublicTag {
  _id: string;
  name: string;
  slug: string;
  color: string;
  postCount?: number;
}

export interface PublicPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedPublicResponse<T> {
  success: boolean;
  data: T;
  pagination: PublicPagination;
  error?: string;
}

export interface HomeSectionData {
  category: { id: string; name: string; slug: string };
  posts: PublicPost[];
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  children: MenuItem[];
}

// Public API - No auth required
export const publicApi = {
  // Homepage
  getFeatured: (limit = 5) =>
    fetchApi<PublicResponse<PublicPost[]>>(`/public/home/featured?limit=${limit}`),

  getLatest: (page = 1, limit = 20) =>
    fetchApi<PaginatedPublicResponse<PublicPost[]>>(`/public/home/latest?page=${page}&limit=${limit}`),

  getHomeSections: (limit = 5) =>
    fetchApi<PublicResponse<HomeSectionData[]>>(`/public/home/sections?limit=${limit}`),

  // Category
  getCategory: (slug: string, page = 1, limit = 10) =>
    fetchApi<PublicResponse<{
      category: PublicCategory;
      subcategories: PublicCategory[];
      posts: PublicPost[];
      pagination: PublicPagination;
    }>>(`/public/category/${slug}?page=${page}&limit=${limit}`),

  getCategoryFeatured: (slug: string, limit = 5) =>
    fetchApi<PublicResponse<PublicPost[]>>(`/public/category/${slug}/featured?limit=${limit}`),

  // Tag
  getTag: (slug: string, page = 1, limit = 10) =>
    fetchApi<PublicResponse<{
      tag: PublicTag;
      posts: PublicPost[];
      pagination: PublicPagination;
    }>>(`/public/tag/${slug}?page=${page}&limit=${limit}`),

  // Post
  getPost: (slug: string) =>
    fetchApi<PublicResponse<PublicPost>>(`/public/post/${slug}`),

  getRelatedPosts: (slug: string, limit = 5) =>
    fetchApi<PublicResponse<PublicPost[]>>(`/public/post/${slug}/related?limit=${limit}`),

  // Search
  search: (q: string, options?: { category?: string; tag?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams({ q });
    if (options?.category) params.append('category', options.category);
    if (options?.tag) params.append('tag', options.tag);
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    return fetchApi<PublicResponse<{
      query: string;
      posts: PublicPost[];
      pagination: PublicPagination;
    }>>(`/public/search?${params}`);
  },

  searchSuggest: (q: string, limit = 5) =>
    fetchApi<PublicResponse<{ title: string; slug: string }[]>>(`/public/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`),

  // Widgets
  getMostViewed: (limit = 10, period: 'all' | 'week' | 'month' = 'all') =>
    fetchApi<PublicResponse<PublicPost[]>>(`/public/widget/most-viewed?limit=${limit}&period=${period}`),

  getTrendingTags: (limit = 10) =>
    fetchApi<PublicResponse<PublicTag[]>>(`/public/widget/trending-tags?limit=${limit}`),

  getCategories: () =>
    fetchApi<PublicResponse<(PublicCategory & { postCount: number; subcategoryCount: number })[]>>(`/public/widget/categories`),

  // Archive
  getArchive: (year: number, month: number, page = 1, limit = 20) =>
    fetchApi<PublicResponse<{
      year: number;
      month: number;
      posts: PublicPost[];
      pagination: PublicPagination;
    }>>(`/public/archive/${year}/${month}?page=${page}&limit=${limit}`),

  getTimeline: (hours = 24) =>
    fetchApi<PublicResponse<{ timeline: Record<string, PublicPost[]>; total: number }>>(`/public/archive/timeline?hours=${hours}`),

  // Navigation
  getMenu: () =>
    fetchApi<PublicResponse<MenuItem[]>>(`/public/navigation/menu`),

  // Analytics tracking
  track: (data: {
    eventType: 'page_view' | 'post_view' | 'category_view' | 'faq_click' | 'toc_click' | 'link_click';
    entityType: 'post' | 'category' | 'page' | 'faq' | 'toc' | 'link';
    entityId?: string;
    entitySlug?: string;
    metadata?: Record<string, unknown>;
  }) =>
    fetch(`${API_URL}/public/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Get post stats (views, faq clicks, toc clicks)
  getPostStats: (postId: string) =>
    fetchApi<PublicResponse<{ viewCount: number; faqClicks: number; tocClicks: number }>>(`/public/stats/post/${postId}`),
};

// =====================
// Analytics API (Admin)
// =====================

export interface PostAnalyticsSummary {
  totalViews: number;
  uniqueViews: number;
  faqClicks: number;
  tocClicks: number;
  shareFacebook: number;
  shareTwitter: number;
  shareCopyLink: number;
  tagClicks: number;
  relatedPostClicks: number;
  categoryLinkClicks: number;
}

export interface DailyViewData {
  date: string;
  totalViews: number;
  uniqueViews: number;
}

export interface PostAnalyticsResponse {
  period: { days: number; startDate: string };
  summary: PostAnalyticsSummary;
  dailyViews: DailyViewData[];
  hourlyDistribution: { hour: number; count: number }[];
  referrers: { url: string; count: number }[];
  faqDetails: { question: string; count: number }[];
  tocDetails: { heading: string; anchor: string; count: number }[];
  tagClicks: { slug: string; name: string; count: number }[];
  relatedPostClicks: { slug: string; count: number }[];
}

export const analyticsApi = {
  // Get detailed analytics for a post (admin)
  getPostAnalytics: (postId: string, days = 30) =>
    fetchApi<{ success: boolean; data: PostAnalyticsResponse }>(`/analytics/post/${postId}?days=${days}`),

  // Get overall site analytics
  getOverview: (days = 30) =>
    fetchApi<{
      success: boolean;
      data: {
        period: { days: number; startDate: string };
        eventsByType: { type: string; count: number }[];
        dailyTotals: { date: string; totalViews: number; uniqueViews: number }[];
        topPosts: { _id: string; slug: string; totalViews: number }[];
      };
    }>(`/analytics/overview?days=${days}`),
};
