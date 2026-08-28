import { computed, Directive, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { hlm } from './utils';

@Directive({
  selector: 'input[hlmInput], textarea[hlmInput]',
  host: { '[class]': '_computedClass()' },
})
export class HlmInput {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  readonly error = input(false);

  protected readonly _computedClass = computed(() =>
    hlm(
      'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
      'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
      'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.error() && 'border-destructive ring-destructive/20',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: 'select[hlmSelect]',
  host: { '[class]': '_computedClass()' },
})
export class HlmSelect {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm(
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: 'label[hlmLabel]',
  host: { '[class]': '_computedClass()' },
})
export class HlmLabel {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm(
      'flex items-center gap-2 text-sm leading-none font-medium select-none',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: '[hlmSeparator]',
  host: {
    role: 'separator',
    '[class]': '_computedClass()',
  },
})
export class HlmSeparator {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  protected readonly _computedClass = computed(() =>
    hlm(
      'bg-border shrink-0',
      this.orientation() === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: '[hlmMuted]',
  host: { '[class]': '_computedClass()' },
})
export class HlmMuted {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm('text-muted-foreground text-sm', this.userClass()),
  );
}
