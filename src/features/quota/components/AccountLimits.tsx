import { useTranslation } from 'react-i18next';
import { useNow } from '@/hooks/useNow';
import { buildResetDisplay } from '@/utils/quota';
import type { AccountSummary } from '../accountSummary';
import styles from './AccountLimits.module.scss';

export function AccountLimits({ summary }: { summary: AccountSummary }) {
  const { t, i18n } = useTranslation();
  const now = useNow() + (summary.clockOffsetMs ?? 0);
  return (
    <div className={styles.limits}>
      {summary.limits.map((limit) => {
        const remaining = limit.remaining;
        const reset = buildResetDisplay(null, limit.resetAtMs, now, i18n.resolvedLanguage);
        const hasReset = limit.resetAtMs != null && Number.isFinite(limit.resetAtMs);
        const resetDate = hasReset
          ? new Date(limit.resetAtMs!).toLocaleString(i18n.resolvedLanguage, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;
        const tone =
          remaining === null
            ? 'unknown'
            : remaining <= 10
              ? 'low'
              : remaining <= 30
                ? 'medium'
                : 'healthy';
        return (
          <section
            key={limit.id}
            className={styles.limit}
            data-tone={tone}
            aria-label={[limit.group, limit.label].filter(Boolean).join(' · ')}
          >
            <div className={styles.label}>
              {limit.group && <span className={styles.group}>{limit.group}</span>}
              <span>{limit.label}</span>
            </div>
            <div className={styles.value}>
              <strong>{remaining === null ? '—' : `${Math.round(remaining)}%`}</strong>
              <span>
                {t(
                  remaining === null ? 'quota_management.unavailable' : 'quota_management.remaining'
                )}
              </span>
            </div>
            <div className={styles.track} aria-hidden="true">
              <span style={{ width: `${remaining ?? 0}%` }} />
            </div>
            <div className={styles.reset}>
              <span>
                {hasReset && reset?.relative
                  ? limit.resetAtMs! <= now
                    ? t('quota_management.reset_due')
                    : t('quota_management.resets_relative', { time: reset.relative })
                  : t('quota_management.reset_unavailable')}
              </span>
              {resetDate && (
                <time dateTime={new Date(limit.resetAtMs!).toISOString()}>{resetDate}</time>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
