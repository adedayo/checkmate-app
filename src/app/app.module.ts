import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from "@angular/material/sidenav";
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleSidebarComponent } from './toggle-sidebar/toggle-sidebar.component';
import { HeaderComponent } from './header/header.component';
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from '@angular/material/divider';
import { NgxElectronModule } from "ngx-electron";
import { ProjectsComponent } from './projects/projects.component';
import { SettingsComponent } from './settings/settings.component';
import { FooterComponent } from './footer/footer.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { HttpClientModule } from '@angular/common/http';
import { ProjectSummaryComponent } from './project-summary/project-summary.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProjectSetupComponent } from './project-setup/project-setup.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SidebarComponent,
    ToggleSidebarComponent,
    HeaderComponent,
    ProjectsComponent,
    SettingsComponent,
    FooterComponent,
    ProjectSummaryComponent,
    ProjectSetupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    NgxElectronModule,
    MatGridListModule,
    HttpClientModule,
    FontAwesomeModule,
    MatStepperModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
