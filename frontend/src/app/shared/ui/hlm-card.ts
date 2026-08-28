import { booleanAttribute, computed, Directive, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { hlm } from './utils';

@Directive({
  selector: '[hlmCard]',
  host: { '[class]': '_computedClass()' },
})
export class HlmCard {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm(
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: '[hlmCardHeader]',
  host: { '[class]': '_computedClass()' },
})
export class HlmCardHeader {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm('flex flex-col gap-1.5 px-6', this.userClass()),
  );
}

@Directive({
  selector: '[hlmCardTitle]',
  host: { '[class]': '_computedClass()' },
})
export class HlmCardTitle {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm('leading-none font-semibold tracking-tight', this.userClass()),
  );
}

@Directive({
  selector: '[hlmCardDescription]',
  host: { '[class]': '_computedClass()' },
})
export class HlmCardDescription {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm('text-muted-foreground text-sm', this.userClass()),
  );
}

@Directive({
  selector: '[hlmCardContent]',
  host: { '[class]': '_computedClass()' },
})
export class HlmCardContent {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() => hlm('px-6', this.userClass()));
}

@Directive({
  selector: '[hlmCardFooter]',
  host: { '[class]': '_computedClass()' },
})
export class HlmCardFooter {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  readonly bordered = input(false, { transform: booleanAttribute });
  protected readonly _computedClass = computed(() =>
    hlm('flex items-center px-6', this.bordered() && 'border-t pt-6', this.userClass()),
  );
}

export const HlmCardImports = [
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardDescription,
  HlmCardContent,
  HlmCardFooter,
] as const;
