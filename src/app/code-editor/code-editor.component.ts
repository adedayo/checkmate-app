import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('codeContainer', { static: true }) codeContainer: ElementRef;
  @Input() code = '#yaml file\n file: sample.txt\n size: 24\n';
  @Output() codeChange = new EventEmitter<string>();


  constructor() { }


  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
  }

}

