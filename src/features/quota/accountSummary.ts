import type { TFunction } from 'i18next';
import type {
  AuthFileItem,
  AntigravityQuotaState,
  ClaudeQuotaState,
  CodexQuotaState,
} from '@/types';
import {
  normalizePlanType,
  BUSINESS_PREMIUM_CODEX_PLAN_TYPE,
  PRO_CODEX_PLAN_TYPE,
  PRO_LITE_CODEX_PLAN_TYPES,
  PRO_MAX_CODEX_PLAN_TYPES,
} from '@/utils/quota';
import type { QuotaCardState } from './providers';
import type { QuotaProviderType } from './providers/types';
import {
  resolveAntigravityBucketLabelKey,
  resolveAntigravityGroupLabelKey,
} from './providers/antigravity/labels';

export type AccountLimit = {
  id: string;
  label: string;
  group?: string;
  remaining: number | null;
  resetAtMs?: number | null;
  periodHours?: number | null;
};

export type AccountSummary = {
  plan: string;
  limits: AccountLimit[];
  manualResets?: number | null;
  clockOffsetMs?: number;
};

export function accountIdentity(file: AuthFileItem): string {
  // account can contain an API key; only the scanner's email is display-safe.
  return file.email?.trim() || file.name;
}

const remainingFromUsed = (used: number | null): number | null =>
  used === null || !Number.isFinite(used) ? null : Math.max(0, Math.min(100, 100 - used));

export function accountSummary(
  type: QuotaProviderType,
  quota: QuotaCardState | undefined,
  t: TFunction
): AccountSummary | null {
  if (!quota) return null;
  const unknownPlan = t('quota_management.plan_unavailable');
  if (type === 'codex' || type === 'claude') {
    const data = quota as CodexQuotaState | ClaudeQuotaState;
    if (!data.windows?.length) return null;
    let plan = unknownPlan;
    if (type === 'claude') {
      if (data.planType) plan = t(`claude_quota.${data.planType}`, { defaultValue: data.planType });
    } else {
      const normalized = normalizePlanType(data.planType);
      const key =
        normalized === BUSINESS_PREMIUM_CODEX_PLAN_TYPE
          ? 'business_premium'
          : PRO_MAX_CODEX_PLAN_TYPES.has(normalized ?? '')
            ? 'promax'
            : normalized === PRO_CODEX_PLAN_TYPE
              ? 'pro'
              : PRO_LITE_CODEX_PLAN_TYPES.has(normalized ?? '')
                ? 'prolite'
                : normalized;
      if (key) plan = t(`codex_quota.plan_${key}`, { defaultValue: data.planType ?? key });
    }
    const limits: AccountLimit[] = data.windows.map((window) => ({
      id: window.id,
      label: window.labelKey
        ? t(window.labelKey, ('labelParams' in window ? window.labelParams : undefined) ?? {})
        : window.label,
      remaining: remainingFromUsed(window.usedPercent),
      resetAtMs: window.resetAtMs,
      periodHours: window.periodHours,
    }));
    // Keep weekly observations in the weekly column even when the API omits a session window.
    if (
      limits.some((limit) => limit.periodHours === 168) &&
      !limits.some((limit) => limit.periodHours === 5)
    ) {
      limits.unshift({
        id: 'unreported-session',
        label: t('codex_quota.primary_window'),
        remaining: null,
        periodHours: 5,
      });
    }
    return {
      plan,
      manualResets:
        type === 'codex'
          ? (data as CodexQuotaState).rateLimitResetCreditsAvailableCount
          : undefined,
      limits,
    };
  }
  if (type === 'antigravity') {
    const data = quota as AntigravityQuotaState;
    if (!data.groups?.length) return null;
    const subscription = data.subscription;
    const planKey = subscription?.plan?.replace(/-/g, '_');
    const plan =
      planKey && planKey !== 'unknown'
        ? t(`antigravity_subscription.plan_${planKey}`, {
            defaultValue: subscription?.tierName || planKey,
          })
        : subscription?.tierName || unknownPlan;
    return {
      plan,
      clockOffsetMs: data.serverTimeOffsetMs ?? 0,
      limits: data.groups.flatMap((group) => {
        const groupKey = resolveAntigravityGroupLabelKey(group.label);
        return group.buckets.map((bucket) => {
          const key = resolveAntigravityBucketLabelKey(bucket.label, bucket.window);
          const parsedReset =
            bucket.resetAtMs ?? (bucket.resetTime ? Date.parse(bucket.resetTime) : null);
          return {
            id: `${group.id}:${bucket.id}`,
            label: key ? t(`antigravity_quota.${key}`) : bucket.label,
            group: groupKey ? t(`antigravity_quota.${groupKey}`) : group.label,
            remaining: Number.isFinite(bucket.remainingFraction)
              ? Math.max(0, Math.min(100, bucket.remainingFraction * 100))
              : null,
            resetAtMs: parsedReset !== null && Number.isFinite(parsedReset) ? parsedReset : null,
            periodHours: bucket.periodHours,
          };
        });
      }),
    };
  }
  return null;
}
