import { writable, derived } from 'svelte/store';

/**
 * @typedef {'ON' | 'PAUSE' | 'OFF'} PipelineFlag
 * @typedef {'IDLE' | 'RUNNING' | 'COMPLETE'} PipelineState
 * @typedef {{
 *   flag: PipelineFlag,
 *   status: PipelineState,
 *   lastRun: string | null,
 *   nextRun: string | null,
 *   published: number,
 *   failed: number
 * }} PipelineStatus
 * @typedef {{
 *   id: number,
 *   startedAt: string,
 *   completedAt: string,
 *   discovered: number,
 *   scored: number,
 *   rejected: number,
 *   published: number,
 *   status: string
 * }} RunRecord
 * @typedef {{
 *   id: number,
 *   title: string,
 *   theme: string,
 *   category?: string,
 *   relevanceScore?: number,
 *   innovationScore?: number,
 *   featured?: boolean,
 *   status?: string,
 *   publishedAt?: string,
 *   scheduledAt?: string,
 *   image?: string,
 *   imageUrl?: string,
 *   source?: string,
 *   readTime?: string,
 *   sourceUrl?: string,
 *   summary?: string
 * }} BlogItem
 * @typedef {{
 *   id: string,
 *   name: string,
 *   lastCalibrated: string,
 *   keywords: string[]
 * }} Theme
 * @typedef {{
 *   id: string,
 *   themeId: string,
 *   themeName: string,
 *   generatedAt: string,
 *   articlesAnalyzed: number,
 *   dominantKeywords: { keyword: string, frequency: number, sectors: string[] }[],
 *   coveredSectors: { sector: string, articleCount: number, growthTrend: string }[],
 *   acceptanceRate: number,
 *   lastCalibrationQuality: number,
 *   editorialSpirit: string,
 *   strongestAngles?: string[],
 *   weakSignals?: string[],
 *   contentGaps?: string[],
 *   recommendations?: string[],
 *   rejectionReasons: Record<string, number>
 * }} EditorialProfile
 * @typedef {{
 *   id: number,
 *   text: string,
 *   type: string
 * }} ToastItem
 * @typedef {{
 *   name: string,
 *   email: string,
 *   avatar: string,
 *   isNew: boolean
 * }} UserProfile
 */

/* Config */
export const API_BASE = 'http://localhost:8080/api/pipeline';
const API_KEY = import.meta.env.VITE_ADMIN_KEY ?? '';

/* App mode */
export const appMode = writable(/** @type {'landing' | 'admin' | 'user'} */ ('landing'));

/* Theme */
const _savedDark = localStorage.getItem('dark');
if (_savedDark === 'false') localStorage.removeItem('dark');
export const dark = writable(_savedDark === 'true');
export const toggleTheme = () => dark.update((d) => {
  const next = !d;
  localStorage.setItem('dark', String(next));
  return next;
});

/* Helpers */
/**
 * @param {string} email
 * @param {string} suffix
 */
function ukey(email, suffix) {
  return `bca_${email.trim().toLowerCase()}_${suffix}`;
}

