import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';


let loadedMonaco = false;
let loadPromise: Promise<void>;
@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('codeContainer') codeContainer: ElementRef;
  @Input() code = '#yaml file\n file: sample.txt\n size: 24\n';
  @Output() codeChange = new EventEmitter<string>();
  editor: monaco.editor.IStandaloneCodeEditor;

  constructor() { }


  ngAfterViewInit(): void {

    this.initialiseMonaco();
    // this.editor = monaco.editor.create(this.codeContainer.nativeElement, {
    //   language: 'javascript',
    //   lineNumbers: 'off',
    //   minimap: {
    //     enabled: false,
    //   },
    //   value: '#yaml file\n file: sample.txt\n size: 24\n',
    //   theme: 'vs-dark',
    //   overviewRulerBorder: false,
    // });


    // this.editor.setValue('#yaml file\n file: sample.txt\n size: 24\n');

    // this.editor.onDidChangeCursorPosition(e => console.log(e.position, this.editor.getPosition()));
  }

  initialiseMonaco(): void {
    if (loadedMonaco) {
      // Wait until monaco editor is available
      loadPromise.then(() => {
        this.initMonaco();
      });
    } else {
      loadedMonaco = true;
      loadPromise = new Promise<void>((resolve: any) => {
        if (typeof ((window as any).monaco) === 'object') {
          resolve();
          return;
        }
        const onAmdLoader: any = () => {
          // Load monaco
          (window as any).require.config({ paths: { vs: 'assets/monaco/vs' } });

          (window as any).require(['vs/editor/editor.main'], () => {
            this.initMonaco();
            resolve();
          });
        };

        // Load AMD loader if necessary
        if (!(window as any).require) {
          const loaderScript: HTMLScriptElement = document.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = 'assets/monaco/vs/loader.js';
          loaderScript.addEventListener('load', onAmdLoader);
          document.body.appendChild(loaderScript);
        } else {
          onAmdLoader();
        }
      });
    }
  }

  initMonaco(): void {
    // configure the monaco editor to understand custom language - customLang
    // monaco.languages.register(this.configService.getCustomLangExtensionPoint());
    // monaco.languages.setMonarchTokensProvider('CustomLang', this.configService.getCustomLangTokenProviders());
    // monaco.editor.defineTheme('customLangTheme', this.configService.getCustomLangTheme());   // add your custom theme here

    this.editor = monaco.editor.create(this.codeContainer.nativeElement, {
      value: this.code,
      language: 'yaml',
      theme: 'vs-dark',
    });

    // To support two-way binding of the code
    this.editor.getModel().onDidChangeContent(e => {
      this.codeChange.emit(this.editor.getValue());
    });

    this.editor.onDidChangeCursorPosition(e => {
      console.log(e.position, this.editor.getPosition());
      // this.editor.setPosition(e.position);
    }
    );

  }

  ngOnInit(): void {
  }

}

// MonacoEnvironment = {
//   getWorkerUrl: (workerID: string, label: string) => '',
// };
