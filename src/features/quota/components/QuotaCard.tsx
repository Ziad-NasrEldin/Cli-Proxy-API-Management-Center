/**
 * Provider quota card: identity, loading/error state, quota body, and actions.
 * Claude observations remain visible while refreshing or after a failed read.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconRefreshCw } from '@/components/ui/icons';
import type { ClaudeQuotaState, ResolvedTheme } from '@/types';
import { resolveQuotaErrorMessage } from '@/utils/quota';
import { accountIdentity, accountSummary } from '../accountSummary';
import { AccountLimits } from './AccountLimits';
import {
  getAuthFileIcon,
  getThemeSurfaceIconBackground,
  getTypeLabel,
  isThemeSurfaceIconProvider,
} from '@/features/authFiles/constants';
import { bindQuotaClasses } from '../types';
import { QUOTA_ADAPTERS, type QuotaCardState } from '../providers';
import { isQuotaRefreshDisabled, type QuotaFileEntry } from '../logic';
import { useClaudeResetGrants } from '../providers/claude/ClaudeResetGrants';
import { ClaudeResetGrantDetails } from '../providers/claude/ClaudeResetGrantDetails';
import { hasClaudeUsageData } from '../providers/claude/data';
import bodyStyles from './QuotaBody.module.scss';
import styles from './QuotaCard.module.scss';

/** Bind the quota-page styles to the shared rendering contract. */
const quotaClasses = bindQuotaClasses(bodyStyles, 'QuotaBody.module.scss');

export type QuotaCardProps = {
  entry: QuotaFileEntry;
  quota?: QuotaCardState;
  resolvedTheme: ResolvedTheme;
  canRefresh: boolean;
  resetting: boolean;
  /** Initial cascade delay; null disables entrance motion for later mounts. */
  entranceDelayMs?: number | null;
  onRefresh: () => void;
  onReset: () => void;
};

