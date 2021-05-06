import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabControlDirective } from './tab-control.directive';

@NgModule({
   imports: [
      CommonModule
   ],
   declarations: [TabControlDirective],
   exports: [TabControlDirective]
})
export class TabControlModule { }
