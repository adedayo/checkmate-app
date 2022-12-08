import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LDAPFilter } from '../models/ldap';

@Component({
  selector: 'app-filter-group',
  templateUrl: './filter-group.component.html',
  styleUrls: ['./filter-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterGroupComponent),
      multi: true
    }
  ]
})
export class FilterGroupComponent implements ControlValueAccessor,
  OnInit {

  @Input() filter: LDAPFilter;
  @Input() isRoot = false;
  @Output() remove: EventEmitter<void> = new EventEmitter<void>();
  @Input() attributeNameExample = 'objectClass';
  @Input() attributeValueExample = 'inetOrgPerson';
  @Input() attributeNameLabel = 'Attribute';
  @Input() attributeValueLabel = 'Value';
  @Input() equalityLabel = 'equals/contains';
  form: FormGroup;
  destroy$: Subject<void> = new Subject<void>();

  private onChange: (
    value: LDAPFilter | null | undefined
  ) => void;

  constructor(private fb: FormBuilder) { }


  registerOnValidatorChange?(fn: () => void): void {

  }



  ngOnInit(): void {
    this.form = this.fb.group({
      operator: 0,
      filters: this.fb.array([]),
      filterGroups: this.fb.array([])
    });

    this.writeValue(this.filter);
    this.setupObservables();
  }




  public get operator(): number {
    return this.form.get('operator').value as number;
  }


  public set operator(v: number) {
    this.form.patchValue({ operator: v });
  }


  writeValue(val: LDAPFilter | null | undefined): void {


    if (!val) {
      return;
    }

    setTimeout(() => {
      if (val.filters.length) {
        this.filtersFormArray.clear();
        val.filters.forEach(_ => this.addFilter());
      }

      if (val.filterGroups.length) {
        this.filterGroupsFormArray.clear();
        val.filterGroups.forEach(_ => this.addFilterGroup());
      }

      this.form.patchValue(val);

    }, 50);

  }

  addFilterGroup(): void {
    this.filterGroupsFormArray.push(
      this.fb.control({
        operator: 0,
        filters: [{
          name: '',
          value: ''
        }],
        filterGroups: [],
      })
    );

  }


  addFilter(): void {
    this.filtersFormArray.push(this.fb.control({
      name: '',
      value: ''
    }));
  }


  registerOnChange(fn: (value: LDAPFilter | null | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void { }
  setDisabledState?(isDisabled: boolean): void { }

  deleteFilter(i: number): void {
    this.filtersFormArray.removeAt(i);
  }

  deleteGroup(i: number): void {
    this.filterGroupsFormArray.removeAt(i);
  }

  clearGroup(): void {
  }


  public get filtersFormArray(): FormArray {
    return this.form.get('filters') as FormArray;
  }

  public get filterGroupsFormArray(): FormArray {
    return this.form.get('filterGroups') as FormArray;
  }


  private setupObservables() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (this.onChange) {
        this.onChange(value);
      }
    });
  }



}

