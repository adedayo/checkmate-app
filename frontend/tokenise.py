#!/usr/bin/env python3
"""One-shot codemod: replace raw Tailwind palette utilities with Spartan tokens."""
import pathlib
import re
import sys

GROUP = {
    'rose': 'destructive', 'red': 'destructive',
    'amber': 'warning', 'yellow': 'warning', 'orange': 'warning',
    'emerald': 'success', 'green': 'success', 'teal': 'success',
    'cyan': 'primary',
    'blue': 'info', 'indigo': 'info',
    'purple': 'highlight', 'violet': 'highlight', 'fuchsia': 'highlight',
}

HUES = '|'.join(GROUP)
PREFIX = r'((?:[a-z-]+:)*)'
FG = 'text|fill|stroke|ring|caret|accent|decoration|outline|shadow|from|via|to'
TOKENS = 'destructive|warning|success|primary|info|highlight'

fg_re = re.compile(rf'{PREFIX}({FG})-({HUES})-(\d+)(/\d+)?')
bg_re = re.compile(rf'{PREFIX}bg-({HUES})-(\d+)(/\d+)?')
bd_re = re.compile(rf'{PREFIX}(border|divide)(-[tblrxy])?-({HUES})-(\d+)(/\d+)?')
pair_re = re.compile(rf'\b((?:[a-z-]+:)*)([a-z-]+)-({TOKENS})(/\d+)? dark:(?:[a-z-]+:)*\2-\3(?:/\d+)?')


def sweep(text: str) -> str:
    # Foreground-ish properties and gradient stops keep any explicit opacity.
    text = fg_re.sub(lambda m: f'{m[1]}{m[2]}-{GROUP[m[3]]}{m[5] or ""}', text)
    # Backgrounds: pale tints (<= 200) become a translucent wash of the token.
    text = bg_re.sub(
        lambda m: f'{m[1]}bg-{GROUP[m[2]]}{m[4] or ("/10" if int(m[3]) <= 200 else "")}', text)
    # Borders / dividers: pale tints (<= 300) become a translucent token edge.
    text = bd_re.sub(
        lambda m: f'{m[1]}{m[2]}{m[3] or ""}-{GROUP[m[4]]}'
                  f'{m[6] or ("/20" if int(m[5]) <= 300 else "")}', text)
    # Collapse light/dark pairs that now resolve to the same token.
    for _ in range(4):
        text = pair_re.sub(lambda m: f'{m[1]}{m[2]}-{m[3]}{m[4] or ""}', text)
    return re.sub(r' {2,}', ' ', text)


def main(paths):
    changed = 0
    for p in paths:
        path = pathlib.Path(p)
        original = path.read_text()
        updated = sweep(original)
        if updated != original:
            path.write_text(updated)
            changed += 1
            print(f'rewrote {path}')
    print(f'{changed} file(s) changed')


if __name__ == '__main__':
    main(sys.argv[1:])
