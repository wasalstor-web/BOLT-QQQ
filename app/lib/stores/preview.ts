import { atom, computed } from 'nanostores';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface PreviewInfo {
  port: number;
  url: string;
  ready: boolean;
  title?: string;
  type?: 'dev' | 'build' | 'static';
}

export type PreviewStatus = 'idle' | 'starting' | 'running' | 'error';

// ═══════════════════════════════════════════════════════════════════
// Stores
// ═══════════════════════════════════════════════════════════════════

export const previewsStore = atom<PreviewInfo[]>([]);
export const activePreviewIndex = atom<number>(0);
export const previewStatus = atom<PreviewStatus>('idle');
export const previewError = atom<string | null>(null);

// ═══════════════════════════════════════════════════════════════════
// Computed
// ═══════════════════════════════════════════════════════════════════

export const activePreview = computed([previewsStore, activePreviewIndex], (previews, index) => previews[index] || null);

export const hasPreview = computed(previewsStore, (previews) => previews.length > 0 && previews.some((p) => p.ready));

export const previewCount = computed(previewsStore, (previews) => previews.length);

// ═══════════════════════════════════════════════════════════════════
// Actions
// ═══════════════════════════════════════════════════════════════════

export function addPreview(port: number, url: string, title?: string, type?: PreviewInfo['type']) {
  const current = previewsStore.get();
  const existingIndex = current.findIndex((p) => p.port === port);

  if (existingIndex >= 0) {
    const updated = [...current];
    updated[existingIndex] = { ...updated[existingIndex], url, ready: true, title, type };
    previewsStore.set(updated);
  } else {
    previewsStore.set([...current, { port, url, ready: true, title, type }]);
    activePreviewIndex.set(current.length);
  }

  previewStatus.set('running');
  previewError.set(null);
}

export function removePreview(port: number) {
  const current = previewsStore.get();
  const newPreviews = current.filter((p) => p.port !== port);
  previewsStore.set(newPreviews);

  const currentIndex = activePreviewIndex.get();
  if (currentIndex >= newPreviews.length) {
    activePreviewIndex.set(Math.max(0, newPreviews.length - 1));
  }

  if (newPreviews.length === 0) {
    previewStatus.set('idle');
  }
}

export function setActivePreview(index: number) {
  const previews = previewsStore.get();
  if (index >= 0 && index < previews.length) {
    activePreviewIndex.set(index);
  }
}

export function clearPreviews() {
  previewsStore.set([]);
  activePreviewIndex.set(0);
  previewStatus.set('idle');
  previewError.set(null);
}

export function setPreviewStatus(status: PreviewStatus) {
  previewStatus.set(status);
}

export function setPreviewError(error: string | null) {
  previewError.set(error);
  if (error) {
    previewStatus.set('error');
  }
}

export function refreshPreview() {
  const current = activePreview.get();
  if (current) {
    const url = new URL(current.url);
    url.searchParams.set('_t', Date.now().toString());

    const previews = previewsStore.get();
    const index = activePreviewIndex.get();
    const updated = [...previews];
    updated[index] = { ...updated[index], url: url.toString() };
    previewsStore.set(updated);
  }
}
