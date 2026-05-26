import { writable, derived } from 'svelte/store';

// ── Config ──────────────────────────────────────
export const API_BASE = 'http://localhost:8080/api/pipeline';
const API_KEY = import.meta.env.VITE_ADMIN_KEY ?? '';

// ── App Mode: 'landing' | 'admin' | 'user' ──────
export const appMode = writable('landing');

// ── Theme ────────────────────────────────────────
const _savedDark = localStorage.getItem('dark');
// Clear stale 'false' string written by old code — treat as no preference
if (_savedDark === 'false') localStorage.removeItem('dark');
export const dark = writable(_savedDark === 'true');
export const toggleTheme = () => dark.update(d => {
  const next = !d;
  localStorage.setItem('dark', next);
  return next;
});

// ── User Auth ────────────────────────────────────
const storedUser = JSON.parse(localStorage.getItem('bca_user') || 'null');
export const user       = writable(storedUser);
export const userAuthed = writable(!!storedUser);

export function login(email, password) {
  const u = { name: email.split('@')[0], email, avatar: '🧑', isNew: false };
  localStorage.setItem('bca_user', JSON.stringify(u));
  user.set(u); userAuthed.set(true); currentPage.set('home');
  return { ok: true };
}
export function signup(name, email, password) {
  const u = { name, email, avatar: '🧑', isNew: true };
  localStorage.setItem('bca_user', JSON.stringify(u));
  user.set(u); userAuthed.set(true); currentPage.set('home');
  return { ok: true };
}
export function logout() {
  localStorage.removeItem('bca_user');
  user.set(null); userAuthed.set(false);
  currentPage.set('home'); appMode.set('landing');
}
export function updateUser(name, email) {
  user.update(u => {
    const updated = { ...u, name, email };
    localStorage.setItem('bca_user', JSON.stringify(updated));
    return updated;
  });
  showToast('Profile saved', 'success');
}

// ── User Navigation ──────────────────────────────
export const currentPage = writable('home');

// ── Toast ───────────────────────────────────────
export const toasts = writable([]);
let _toastId = 0;
export function showToast(text, type = 'success', duration = 3000) {
  const id = ++_toastId;
  toasts.update(ts => [...ts, { id, text, type }]);
  setTimeout(() => toasts.update(ts => ts.filter(t => t.id !== id)), duration);
}

// ── Notifications ────────────────────────────────
export const notifications = writable([
  { id: 1, text: 'Pipeline run completed successfully', time: '2 min ago', read: false },
  { id: 2, text: 'New blogs discovered: 12 articles',   time: '1 hr ago',  read: false },
]);
export const unreadCount = derived(notifications, $n => $n.filter(n => !n.read).length);
export function markAllRead() {
  notifications.update(ns => ns.map(n => ({ ...n, read: true })));
}

// ── Search & Discovery ────────────────────────────
export const searchQuery    = writable('');
export const recentSearches = writable(JSON.parse(localStorage.getItem('bca_recent') || '[]'));
export function addRecentSearch(term) {
  recentSearches.update(rs => {
    const updated = [term, ...rs.filter(r => r !== term)].slice(0, 8);
    localStorage.setItem('bca_recent', JSON.stringify(updated));
    return updated;
  });
}

export const selectedBlogId = writable(null);

// Persist rejected/interested/bookmarks per user session
export const rejectedIds = writable(
  JSON.parse(localStorage.getItem('bca_rejected') || '[]')
);
rejectedIds.subscribe(v => localStorage.setItem('bca_rejected', JSON.stringify(v)));

export const interestedBlogs = writable(
  JSON.parse(localStorage.getItem('bca_interested') || '[]')
);
interestedBlogs.subscribe(v => localStorage.setItem('bca_interested', JSON.stringify(v)));

export const bookmarks = writable(
  JSON.parse(localStorage.getItem('bca_bookmarks') || '[]')
);
bookmarks.subscribe(v => localStorage.setItem('bca_bookmarks', JSON.stringify(v)));

