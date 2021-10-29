/* eslint-disable @angular-eslint/directive-selector */
import { Directive, ElementRef, HostListener, AfterViewChecked, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[tabControl]'
})
export class TabControlDirective implements AfterViewChecked {

  @Output() pageEnd = new EventEmitter<string>();
  private tabs: HTMLElement[] = [];

  constructor(private eref: ElementRef<HTMLElement>) { }

  @HostListener('keydown', ['$event'])
  public down(event: KeyboardEvent) {
    if ((event.code === 'ArrowDown') || (event.code === 'ArrowUp') || (event.code === 'ArrowLeft') || (event.code === 'ArrowRight')) {

      event.preventDefault();
      const current = this.tabs.find((t) => t === event.target);
      if (!!current) {

        const index = this.getTabIndex(current);
        const up = ((event.code === 'ArrowUp') || (event.code === 'ArrowLeft'));
        const move = up ? this.getPrevious(index) : this.getNext(index);
        if (move === undefined) {
          if (up) {
            this.pageEnd.emit('top');
          } else {
            this.pageEnd.emit('bottom');
          }
        }
        if (!!move) {
          move.focus();
        }
      }
    } else if ((event.code === 'KeyI') || (event.code === 'KeyE') || (event.code === 'KeyF') ||
      (event.code === 'KeyA') || (event.code === 'KeyS')) {
      this.pageEnd.emit(event.code);
      const current = this.tabs.find((t) => t === event.target);
      const index = this.getTabIndex(current);
      const move = this.getNext(index);
      if (!!move) {
        move.focus();
      }
    } else if (event.code === 'KeyC') {
      this.pageEnd.emit(event.code);
      const current = this.tabs.find((t) => t === event.target);
      current.focus();
    }
  }


  public ngAfterViewChecked() {
    const indexes = this.eref.nativeElement.querySelectorAll<HTMLElement>('[tabindex]');
    if (!!indexes) {
      this.tabs = Array.from(indexes).sort((a, b) => this.getTabIndex(a) - this.getTabIndex(b));
      // if (this.autoselect) {

      //   this.tabs[0].focus();
      //   this.autoselect = false;
      // }
    }
  }


  private getTabIndex(e: Element): number {
    return Number.parseInt(e.getAttribute('tabindex') || '', 10);
  }

  private getPrevious(index: number): HTMLElement | undefined {
    return this.tabs.filter((t) => this.getTabIndex(t) < index).slice(-1).pop();
  }

  private getNext(index: number): HTMLElement | undefined {
    return this.tabs.find((t) => this.getTabIndex(t) > index);
  }
}