/** @param {string} password */
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (Math.imul(31, hash) + password.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

/* Per-user stores */
export const rejectedIds = writable(/** @type {number[]} */ ([]));
export const interestedBlogs = writable(/** @type {BlogItem[]} */ ([]));
export const bookmarks = writable(/** @type {number[]} */ ([]));
export const scheduledPosts = writable(/** @type {BlogItem[]} */ ([]));
export const recentSearches = writable(/** @type {string[]} */ ([]));
export const activityLog = writable(/** @type {{ icon: string, text: string, sub: string, time: number }[]} */ ([]));
export const publishTime = writable('02:00');
export const timezone = writable('Asia/Kolkata');
export const autoPublish = writable(true);
export const bilingual = writable(false);
export const emailNotif = writable(true);

/** @type {string | null} */
let _currentEmail = null;

/**
 * @param {{ subscribe: Function }} store
 * @param {string} suffix
 */
function persist(store, suffix) {
  store.subscribe((/** @type {any} */ value) => {
    if (_currentEmail) localStorage.setItem(ukey(_currentEmail, suffix), JSON.stringify(value));
  });
}

persist(rejectedIds, 'rejected');
persist(interestedBlogs, 'interested');
persist(bookmarks, 'bookmarks');
persist(scheduledPosts, 'posts');
persist(recentSearches, 'recent');

/**
 * @param {string} icon
 * @param {string} text
 * @param {string} [sub]
 */
function logActivity(icon, text, sub = '') {
  activityLog.update(log => {
    const filtered = log.filter(e => !(e.icon === icon && e.text === text));
    return [{ icon, text, sub, time: Date.now() }, ...filtered].slice(0, 20);
  });
}

publishTime.subscribe((v) => { if (_currentEmail) localStorage.setItem(ukey(_currentEmail, 'time'), v); });
timezone.subscribe((v) => { if (_currentEmail) localStorage.setItem(ukey(_currentEmail, 'tz'), v); });
autoPublish.subscribe((v) => { if (_currentEmail) localStorage.setItem(ukey(_currentEmail, 'autopublish'), String(v)); });
bilingual.subscribe((v) => { if (_currentEmail) localStorage.setItem(ukey(_currentEmail, 'bilingual'), String(v)); });
emailNotif.subscribe((v) => { if (_currentEmail) localStorage.setItem(ukey(_currentEmail, 'emailnotif'), String(v)); });

/** @param {string} email */
function loadUserData(email) {
  const key = email.trim().toLowerCase();
  _currentEmail = key;
  rejectedIds.set(JSON.parse(localStorage.getItem(ukey(key, 'rejected')) || '[]'));
  interestedBlogs.set(JSON.parse(localStorage.getItem(ukey(key, 'interested')) || '[]'));
  bookmarks.set((JSON.parse(localStorage.getItem(ukey(key, 'bookmarks')) || '[]')).map(Number));
  scheduledPosts.set(JSON.parse(localStorage.getItem(ukey(key, 'posts')) || '[]'));
  recentSearches.set(JSON.parse(localStorage.getItem(ukey(key, 'recent')) || '[]'));
  publishTime.set(localStorage.getItem(ukey(key, 'time')) || '02:00');
  timezone.set(localStorage.getItem(ukey(key, 'tz')) || 'Asia/Kolkata');
  autoPublish.set(localStorage.getItem(ukey(key, 'autopublish')) !== 'false');
  bilingual.set(localStorage.getItem(ukey(key, 'bilingual')) === 'true');
  emailNotif.set(localStorage.getItem(ukey(key, 'emailnotif')) !== 'false');
  activityLog.set([]);
}

function clearUserData() {
  _currentEmail = null;
  rejectedIds.set([]);
  interestedBlogs.set([]);
  bookmarks.set([]);
  scheduledPosts.set([]);
  recentSearches.set([]);
  activityLog.set([]);
  publishTime.set('02:00');
  timezone.set('Asia/Kolkata');
  autoPublish.set(true);
  bilingual.set(false);
  emailNotif.set(true);
}

/* User auth */
const storedUser = JSON.parse(localStorage.getItem('bca_user') || 'null');
export const user = writable(/** @type {UserProfile | null} */ (storedUser));
export const userAuthed = writable(!!storedUser);

if (storedUser?.email) loadUserData(storedUser.email);

/**
 * @param {string} email
 * @param {string} password
 */
export function login(email, password) {
  const stored = JSON.parse(localStorage.getItem('bca_accounts') || '{}');
  const key = email.trim().toLowerCase();
  const account = stored[key] ?? Object.values(stored).find(a => (a.email ?? '').toLowerCase() === key);
  if (!account || account.passwordHash !== hashPassword(password)) return { ok: false, error: 'Invalid email or password.' };

  const u = { name: account.name, email: account.email, avatar: '🧑', isNew: false };
  localStorage.setItem('bca_user', JSON.stringify(u));
  user.set(u);
  userAuthed.set(true);
  loadUserData(u.email);
  currentPage.set('home');
  return { ok: true };
}

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export function signup(name, email, password) {
  const stored = JSON.parse(localStorage.getItem('bca_accounts') || '{}');
  const key = email.trim().toLowerCase();
  if (stored[key]) return { ok: false, error: 'An account with this email already exists.' };

  stored[key] = { name, email: key, passwordHash: hashPassword(password) };
  localStorage.setItem('bca_accounts', JSON.stringify(stored));

  const u = { name, email: key, avatar: '🧑', isNew: true };
  localStorage.setItem('bca_user', JSON.stringify(u));
  user.set(u);
  userAuthed.set(true);
  loadUserData(u.email);
  currentPage.set('home');
  return { ok: true };
}

export function logout() {
  localStorage.removeItem('bca_user');
  user.set(null);
  userAuthed.set(false);
  clearUserData();
  currentPage.set('home');
  appMode.set('landing');
}

/**
 * @param {string} name
 * @param {string} email
 */
export function updateUser(name, email) {
  user.update((u) => {
    if (!u) return u;
    const updated = { ...u, name, email };
    localStorage.setItem('bca_user', JSON.stringify(updated));
    return updated;
  });
  showToast('Profile saved', 'success');
}

/* Navigation */
export const currentPage = writable(/** @type {'home' | 'discover' | 'dashboard' | 'interested' | 'rejected' | 'scheduled' | 'published' | 'preview' | 'settings'} */ ('home'));

/* Toasts */
export const toasts = writable(/** @type {ToastItem[]} */ ([]));
let _toastId = 0;
/**
 * @param {string} text
 * @param {string} [type]
 * @param {number} [duration]
 */
export function showToast(text, type = 'success', duration = 3000) {
  const id = ++_toastId;
  toasts.update((ts) => [...ts, { id, text, type }]);
  setTimeout(() => toasts.update((ts) => ts.filter((t) => t.id !== id)), duration);
}

/* Notifications */
export const notifications = writable([
  { id: 1, text: 'Pipeline run completed successfully', time: '2 min ago', read: false },
  { id: 2, text: 'New blogs discovered: 12 articles', time: '1 hr ago', read: false },
]);
export const unreadCount = derived(notifications, ($n) => $n.filter((n) => !n.read).length);
export function markAllRead() {
  notifications.update((ns) => ns.map((n) => ({ ...n, read: true })));
}

/* Search & discovery */
export const searchQuery = writable('');
export const selectedBlogId = writable(/** @type {number | null} */ (null));
export const selectedBlog = writable(/** @type {any | null} */ (null));
export const articleFrom = writable(/** @type {string} */ ('discover'));

/** @param {string} term */
export function addRecentSearch(term) {
  recentSearches.update((rs) => [term, ...rs.filter((r) => r !== term)].slice(0, 8));
  logActivity('🔍', `Searched for "${term}"`, 'Search');
}

/* Curation actions */
/** @param {number} id */
export function rejectBlog(id) {
  let title = '';
  interestedBlogs.update((bs) => { title = bs.find(b => b.id === id)?.title || ''; return bs.filter((b) => b.id !== id); });
  rejectedIds.update((ids) => [...ids, id]);
  logActivity('👎', `Not interested${title ? ': ' + title : ''}`, 'Discover');
  showToast('Marked as not interested', 'info');
}

/** @param {BlogItem} blog */
export function interestBlog(blog) {
  rejectedIds.update((ids) => ids.filter((id) => id !== blog.id));
  interestedBlogs.update((bs) => (bs.some((b) => b.id === blog.id) ? bs : [...bs, blog]));
  logActivity('👍', `Interested: ${blog.title}`, 'Discover');
  showToast('Added to interested', 'success');
}

/** @param {number} id */
export function toggleBookmark(id) {
  const numId = Number(id);
  let added = false;
  bookmarks.update((bs) => {
    added = !bs.includes(numId);
    return added ? [...bs, numId] : bs.filter((b) => b !== numId);
  });
  logActivity('🔖', added ? 'Article bookmarked' : 'Bookmark removed', 'Discover');
  showToast(added ? 'Bookmarked' : 'Bookmark removed', 'success');
}

/* Publish / schedule */
/** @param {BlogItem} post */
export function schedulePost(post) {
  scheduledPosts.update((ps) => [...ps, post]);
  logActivity('📅', `Scheduled: ${post.title}`, 'Scheduled');
  showToast('Blog scheduled successfully', 'success');
}

/* Pipeline stats */
export const pipelineStats = derived(
  [scheduledPosts, interestedBlogs, rejectedIds, bookmarks],
  ([$posts, $interested, $rejected, $bk]) => ({
    scheduled: $posts.filter((p) => p.status === 'scheduled').length,
    published: $posts.filter((p) => p.status === 'published').length,
    interested: $interested.length,
    rejected: $rejected.length,
    bookmarked: $bk.length,
    total: $posts.length,
  })
);

export const weeklyActivity = derived(scheduledPosts, ($posts) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  /** @type {number[]} */
  const counts = Array(7).fill(0);

  $posts.forEach((p) => {
    if (!p.scheduledAt) return;
    const d = new Date(p.scheduledAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      const idx = (d.getDay() + 6) % 7;
      counts[idx]++;
    }
  });

  return days.map((day, i) => ({ day, count: counts[i] }));
});

