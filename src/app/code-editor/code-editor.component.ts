import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('code') code: ElementRef;
  editor: monaco.editor.IStandaloneCodeEditor;

  constructor() { }


  ngAfterViewInit(): void {

    this.editor = monaco.editor.create(this.code.nativeElement, {
      language: 'javascript',
      lineNumbers: 'off',
      minimap: {
        enabled: false,
      },
      value: 'console.log("This is a console log");\n',
      theme: 'vs-dark',
      overviewRulerBorder: false,
    });


    this.editor.setValue('console.log("This is a console log");\n');

  }

  ngOnInit(): void {
  }

}
