# UI Stack

The desktop UI is Angular 22 + **Tailwind CSS v4** + **Spartan UI**.

## Tailwind v4

There is no `tailwind.config.js`. All configuration lives in CSS:

- `src/styles.css` — `@import "tailwindcss"`, `@source`, `@custom-variant dark`,
  the design tokens (`:root` / `.dark`) and the `@theme inline` mapping that
  exposes them as utilities (`bg-card`, `text-muted-foreground`, `border-border`…).
- `.postcssrc.json` — registers `@tailwindcss/postcss` for the Angular builder.

Dark mode is class based: the app shell toggles `.dark` on `<html>`.

### Design tokens

The UI contains **no raw Tailwind palette colours** (`slate-800`, `rose-500`,
`cyan-600`…) and no hard-coded hex values outside the brand logo. Everything
goes through semantic tokens so both themes stay in sync:

| Token | Utilities |
| --- | --- |
| surface | `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent` |
| text | `text-foreground`, `text-muted-foreground`, `*-foreground` pairs |
| brand | `bg-primary`, `text-primary`, `ring-ring` |
| state | `bg-destructive`, `bg-success`, `bg-warning`, `bg-info`, `bg-highlight` |
| severity | `text-severity-critical` … `-high`, `-medium`, `-low`, `-info` |
| code panes | `bg-code`, `text-code-foreground` (always dark, e.g. tooltips) |
| chrome | `border-border`, `border-input` |

Conventions used throughout:

- Solid surfaces pair with their foreground: `bg-primary text-primary-foreground`.
- Tints and edges use opacity of the token: `bg-destructive/10 border-destructive/20`.
- Hover on a solid surface softens it: `hover:bg-primary/90`.
- `dark:` overrides are only needed for things a token cannot express (e.g.
  `dark:shadow-none`) — the tokens themselves already flip with the theme.

### Charts and SVG

`src/app/shared/ui/chart-theme.ts` bridges the CSS tokens into TypeScript for
ngx-charts (`severityScheme()`, `severityColor()`, `cssVar()`), so chart series
follow the same severity palette. Inline SVG uses `stroke-*`/`fill-*` utilities
or `var(--token)` rather than hex literals.

## Spartan UI (helm)

Spartan components are *copy-in* — they live in this repo under
`src/app/shared/ui/` rather than being imported from a package:

- `utils.ts` — `hlm()` / `cn()` class merger (`clsx` + `tailwind-merge`).
- `hlm-button.ts` — `hlmBtn` directive (`variant`, `size`).
- `hlm-badge.ts` — `hlmBadge` directive (`variant`).
- `hlm-card.ts` — `hlmCard`, `hlmCardHeader`, `hlmCardTitle`,
  `hlmCardDescription`, `hlmCardContent`, `hlmCardFooter`.
- `hlm-form-field.ts` — `hlmInput`, `hlmSelect`, `hlmLabel`, `hlmSeparator`, `hlmMuted`.
- `chart-theme.ts` — CSS token → TypeScript colour bridge for ngx-charts.

Usage in a standalone component:

```ts
import { HlmImports } from '../shared/ui';

@Component({
  imports: [...HlmImports],
  template: `
    <section hlmCard>
      <div hlmCardHeader><h3 hlmCardTitle>Title</h3></div>
      <div hlmCardContent>…</div>
      <div hlmCardFooter class="justify-end">
        <button hlmBtn variant="destructive" size="sm">Delete</button>
      </div>
    </section>
  `,
})
```

### Adding more components

`@spartan-ng/brain` (headless behaviour for dialog, select, tabs, tooltip,
popover…) is already installed. To add a new primitive, copy the matching helm
implementation from https://spartan.ng into `src/app/shared/ui/`, wire it into
`index.ts`/`HlmImports`, and pair it with the corresponding `Brn*` directive
from `@spartan-ng/brain` when behaviour is needed.
