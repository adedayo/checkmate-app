/**
 * Bridges the CSS design tokens in `styles.css` to libraries that need real
 * colour values in TypeScript (ngx-charts, canvas, etc).
 *
 * Values are read from the live `<html>` element, so they automatically follow
 * the active light/dark theme.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

const SEVERITY_VAR: Record<Severity, string> = {
  critical: '--severity-critical',
  high: '--severity-high',
  medium: '--severity-medium',
  low: '--severity-low',
  info: '--severity-info',
};

/** Read a CSS custom property from the document root. */
export function cssVar(name: string, fallback = 'currentColor'): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return fallback;
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Resolve a single severity to its themed colour. */
export function severityColor(severity: Severity): string {
  return cssVar(SEVERITY_VAR[severity]);
}

/**
 * ngx-charts custom colour scheme covering both the capitalised and
 * upper-case severity labels emitted by the engine.
 */
export function severityScheme(): { name: string; value: string }[] {
  return (Object.keys(SEVERITY_VAR) as Severity[]).flatMap((severity) => {
    const value = severityColor(severity);
    const label = severity[0].toUpperCase() + severity.slice(1);
    return [
      { name: label, value },
      { name: label.toUpperCase(), value },
    ];
  });
}