/* Admin auth */
export const adminKey = writable(localStorage.getItem('admin_key') || '');
export const isLoggedIn = writable(!!localStorage.getItem('admin_key'));
export const loginError = writable('');
export const loginLoading = writable(false);

/**
 * @param {string} a
 * @param {string} b
 */
function timingSafeEqual(a, b) {
  let mismatch = a.length !== b.length ? 1 : 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
  }
  return mismatch === 0;
}

/** @param {string} key */
export function adminLogin(key) {
  loginError.set('');
  if (timingSafeEqual(key, API_KEY)) {
    localStorage.setItem('admin_key', key);
    adminKey.set(key);
    isLoggedIn.set(true);
    currentAdminPage.set('dashboard');
  } else {
    loginError.set('Invalid API key. Please try again.');
  }
}

export function adminLogout() {
  localStorage.removeItem('admin_key');
  adminKey.set('');
  isLoggedIn.set(false);
  currentAdminPage.set('login');
  appMode.set('landing');
}

/* Admin navigation */
export const currentAdminPage = writable(
  localStorage.getItem('admin_key') ? 'dashboard' : 'login'
);

/* Public reader pages */
export const currentPublicPage = writable('home');
export const selectedArticle = writable(null);
export const publicThemeFilter = writable('All');

/* Pipeline status */
export const pipelineStatus = writable(/** @type {PipelineStatus | null} */ (null));
export const pipelineLoading = writable(false);
export const pipelineFlag = derived(pipelineStatus, ($s) => $s?.flag ?? 'ON');

