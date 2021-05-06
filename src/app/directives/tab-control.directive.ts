import { Directive, ElementRef, HostListener, AfterViewChecked } from '@angular/core';

@Directive({
  selector: '[tabControl]'
})
export class TabControlDirective implements AfterViewChecked {

  private tabs: HTMLElement[] = [];

  constructor(private eref: ElementRef<HTMLElement>) { }

  @HostListener('keydown', ['$event'])
  public down(event: KeyboardEvent) {
    if ((event.code === 'ArrowDown') || (event.code === 'ArrowUp')) {
      event.preventDefault();
      const current = this.tabs.find((t) => t === event.target);
      if (!!current) {
        const index = this.getTabIndex(current);
        const move = (event.code === 'ArrowUp') ? this.getPrevious(index) : this.getNext(index);
        if (!!move) {
          move.focus();
        }
      }
    }
  }


  public ngAfterViewChecked() {
    const indexes = this.eref.nativeElement.querySelectorAll<HTMLElement>('[ng-reflect-arrow-index]');
    if (!!indexes) {
      this.tabs = Array.from(indexes).sort((a, b) => this.getTabIndex(a) - this.getTabIndex(b));
    }
  }


  private getTabIndex(e: Element): number {
    return Number.parseInt(e.getAttribute('ng-reflect-arrow-index') || '', 10);
  }

  private getPrevious(index: number): HTMLElement | undefined {
    return this.tabs.filter((t) => this.getTabIndex(t) < index).slice(-1).pop();
  }

  private getNext(index: number): HTMLElement | undefined {
    return this.tabs.find((t) => this.getTabIndex(t) > index);
  }
}
