import { Component, OnInit } from '@angular/core';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  version = '0.0.0'
  constructor(private checkmate: CheckMateService) { }

  ngOnInit(): void {
    this.checkmate.getVersion().subscribe(v => {
      console.log("Footer got", v);
      this.version = v
    })
  }

}