/** @returns {PipelineStatus} */
function createDefaultPipelineStatus() {
  return /** @type {PipelineStatus} */ ({
    flag: /** @type {PipelineFlag} */ ('ON'),
    status: /** @type {import('./store.js').PipelineState} */ ('IDLE'),
    lastRun: null,
    nextRun: null,
    published: 0,
    failed: 0,
  });
}

export function fetchStatus() {
  pipelineStatus.set(createDefaultPipelineStatus());
}

/** @param {PipelineFlag} flag */
export function setFlag(flag) {
  pipelineStatus.update((s) => (s ? { ...s, flag } : { ...createDefaultPipelineStatus(), flag }));
}

export function setPipelineFlag(/** @type {PipelineFlag} */ flag) {
  setFlag(flag);
}

export function triggerRun() {
  pipelineStatus.update((s) => (s ? { ...s, status: 'RUNNING' } : { ...createDefaultPipelineStatus(), status: 'RUNNING' }));
}

/* Run history */
export const runHistory = writable(/** @type {RunRecord[]} */ ([]));
export const runsLoading = writable(false);

function createMockRuns() {
  return [
    { id: 15, startedAt: '2026-05-28 09:00:00', completedAt: '2026-05-28 09:12:30', discovered: 127, scored: 98, rejected: 32, published: 15, status: 'Complete' },
    { id: 14, startedAt: '2026-05-27 09:00:00', completedAt: '2026-05-27 09:14:45', discovered: 134, scored: 104, rejected: 28, published: 18, status: 'Complete' },
    { id: 13, startedAt: '2026-05-26 09:00:00', completedAt: '2026-05-26 09:11:20', discovered: 119, scored: 92, rejected: 35, published: 12, status: 'Complete' },
    { id: 12, startedAt: '2026-05-25 09:00:00', completedAt: '2026-05-25 09:13:15', discovered: 141, scored: 108, rejected: 29, published: 19, status: 'Complete' },
    { id: 11, startedAt: '2026-05-24 09:00:00', completedAt: '2026-05-24 09:12:00', discovered: 125, scored: 99, rejected: 31, published: 16, status: 'Complete' },
    { id: 10, startedAt: '2026-05-23 09:00:00', completedAt: '2026-05-23 09:15:30', discovered: 138, scored: 106, rejected: 27, published: 20, status: 'Complete' },
    { id: 9, startedAt: '2026-05-22 09:00:00', completedAt: '2026-05-22 09:10:45', discovered: 115, scored: 88, rejected: 38, published: 10, status: 'Complete' },
    { id: 8, startedAt: '2026-05-21 09:00:00', completedAt: '2026-05-21 09:13:20', discovered: 130, scored: 101, rejected: 33, published: 17, status: 'Complete' },
  ];
}

