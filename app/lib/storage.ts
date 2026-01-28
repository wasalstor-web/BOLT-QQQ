/*
 * ═══════════════════════════════════════════════════════════════════
 * نظام التخزين المحلي الشامل
 * ═══════════════════════════════════════════════════════════════════
 */

export const STORAGE_KEYS = {
  API_KEYS: 'bolt_api_keys',
  PREFERENCES: 'bolt_preferences',
  INTEGRATIONS: 'bolt_integrations',
  EDITOR_STATE: 'bolt_editor_state',
  CHAT_DRAFTS: 'bolt_chat_drafts',
  RECENT_PROJECTS: 'bolt_recent_projects',
} as const;

/*
 * ═══════════════════════════════════════════════════════════════════
 * الأنواع
 * ═══════════════════════════════════════════════════════════════════
 */

export interface ApiKeys {
  anthropic?: string;
  openai?: string;
  google?: string;
  groq?: string;
  openRouter?: string;
  deepseek?: string;
  mistral?: string;
  xai?: string;
  cloudflare?: string;
}

export interface Preferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  defaultModel: string;
  defaultProvider: string;
  autoSave: boolean;
  autoSaveInterval: number;
  notifications: boolean;
  soundEnabled: boolean;
  editorFontSize: number;
  editorFontFamily: string;
  editorTabSize: number;
  editorWordWrap: boolean;
  terminalFontSize: number;
  showMinimap: boolean;
  showLineNumbers: boolean;
  formatOnSave: boolean;
}

export interface IntegrationState {
  [key: string]: {
    isConnected: boolean;
    connectedAt?: string;
    username?: string;
    data?: Record<string, unknown>;
  };
}

export interface EditorState {
  openTabs: string[];
  activeTab: string | null;
  sidebarCollapsed: boolean;
  panelSizes: {
    sidebar?: number;
    chat?: number;
    editor?: number;
    preview?: number;
  };
  terminalHeight: number;
  showTerminal: boolean;
  showPreview: boolean;
}

export interface RecentProject {
  id: string;
  name: string;
  lastOpened: string;
  thumbnail?: string;
}

/*
 * ═══════════════════════════════════════════════════════════════════
 * الدوال الأساسية
 * ═══════════════════════════════════════════════════════════════════
 */

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return defaultValue;
    }

    const parsed = JSON.parse(stored);

    if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
      return { ...defaultValue, ...parsed };
    }

    return parsed;
  } catch {
    console.warn(`Failed to load ${key} from localStorage`);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) }));

    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(key);
}

/*
 * ═══════════════════════════════════════════════════════════════════
 * القيم الافتراضية
 * ═══════════════════════════════════════════════════════════════════
 */

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  language: 'ar',
  defaultModel: 'claude-3-5-sonnet-latest',
  defaultProvider: 'Anthropic',
  autoSave: true,
  autoSaveInterval: 30,
  notifications: true,
  soundEnabled: false,
  editorFontSize: 14,
  editorFontFamily: 'JetBrains Mono, Fira Code, monospace',
  editorTabSize: 2,
  editorWordWrap: true,
  terminalFontSize: 13,
  showMinimap: false,
  showLineNumbers: true,
  formatOnSave: true,
};

export const DEFAULT_EDITOR_STATE: EditorState = {
  openTabs: [],
  activeTab: null,
  sidebarCollapsed: false,
  panelSizes: {
    sidebar: 250,
    chat: 400,
    editor: 50,
    preview: 50,
  },
  terminalHeight: 200,
  showTerminal: true,
  showPreview: true,
};

/*
 * ═══════════════════════════════════════════════════════════════════
 * API المبسط
 * ═══════════════════════════════════════════════════════════════════
 */

export const storage = {
  // API Keys
  getApiKeys: (): ApiKeys => loadFromStorage(STORAGE_KEYS.API_KEYS, {}),
  setApiKeys: (keys: ApiKeys): boolean => saveToStorage(STORAGE_KEYS.API_KEYS, keys),
  setApiKey: (provider: keyof ApiKeys, key: string): boolean => {
    const current = storage.getApiKeys();
    return storage.setApiKeys({ ...current, [provider]: key });
  },
  removeApiKey: (provider: keyof ApiKeys): boolean => {
    const current = storage.getApiKeys();
    delete current[provider];

    return storage.setApiKeys(current);
  },

  // Preferences
  getPreferences: (): Preferences => loadFromStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES),
  setPreferences: (prefs: Partial<Preferences>): boolean => {
    const current = storage.getPreferences();
    return saveToStorage(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
  },
  resetPreferences: (): boolean => saveToStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES),

  // Integrations
  getIntegrations: (): IntegrationState => loadFromStorage(STORAGE_KEYS.INTEGRATIONS, {}),
  setIntegrations: (state: IntegrationState): boolean => saveToStorage(STORAGE_KEYS.INTEGRATIONS, state),
  setIntegration: (id: string, data: IntegrationState[string]): boolean => {
    const current = storage.getIntegrations();
    return storage.setIntegrations({ ...current, [id]: data });
  },
  removeIntegration: (id: string): boolean => {
    const current = storage.getIntegrations();
    delete current[id];

    return storage.setIntegrations(current);
  },

  // Editor State
  getEditorState: (): EditorState => loadFromStorage(STORAGE_KEYS.EDITOR_STATE, DEFAULT_EDITOR_STATE),
  setEditorState: (state: Partial<EditorState>): boolean => {
    const current = storage.getEditorState();
    return saveToStorage(STORAGE_KEYS.EDITOR_STATE, { ...current, ...state });
  },

  // Chat Drafts
  getChatDraft: (projectId: string): string => {
    const drafts = loadFromStorage<Record<string, string>>(STORAGE_KEYS.CHAT_DRAFTS, {});
    return drafts[projectId] || '';
  },
  setChatDraft: (projectId: string, draft: string): boolean => {
    const drafts = loadFromStorage<Record<string, string>>(STORAGE_KEYS.CHAT_DRAFTS, {});
    drafts[projectId] = draft;

    return saveToStorage(STORAGE_KEYS.CHAT_DRAFTS, drafts);
  },
  clearChatDraft: (projectId: string): boolean => {
    const drafts = loadFromStorage<Record<string, string>>(STORAGE_KEYS.CHAT_DRAFTS, {});
    delete drafts[projectId];

    return saveToStorage(STORAGE_KEYS.CHAT_DRAFTS, drafts);
  },

  // Recent Projects
  getRecentProjects: (): RecentProject[] => loadFromStorage(STORAGE_KEYS.RECENT_PROJECTS, []),
  addRecentProject: (project: RecentProject): boolean => {
    const projects = storage.getRecentProjects().filter((p) => p.id !== project.id);
    projects.unshift({ ...project, lastOpened: new Date().toISOString() });

    return saveToStorage(STORAGE_KEYS.RECENT_PROJECTS, projects.slice(0, 10));
  },

  // Clear all
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => removeFromStorage(key));
  },
};

/*
 * ═══════════════════════════════════════════════════════════════════
 * Hook للاستماع للتغييرات
 * ═══════════════════════════════════════════════════════════════════
 */

export function useStorageListener<T>(key: string, callback: (value: T) => void) {
  if (typeof window === 'undefined') {
    return;
  }

  const handler = (event: StorageEvent) => {
    if (event.key === key && event.newValue) {
      try {
        callback(JSON.parse(event.newValue));
      } catch {
        // ignore parse errors
      }
    }
  };

  window.addEventListener('storage', handler);

  return () => window.removeEventListener('storage', handler);
}