export function rejectBlog(id) {
  rejectedIds.update(ids => [...ids, id]);
  interestedBlogs.update(bs => bs.filter(b => b.id !== id));
  showToast('Marked as not interested', 'info');
}
export function interestBlog(blog) {
  rejectedIds.update(ids => ids.filter(id => id !== blog.id));
  interestedBlogs.update(bs => bs.find(b => b.id === blog.id) ? bs : [...bs, blog]);
  showToast('Added to interested', 'success');
}
export function toggleBookmark(id) {
  let added;
  bookmarks.update(bs => {
    added = !bs.includes(id);
    return added ? [...bs, id] : bs.filter(b => b !== id);
  });
  showToast(added ? 'Bookmarked' : 'Bookmark removed', 'success');
}

// ── Publish / Schedule ────────────────────────────
export const scheduledPosts = writable(
  JSON.parse(localStorage.getItem('bca_posts') || '[]')
);
scheduledPosts.subscribe(v => localStorage.setItem('bca_posts', JSON.stringify(v)));

export const publishTime = writable(localStorage.getItem('bca_time') || '02:00');
export const timezone    = writable(localStorage.getItem('bca_tz')   || 'Asia/Kolkata');
export const autoPublish = writable(localStorage.getItem('bca_autopublish') !== 'false');
export const bilingual   = writable(localStorage.getItem('bca_bilingual') === 'true');
export const emailNotif  = writable(localStorage.getItem('bca_emailnotif') !== 'false');

publishTime.subscribe(v => localStorage.setItem('bca_time', v));
timezone.subscribe(v    => localStorage.setItem('bca_tz', v));
autoPublish.subscribe(v => localStorage.setItem('bca_autopublish', v));
bilingual.subscribe(v   => localStorage.setItem('bca_bilingual', v));
emailNotif.subscribe(v  => localStorage.setItem('bca_emailnotif', v));

export function schedulePost(post) {
  scheduledPosts.update(ps => [...ps, post]);
  showToast('Blog scheduled successfully', 'success');
}

// ── Curation pipeline stats (derived from real user actions) ──
export const pipelineStats = derived(
  [scheduledPosts, interestedBlogs, rejectedIds, bookmarks],
  ([$posts, $interested, $rejected, $bk]) => ({
    scheduled:  $posts.filter(p => p.status === 'scheduled').length,
    published:  $posts.filter(p => p.status === 'published').length,
    interested: $interested.length,
    rejected:   $rejected.length,
    bookmarked: $bk.length,
    total:      $posts.length,
  })
);

// Weekly curation activity — built from real scheduledPosts timestamps
export const weeklyActivity = derived(scheduledPosts, $posts => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const counts = Array(7).fill(0);
  const now = new Date();
  $posts.forEach(p => {
    const d = new Date(p.scheduledAt);
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      const idx = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
      counts[idx]++;
    }
  });
  return days.map((day, i) => ({ day, count: counts[i] }));
});

// Stage runs — empty until a real pipeline run populates them
export const stageRuns  = writable([]);
// Theme stats — empty until a real pipeline run populates them
export const themeStats = writable([]);

// ── Admin Auth ────────────────────────────────────
export const adminKey     = writable(localStorage.getItem('admin_key') || '');
export const isLoggedIn   = writable(!!localStorage.getItem('admin_key'));
export const loginError   = writable('');
export const loginLoading = writable(false);

function timingSafeEqual(a, b) {
  let mismatch = a.length !== b.length ? 1 : 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
  }
  return mismatch === 0;
}

export function adminLogin(key) {
  loginError.set('');
  if (timingSafeEqual(key, API_KEY)) {
    localStorage.setItem('admin_key', key);
    adminKey.set(key); isLoggedIn.set(true);
    currentAdminPage.set('dashboard');
  } else {
    loginError.set('Invalid API key. Please try again.');
  }
}
export function adminLogout() {
  localStorage.removeItem('admin_key');
  adminKey.set(''); isLoggedIn.set(false);
  currentAdminPage.set('login'); appMode.set('landing');
}

// ── Admin Navigation ──────────────────────────────
export const currentAdminPage = writable(
  localStorage.getItem('admin_key') ? 'dashboard' : 'login'
);

// ── Public reader pages ───────────────────────────
export const currentPublicPage = writable('home');
export const selectedArticle   = writable(null);
export const publicThemeFilter = writable('All');

