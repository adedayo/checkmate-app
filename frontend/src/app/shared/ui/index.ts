import { HlmBadge } from './hlm-badge';
import { HlmButton } from './hlm-button';
import { HlmCardImports } from './hlm-card';
import { HlmInput, HlmLabel, HlmMuted, HlmSelect, HlmSeparator } from './hlm-form-field';

export * from './hlm-badge';
export * from './hlm-button';
export * from './hlm-card';
export * from './hlm-form-field';
export * from './utils';

/**
 * Convenience barrel so a standalone component can do:
 * `imports: [...HlmImports]`
 */
export const HlmImports = [
  HlmButton,
  HlmBadge,
  ...HlmCardImports,
  HlmInput,
  HlmSelect,
  HlmLabel,
  HlmSeparator,
  HlmMuted,
] as const;
