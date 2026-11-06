import type { AuthFileItem } from '@/types';
import { useQuotaStore } from '@/stores/useQuotaStore';
import { classifyQuotaFiles, type QuotaFileEntry } from './logic';

let preloadedGeneration: number | null = null;

/** Preload once per login, including restored sessions, across route remounts. */
export async function preloadQuotaForSession(
  files: AuthFileItem[],
  generation: number,
  loadQuota: (entries: QuotaFileEntry[]) => Promise<void>
): Promise<void> {
  if (generation !== useQuotaStore.getState().cacheGeneration || preloadedGeneration === generation)
    return;
  const entries = classifyQuotaFiles(files);
  if (entries.length === 0) return;
  preloadedGeneration = generation;
  await loadQuota(entries);
}
