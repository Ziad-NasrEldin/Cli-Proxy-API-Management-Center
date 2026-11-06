import { beforeEach, describe, expect, test } from 'bun:test';
import { preloadQuotaForSession } from '@/features/quota/sessionPreload';
import { useQuotaStore } from '@/stores/useQuotaStore';
import type { AuthFileItem } from '@/types';

const files: AuthFileItem[] = [
  { name: 'codex.json', type: 'codex', authIndex: '1' },
  { name: 'antigravity.json', type: 'antigravity', authIndex: '2' },
  { name: 'disabled.json', type: 'codex', disabled: true },
  { name: 'unsupported.json', type: 'unknown' },
];

beforeEach(() => useQuotaStore.getState().clearQuotaCache());

describe('login quota preload', () => {
  test('fetches all supported accounts once per session, independently of the selected page', async () => {
    const generation = useQuotaStore.getState().cacheGeneration;
    const batches: string[][] = [];
    const load = async (entries: { file: AuthFileItem }[]) => {
      batches.push(entries.map(({ file }) => file.name).sort());
    };

    await preloadQuotaForSession(files, generation, load);
    await preloadQuotaForSession(files, generation, load);
    expect(batches).toEqual([['antigravity.json', 'codex.json']]);

    useQuotaStore.getState().clearQuotaCache();
    await preloadQuotaForSession(files, generation, load);
    expect(batches).toHaveLength(1);
    await preloadQuotaForSession(files, useQuotaStore.getState().cacheGeneration, load);
    expect(batches).toHaveLength(2);
  });

  test('does not let an empty or stale account list consume the current session preload', async () => {
    const generation = useQuotaStore.getState().cacheGeneration;
    let loaded = 0;
    const load = async () => {
      loaded += 1;
    };
    await preloadQuotaForSession(files, generation - 1, load);
    await preloadQuotaForSession([], generation, load);
    expect(loaded).toBe(0);
    await preloadQuotaForSession(files, generation, load);
    expect(loaded).toBe(1);
  });
});
