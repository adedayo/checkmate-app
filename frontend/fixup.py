#!/usr/bin/env python3
"""Follow-up codemod: pair `text-white` with the matching token foreground and
remove hover/dark states that became no-ops once colours were tokenised."""
import pathlib
import re
import sys

TOKENS = 'primary|success|destructive|info|warning|highlight'


def fix_class_attr(value: str) -> str:
    # Which token surface is this element painted with?
    surface = re.search(rf'(?:bg|from)-({TOKENS})\b', value)
    fg = f'text-{surface[1]}-foreground' if surface else 'text-background'

    value = re.sub(r'\b(dark:)?(hover:)?text-white\b',
                   lambda m: f'{m[1] or ""}{m[2] or ""}{fg}', value)

    # `bg-primary hover:bg-primary` is a no-op; soften the hover instead.
    value = re.sub(rf'\b(bg|from|to)-({TOKENS})\b((?:(?!\bhover:).)*)\bhover:\1-\2\b',
                   lambda m: f'{m[1]}-{m[2]}{m[3]}hover:{m[1]}-{m[2]}/90', value)

    # Drop `dark:` variants that now repeat their light-mode counterpart.
    value = re.sub(rf'\s+dark:((?:hover:)?(?:bg|text|border|from|to)-(?:{TOKENS})'
                   r'(?:-foreground)?(?:/\d+)?)\b',
                   lambda m: '' if m[1] in value else m[0], value)

    return re.sub(r' {2,}', ' ', value).strip()


def sweep(text: str) -> str:
    return re.sub(r'class="([^"]*)"', lambda m: f'class="{fix_class_attr(m[1])}"', text)


def main(paths):
    for p in paths:
        path = pathlib.Path(p)
        original = path.read_text()
        updated = sweep(original)
        if updated != original:
            path.write_text(updated)
            print(f'rewrote {path}')


if __name__ == '__main__':
    main(sys.argv[1:])