export function QuotaCard(props: QuotaCardProps) {
  const { entry, quota, resolvedTheme, canRefresh, resetting, onRefresh, onReset } = props;
  const { t } = useTranslation();
  const adapter = QUOTA_ADAPTERS[entry.type];
  const file = entry.file;
  const retainedClaudeUsage =
    entry.type === 'claude' && hasClaudeUsageData(quota as ClaudeQuotaState | undefined);
  const displayName = accountIdentity(file);
  const summary = accountSummary(entry.type, quota, t);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const status = quota?.status ?? 'idle';
  const loading = status === 'loading';
  const claudeReset = useClaudeResetGrants(
    file,
    entry.type === 'claude' && status !== 'idle',
    !canRefresh || loading || resetting,
    quota,
    onRefresh
  );
  const providerType =
    entry.type === 'plugin'
      ? String(
          file.quotaProvider ?? file['quota_provider'] ?? file.provider ?? file.type ?? 'plugin'
        )
      : entry.type;
  const iconSrc = getAuthFileIcon(providerType, resolvedTheme);
  const typeLabel = getTypeLabel(t, providerType);
  const errorMessage = resolveQuotaErrorMessage(
    t,
    quota?.errorStatus,
    quota?.error || t('common.unknown_error')
  );
  // Claude banked resets join the plan chip row; their expiry list follows it.
  const showClaudeReset = entry.type === 'claude' && status === 'success';
  const claudePlanItems = showClaudeReset ? (
    <span className={quotaClasses.codexPlanItem}>
      <span className={quotaClasses.codexPlanLabel}>{t('claude_reset.remaining')}</span>
      <span className={quotaClasses.codexPlanValue}>{claudeReset.count ?? '--'}</span>
    </span>
  ) : undefined;
  const claudeAfterPlan = showClaudeReset ? (
    <ClaudeResetGrantDetails grants={claudeReset.grants} classes={quotaClasses} />
  ) : undefined;
  const showReset =
    status === 'success' &&
    Boolean(adapter.resetQuota) &&
    quota !== undefined &&
    Boolean(adapter.canResetQuota?.(quota));

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <span
          className={styles.iconWrap}
          title={typeLabel}
          style={
            isThemeSurfaceIconProvider(providerType)
              ? { background: getThemeSurfaceIconBackground(resolvedTheme) }
              : undefined
          }
        >
          {iconSrc ? (
            <img src={iconSrc} alt="" className={styles.icon} />
          ) : (
            <span className={styles.iconFallback}>{typeLabel.slice(0, 1).toUpperCase()}</span>
          )}
        </span>
        <div className={styles.identity}>
          <span className={styles.fileName}>{displayName}</span>
          <div className={styles.identityMeta}>
            <span>{typeLabel}</span>
            <span className={styles.plan}>
              {summary?.plan ??
                (status === 'success' ? '' : t('quota_management.plan_unavailable'))}
            </span>
            {file.disabled && <span>{t('auth_files.disabled')}</span>}
          </div>
        </div>
      </header>

      {summary && (status === 'success' || retainedClaudeUsage) ? (
        <div className={styles.summary}>
          {quota && 'stale' in quota && quota.stale === true && (
            <div className={styles.errorStrip} role="status">
              {t('quota_management.stale')}
            </div>
          )}
          {status === 'error' && (
            <div className={styles.errorStrip} role="alert">
              {errorMessage}
            </div>
          )}
          {loading && <div role="status">{t(`${adapter.i18nPrefix}.loading`)}</div>}
          <AccountLimits summary={summary} />
        </div>
      ) : (
        <div className={styles.body}>
          {status === 'idle' ? (
            <button
              type="button"
              className={styles.idleBody}
              onClick={onRefresh}
              disabled={!canRefresh}
            >
              <IconRefreshCw size={15} aria-hidden="true" className={styles.idleGlyph} />
              <span className={styles.idleHint}>{t(`${adapter.i18nPrefix}.idle`)}</span>
            </button>
          ) : loading && !retainedClaudeUsage ? (
            <div className={styles.skeleton} aria-busy="true">
              <span className={styles.srOnly}>{t(`${adapter.i18nPrefix}.loading`)}</span>
              {[0, 1].map((row) => (
                <div key={row} className={styles.skeletonRow} aria-hidden="true">
                  <span className={styles.skeletonLabel} />
                  <span className={styles.skeletonTrack} />
                </div>
              ))}
            </div>
          ) : status === 'error' ? (
            <div className={styles.errorStrip} role="alert">
              {t(`${adapter.i18nPrefix}.load_failed`, { message: errorMessage })}
            </div>
          ) : quota && !retainedClaudeUsage ? (
            <adapter.Body
              quota={quota}
              classes={quotaClasses}
              planItems={claudePlanItems}
              afterPlan={claudeAfterPlan}
            />
          ) : !retainedClaudeUsage ? (
            <div className={styles.idleHint}>{t(`${adapter.i18nPrefix}.idle`)}</div>
          ) : null}
          {loading && retainedClaudeUsage && (
            <div role="status" aria-busy="true" className={quotaClasses.quotaMessage}>
              {t(`${adapter.i18nPrefix}.loading`)}
            </div>
          )}
          {retainedClaudeUsage && quota && (
            <adapter.Body
              quota={quota}
              classes={quotaClasses}
              planItems={claudePlanItems}
              afterPlan={claudeAfterPlan}
            />
          )}
        </div>
      )}

      {status !== 'idle' && (
        <footer className={styles.actionRow}>
          {entry.type === 'claude' && claudeReset.message && (
            <div role="status" className={styles.resetFeedback}>
              {t(`claude_reset.${claudeReset.message}`)}
            </div>
          )}
          {(summary?.manualResets != null || (showClaudeReset && claudeReset.count != null)) && (
            <span className={styles.resetCount}>
              {t('quota_management.manual_resets', {
                count: showClaudeReset ? claudeReset.count : summary?.manualResets,
                defaultValue: '',
              })}
            </span>
          )}
          {entry.type === 'claude' && (
            <button
              type="button"
              className={styles.actionPill}
              disabled={claudeReset.blocked}
              onClick={claudeReset.confirm}
              title={t(`claude_reset.${claudeReset.buttonLabel}`)}
            >
              <IconRefreshCw size={13} className={claudeReset.busy ? styles.spinning : undefined} />
              {t(`claude_reset.${claudeReset.buttonLabel}`)}
            </button>
          )}
          {showReset && (
            <button
              type="button"
              className={styles.actionPill}
              onClick={onReset}
              disabled={!canRefresh || loading || resetting}
              title={t('codex_quota.reset_button')}
            >
              <IconRefreshCw size={13} className={resetting ? styles.spinning : undefined} />
              {t('codex_quota.reset_button')}
            </button>
          )}
          <button
            type="button"
            className={`${styles.actionPill} ${styles.refreshButton}`}
            onClick={onRefresh}
            disabled={isQuotaRefreshDisabled(canRefresh, loading, resetting || claudeReset.busy)}
            title={t('auth_files.quota_refresh_hint')}
            aria-label={t('quota_management.refresh_account', { account: displayName })}
          >
            <IconRefreshCw size={13} className={loading ? styles.spinning : undefined} />
            <span className={styles.srOnly}>{t('quota_management.refresh')}</span>
          </button>
          {summary && (
            <button
              type="button"
              className={styles.detailButton}
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              {t(
                detailsOpen ? 'quota_management.hide_details' : 'quota_management.account_details'
              )}
            </button>
          )}
        </footer>
      )}
      {summary && detailsOpen && quota && (
        <div className={styles.detailBody}>
          <div className={styles.sourceName}>{file.name}</div>
          <adapter.Body
            quota={quota}
            classes={quotaClasses}
            planItems={claudePlanItems}
            afterPlan={claudeAfterPlan}
          />
        </div>
      )}
    </article>
  );
}
