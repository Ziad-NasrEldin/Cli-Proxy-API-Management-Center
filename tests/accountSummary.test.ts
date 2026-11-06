import { describe, expect, test } from 'bun:test';
import i18n from '@/i18n';
import { accountIdentity, accountSummary } from '@/features/quota/accountSummary';
import type { AntigravityQuotaState, CodexQuotaState } from '@/types';

const t = i18n.getFixedT('en');

describe('account quota summaries', () => {
  test('preserves the two window reset instants and distinguishes exhausted from unknown usage', () => {
    const quota: CodexQuotaState = {
      status: 'success',
      planType: 'plus',
      rateLimitResetCreditsAvailableCount: 0,
      windows: [
        {
          id: '5h',
          label: '5-hour limit',
          usedPercent: 100,
          resetLabel: '',
          resetAtMs: 18000000,
          periodHours: 5,
        },
        {
          id: 'weekly',
          label: 'Weekly limit',
          usedPercent: null,
          resetLabel: '',
          resetAtMs: 604800000,
          periodHours: 168,
        },
        { id: 'review', label: 'Code review', usedPercent: 15, resetLabel: '', resetAtMs: null },
      ],
    };
    const summary = accountSummary('codex', quota, t)!;
    const weeklyOnly = accountSummary('codex', { ...quota, windows: [quota.windows[1]] } as CodexQuotaState, t)!;
    expect(weeklyOnly.limits.map((limit) => [limit.periodHours, limit.remaining])).toEqual([[5, null], [168, null]]);
    expect(summary.plan).toBe('Plus');
    expect(summary.manualResets).toBe(0);
    expect(
      summary.limits.map((limit) => [limit.remaining, limit.resetAtMs, limit.periodHours])
    ).toEqual([
      [0, 18000000, 5],
      [null, 604800000, 168],
      [85, null, undefined],
    ]);
  });

  test('keeps Antigravity groups separate and treats quota fractions as remaining', () => {
    const quota: AntigravityQuotaState = {
      status: 'success',
      serverTimeOffsetMs: 5000,
      subscription: { plan: 'ultra-lite', tierName: null, tierId: null },
      groups: ['Gemini Models', 'Claude and GPT Models'].map((label, index) => ({
        id: String(index),
        label,
        buckets: [
          {
            id: 'weekly',
            label: 'Weekly Limit Remaining',
            window: 'weekly',
            remainingFraction: index === 0 ? 0.25 : 0,
            resetTime: '2026-11-05T10:00:00Z',
          },
          {
            id: '5h',
            label: 'Five Hour Limit',
            window: '5h',
            remainingFraction: 1,
            resetTime: 'invalid',
          },
        ],
      })),
    };
    const summary = accountSummary('antigravity', quota, t)!;
    expect(summary.plan).toBe('Ultra Lite');
    expect(summary.clockOffsetMs).toBe(5000);
    expect(new Set(summary.limits.map((limit) => limit.id)).size).toBe(4);
    expect(summary.limits.map((limit) => limit.remaining)).toEqual([25, 100, 0, 100]);
    expect(summary.limits[0].resetAtMs).toBe(Date.parse('2026-11-05T10:00:00Z'));
    expect(summary.limits[1].resetAtMs).toBeNull();
  });

  test('uses public email without exposing credential account values or stripping fallback identifiers', () => {
    expect(
      accountIdentity({
        name: 'codex-opaque-plus.json',
        email: ' owner@example.test ',
        account: 'secret',
      })
    ).toBe('owner@example.test');
    expect(accountIdentity({ name: 'credential.json', account: 'secret' })).toBe('credential.json');
  });
});
