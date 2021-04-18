import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  code = 'console.log("This is a console log");';
  constructor() { }

  ngOnInit(): void {

  }

}
