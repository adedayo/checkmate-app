import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterExpression } from '../models/ldap';


@Component({
  selector: 'app-simple-filter',
  templateUrl: './simple-filter.component.html',
  styleUrls: ['./simple-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SimpleFilterComponent),
      multi: true
    }
  ]
})
export class SimpleFilterComponent implements ControlValueAccessor, OnInit {

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  @Input() attributeNameExample = 'objectClass';
  @Input() attributeValueExample = 'inetOrgPerson';


  form: FormGroup;
  destroy$: Subject<void> = new Subject<void>();
  private onChange: (val: FilterExpression | null | undefined) => void;
  constructor(private fb: FormBuilder) { }


  writeValue(val: FilterExpression | null | undefined): void {
    if (!val) {
      return;
    }

    this.form.patchValue(val);
  }


  registerOnTouched(fn: any): void {

  }

  registerOnChange(fn: (val: FilterExpression | null | undefined) => void): void {
    this.onChange = fn;
  }

  setDisabledState?(isDisabled: boolean): void { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: '',
      value: ''
    });

    this.setupObservables();
  }


  private setupObservables() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (this.onChange) {
        this.onChange(val);
      }
    });
  }

}