// ── Pipeline Status (admin) ───────────────────────
export const pipelineStatus  = writable(null);
export const pipelineLoading = writable(false);
export const pipelineFlag    = derived(pipelineStatus, $s => $s?.flag ?? 'ON');

export function fetchStatus() {
  pipelineStatus.set({
    flag: 'ON', status: 'IDLE',
    lastRun: null, nextRun: null,
    published: 0, failed: 0,
  });
}
export function setFlag(flag) {
  pipelineStatus.update(s => s ? { ...s, flag } : { flag });
}
export function setPipelineFlag(flag) { setFlag(flag); }
export function triggerRun() {
  pipelineStatus.update(s => s ? { ...s, status: 'RUNNING' } : { status: 'RUNNING' });
}

// ── Run History ───────────────────────────────────
export const runHistory  = writable([]);
export const runsLoading = writable(false);

export function fetchRuns() {
  // No hardcoded runs — empty until backend provides real data
  runHistory.set([]);
}

// ── Admin Articles ────────────────────────────────
export const articles            = writable([]);
export const articlesLoading     = writable(false);
export const articleThemeFilter  = writable('');
export const articleStatusFilter = writable('');

export function fetchArticles(themeId = '') {
  const all = [
    { id:1, title:'AI Startup Raises $50M for Autonomous Logistics Platform', theme:'ai-research', relevanceScore:9.2, innovationScore:8.8, featured:true,  status:'published', publishedAt:'2025-01-15', imageUrl:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=210&fit=crop', summary:'A well-funded AI startup is deploying autonomous logistics systems across European warehouses.' },
    { id:2, title:'New Solar Panel Efficiency Record Set by MIT Lab',          theme:'sustainability', relevanceScore:8.1, innovationScore:7.4, featured:false, status:'published', publishedAt:'2025-01-15', imageUrl:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=210&fit=crop', summary:'MIT researchers have achieved a 47.6% efficiency rate in perovskite-silicon tandem solar cells.' },
    { id:3, title:'Mistral AI Releases Mixtral 8x22B Under Apache 2.0',       theme:'ai-research', relevanceScore:9.6, innovationScore:9.8, featured:true,  status:'published', publishedAt:'2025-01-15', imageUrl:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=210&fit=crop', summary:'Mistral AI has released its largest open-weight model under a permissive licence.' },
    { id:4, title:'Four-Day Work Week Trial Shows 92% Staff Retention',        theme:'future-of-work', relevanceScore:8.1, innovationScore:7.4, featured:false, status:'published', publishedAt:'2025-01-14', imageUrl:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=210&fit=crop', summary:'A 12-month longitudinal study across 61 UK companies confirms productivity maintained.' },
    { id:5, title:'Green Hydrogen Economics Reach Parity in Three EU Markets',  theme:'sustainability', relevanceScore:8.7, innovationScore:8.3, featured:false, status:'published', publishedAt:'2025-01-14', imageUrl:'https://images.unsplash.com/photo-1497435334941-8c899a9bd6b2?w=400&h=210&fit=crop', summary:'Electrolyser cost reductions push green hydrogen to cost parity with grey hydrogen.' },
  ];
  articles.set(themeId ? all.filter(a => a.theme === themeId) : all);
}

// ── Admin Themes ──────────────────────────────────
export const adminThemes   = writable([]);
export const themesLoading = writable(false);
export const calibratingId = writable(null);

export function fetchThemes() {
  adminThemes.set([
    { id:'tech-innovation', name:'tech-innovation', lastCalibrated:'2025-01-13', keywords:['AI','robotics','semiconductor','quantum'] },
    { id:'startup-funding', name:'startup-funding', lastCalibrated:'2025-01-13', keywords:['Series A','venture capital','ARR','founder'] },
    { id:'ai-research',     name:'ai-research',     lastCalibrated:'2025-01-13', keywords:['LLM','neural network','benchmark','open-source'] },
    { id:'sustainability',  name:'sustainability',  lastCalibrated:'2025-01-13', keywords:['hydrogen','solar','EV','carbon capture'] },
    { id:'future-of-work',  name:'future-of-work',  lastCalibrated:'2025-01-13', keywords:['remote work','productivity','HR','automation'] },
  ]);
}
export async function calibrateTheme(themeId) {
  calibratingId.set(themeId);
  await new Promise(r => setTimeout(r, 1200));
  adminThemes.update(ts => ts.map(t =>
    t.id === themeId ? { ...t, lastCalibrated: new Date().toISOString().slice(0,10) } : t
  ));
  calibratingId.set(null);
}

// ── Public Reader Articles ────────────────────────
export const publicArticles = writable([]);
export function fetchPublicArticles() {
  publicArticles.set([
    { id:1, title:'AI Startup Raises $50M for Autonomous Logistics Platform', theme:'AI Research', relevanceScore:9.2, innovationScore:8.8, featured:true,  publishedAt:'2025-01-15', imageUrl:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=420&fit=crop', summary:'A well-funded AI startup is deploying autonomous logistics systems across European warehouses, combining computer vision with reinforcement learning to cut operational costs by 34%.', sourceUrl:'#' },
    { id:2, title:'New Solar Panel Efficiency Record Set by MIT Lab',          theme:'Sustainability', relevanceScore:8.1, innovationScore:7.4, featured:false, publishedAt:'2025-01-15', imageUrl:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=420&fit=crop', summary:'MIT researchers have achieved a 47.6% efficiency rate in perovskite-silicon tandem solar cells under standard test conditions, surpassing the previous record by 2.1 percentage points.', sourceUrl:'#' },
    { id:3, title:'Mistral AI Releases Mixtral 8x22B Under Apache 2.0',       theme:'AI Research', relevanceScore:9.6, innovationScore:9.8, featured:true,  publishedAt:'2025-01-15', imageUrl:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=420&fit=crop', summary:'Mistral AI has released Mixtral 8x22B, a 141-billion-parameter mixture-of-experts model, under the permissive Apache 2.0 licence.', sourceUrl:'#' },
    { id:4, title:'Four-Day Work Week Trial Shows 92% Staff Retention',        theme:'Future of Work', relevanceScore:8.1, innovationScore:7.4, featured:false, publishedAt:'2025-01-14', imageUrl:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop', summary:'A 12-month longitudinal study across 61 UK companies confirms that a permanent four-day work week maintains productivity while significantly improving retention.', sourceUrl:'#' },
    { id:5, title:'Green Hydrogen Economics Reach Parity in Three EU Markets',  theme:'Sustainability', relevanceScore:8.7, innovationScore:8.3, featured:false, publishedAt:'2025-01-14', imageUrl:'https://images.unsplash.com/photo-1497435334941-8c899a9bd6b2?w=800&h=420&fit=crop', summary:'Electrolyser cost reductions and cheap renewable electricity have pushed green hydrogen to cost parity with grey hydrogen in Germany, Spain, and Portugal.', sourceUrl:'#' },
    { id:6, title:'Stanford HAI: 78% of Fortune 500 Have AI Governance Function', theme:'AI Research', relevanceScore:7.8, innovationScore:6.9, featured:false, publishedAt:'2025-01-13', imageUrl:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=420&fit=crop', summary:"Stanford HAI's 2025 Enterprise AI Index reveals that 78% of Fortune 500 companies now maintain a dedicated AI governance function.", sourceUrl:'#' },
    { id:7, title:'Zero Trust Architecture: Lessons from 50 Enterprise Migrations', theme:'Tech Innovation', relevanceScore:8.3, innovationScore:7.1, featured:false, publishedAt:'2025-01-13', imageUrl:'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=420&fit=crop', summary:'A survey of 50 enterprises that have completed zero trust migrations reveals the common failure points and success factors.', sourceUrl:'#' },
    { id:8, title:'Startup Funding in 2025: AI Captures 42% of Global VC',     theme:'Startup Funding', relevanceScore:8.9, innovationScore:7.6, featured:false, publishedAt:'2025-01-12', imageUrl:'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=420&fit=crop', summary:'AI startups captured 42% of all global venture funding in Q1 2025, while fintech and consumer apps saw continued contraction.', sourceUrl:'#' },
  ]);
}
export const publicThemes = derived(publicArticles, $a =>
  ['All', ...new Set($a.map(a => a.theme))]
);