export function fetchRuns() {
  runHistory.set(createMockRuns());
}

/* Admin articles */
export const articles = writable(/** @type {BlogItem[]} */ ([]));
export const articlesLoading = writable(false);
export const articleThemeFilter = writable('');
export const articleStatusFilter = writable('');

export function fetchArticles(themeId = '') {
  /** @type {BlogItem[]} */
  const all = [
    { id: 1, title: 'AI Startup Raises $50M for Autonomous Logistics Platform', theme: 'ai-research', relevanceScore: 9.2, innovationScore: 8.8, featured: true, status: 'published', publishedAt: '2025-01-15', imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=210&fit=crop', summary: 'A well-funded AI startup is deploying autonomous logistics systems across European warehouses.' },
    { id: 2, title: 'New Solar Panel Efficiency Record Set by MIT Lab', theme: 'sustainability', relevanceScore: 8.1, innovationScore: 7.4, featured: false, status: 'published', publishedAt: '2025-01-15', imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=210&fit=crop', summary: 'MIT researchers have achieved a 47.6% efficiency rate in perovskite-silicon tandem solar cells.' },
    { id: 3, title: 'Mistral AI Releases Mixtral 8x22B Under Apache 2.0', theme: 'ai-research', relevanceScore: 9.6, innovationScore: 9.8, featured: true, status: 'published', publishedAt: '2025-01-15', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=210&fit=crop', summary: 'Mistral AI has released its largest open-weight model under a permissive licence.' },
    { id: 4, title: 'Four-Day Work Week Trial Shows 92% Staff Retention', theme: 'future-of-work', relevanceScore: 8.1, innovationScore: 7.4, featured: false, status: 'published', publishedAt: '2025-01-14', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=210&fit=crop', summary: 'A 12-month longitudinal study across 61 UK companies confirms productivity maintained.' },
    { id: 5, title: 'Green Hydrogen Economics Reach Parity in Three EU Markets', theme: 'sustainability', relevanceScore: 8.7, innovationScore: 8.3, featured: false, status: 'published', publishedAt: '2025-01-14', imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899a9bd6b2?w=400&h=210&fit=crop', summary: 'Electrolyser cost reductions push green hydrogen to cost parity with grey hydrogen.' },
  ];
  articles.set(themeId ? all.filter((a) => a.theme === themeId) : all);
}

/* Admin themes */
export const adminThemes = writable(/** @type {Theme[]} */ ([]));
export const themesLoading = writable(false);
export const calibratingId = writable(/** @type {string | null} */ (null));

export function fetchThemes() {
  adminThemes.set([
    { id: 'tech-innovation', name: 'tech-innovation', lastCalibrated: '2025-01-13', keywords: ['AI', 'robotics', 'semiconductor', 'quantum'] },
    { id: 'startup-funding', name: 'startup-funding', lastCalibrated: '2025-01-13', keywords: ['Series A', 'venture capital', 'ARR', 'founder'] },
    { id: 'ai-research', name: 'ai-research', lastCalibrated: '2025-01-13', keywords: ['LLM', 'neural network', 'benchmark', 'open-source'] },
    { id: 'sustainability', name: 'sustainability', lastCalibrated: '2025-01-13', keywords: ['hydrogen', 'solar', 'EV', 'carbon capture'] },
    { id: 'future-of-work', name: 'future-of-work', lastCalibrated: '2025-01-13', keywords: ['remote work', 'productivity', 'HR', 'automation'] },
  ]);
}

/** @param {string} themeId */
export async function calibrateTheme(themeId) {
  calibratingId.set(themeId);
  await new Promise((r) => setTimeout(r, 1200));
  adminThemes.update((ts) => ts.map((t) => (
    t.id === themeId ? { ...t, lastCalibrated: new Date().toISOString().slice(0, 10) } : t
  )));
  calibratingId.set(null);
}

/* Editorial profiles */
export const editorialProfiles = writable(/** @type {EditorialProfile[]} */ ([]));
export const profilesLoading = writable(false);
export const regeneratingProfile = writable(/** @type {string | null} */ (null));

export function fetchEditorialProfiles() {
  import('../data/editorialProfiles.js').then((m) => {
    editorialProfiles.set(/** @type {EditorialProfile[]} */ (/** @type {unknown} */ (m.mockEditorialProfiles)));
  });
}

/**
 * @param {string} profileId
 * @param {string} themeName
 */
export async function regenerateProfile(profileId, themeName) {
  regeneratingProfile.set(profileId);
  await new Promise((r) => setTimeout(r, 1500));
  editorialProfiles.update((profiles) => profiles.map((p) => (
    p.id === profileId
      ? {
          ...p,
          generatedAt: new Date().toISOString(),
          lastCalibrationQuality: Math.random() * 0.15 + 0.8,
        }
      : p
  )));
  regeneratingProfile.set(null);
  showToast(`Editorial profile regenerated for ${themeName}`, 'success');
}

/* Public reader articles */
export const publicArticles = writable(/** @type {BlogItem[]} */ ([]));

export function fetchPublicArticles() {
  publicArticles.set([
    { id: 1, title: 'AI Startup Raises $50M for Autonomous Logistics Platform', theme: 'AI Research', relevanceScore: 9.2, innovationScore: 8.8, featured: true, publishedAt: '2025-01-15', imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=420&fit=crop', summary: 'A well-funded AI startup is deploying autonomous logistics systems across European warehouses, combining computer vision with reinforcement learning to cut operational costs by 34%.', sourceUrl: '#' },
    { id: 2, title: 'New Solar Panel Efficiency Record Set by MIT Lab', theme: 'Sustainability', relevanceScore: 8.1, innovationScore: 7.4, featured: false, publishedAt: '2025-01-15', imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=420&fit=crop', summary: 'MIT researchers have achieved a 47.6% efficiency rate in perovskite-silicon tandem solar cells under standard test conditions, surpassing the previous record by 2.1 percentage points.', sourceUrl: '#' },
    { id: 3, title: 'Mistral AI Releases Mixtral 8x22B Under Apache 2.0', theme: 'AI Research', relevanceScore: 9.6, innovationScore: 9.8, featured: true, publishedAt: '2025-01-15', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=420&fit=crop', summary: 'Mistral AI has released Mixtral 8x22B, a 141-billion-parameter mixture-of-experts model, under the permissive Apache 2.0 licence.', sourceUrl: '#' },
    { id: 4, title: 'Four-Day Work Week Trial Shows 92% Staff Retention', theme: 'Future of Work', relevanceScore: 8.1, innovationScore: 7.4, featured: false, publishedAt: '2025-01-14', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop', summary: 'A 12-month longitudinal study across 61 UK companies confirms that a permanent four-day work week maintains productivity while significantly improving retention.', sourceUrl: '#' },
    { id: 5, title: 'Green Hydrogen Economics Reach Parity in Three EU Markets', theme: 'Sustainability', relevanceScore: 8.7, innovationScore: 8.3, featured: false, publishedAt: '2025-01-14', imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899a9bd6b2?w=800&h=420&fit=crop', summary: 'Electrolyser cost reductions and cheap renewable electricity have pushed green hydrogen to cost parity with grey hydrogen in Germany, Spain, and Portugal.', sourceUrl: '#' },
    { id: 6, title: 'Stanford HAI: 78% of Fortune 500 Have AI Governance Function', theme: 'AI Research', relevanceScore: 7.8, innovationScore: 6.9, featured: false, publishedAt: '2025-01-13', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=420&fit=crop', summary: "Stanford HAI's 2025 Enterprise AI Index reveals that 78% of Fortune 500 companies now maintain a dedicated AI governance function.", sourceUrl: '#' },
    { id: 7, title: 'Zero Trust Architecture: Lessons from 50 Enterprise Migrations', theme: 'Tech Innovation', relevanceScore: 8.3, innovationScore: 7.1, featured: false, publishedAt: '2025-01-13', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=420&fit=crop', summary: 'A survey of 50 enterprises that have completed zero trust migrations reveals the common failure points and success factors.', sourceUrl: '#' },
    { id: 8, title: 'Startup Funding in 2025: AI Captures 42% of Global VC', theme: 'Startup Funding', relevanceScore: 8.9, innovationScore: 7.6, featured: false, publishedAt: '2025-01-12', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=420&fit=crop', summary: 'AI startups captured 42% of all global venture funding in Q1 2025, while fintech and consumer apps saw continued contraction.', sourceUrl: '#' },
  ]);
}

export const publicThemes = derived(publicArticles, ($a) => ['All', ...new Set($a.map((a) => a.theme))]);
