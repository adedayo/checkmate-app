import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleSidebarComponent } from './toggle-sidebar/toggle-sidebar.component';
import { HeaderComponent } from './header/header.component';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
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
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { MatCardModule } from '@angular/material/card';
import { TabControlModule } from './directives';
import { IncidentListItemComponent } from './incident-list-item/incident-list-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectNameFilterPipe } from './pipes/project-filter.pipe';
import { IssueFilterPipe } from './pipes/issue-filter.pipe';
import { NgxLiquidGaugeModule } from 'ngx-liquid-gauge';
import { DiscoverComponent } from './discover/discover.component';
import { GithubReposComponent } from './github-repos/github-repos.component';
import { GitlabReposComponent } from './gitlab-repos/gitlab-repos.component';
import { GitlabOrderPipe } from './pipes/gitlab-order.pipe';
import { GitlabFilterPipe } from './pipes/gitlab-filter.pipe';
import { GitlabProjectListitemComponent } from './gitlab-project-listitem/gitlab-project-listitem.component';
import { GitlabSettingsComponent } from './gitlab-settings/gitlab-settings.component';
import { GithubSettingsComponent } from './github-settings/github-settings.component';
import { GithubFilterPipe } from './pipes/github-filter.pipe';
import { GithubProjectListitemComponent } from './github-project-listitem/github-project-listitem.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { NgxIsElectronModule } from 'projects/ngx-is-electron/src/public-api';
import { EnvironmentsService } from './services/environments.service';
import { Initialiser } from './initialiseApp';
import { UtcToLocalPipe } from './pipes/utc-to-local.pipe';
import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';
import { SettingsAuthenticationComponent } from './settings-authentication/settings-authentication.component';
import { SettingsCertificatesComponent } from './settings-certificates/settings-certificates.component';
import { SettingsAuthLdapComponent } from './settings-auth-ldap/settings-auth-ldap.component';
import { SettingsAuthIdpComponent } from './settings-auth-idp/settings-auth-idp.component';
import { SettingsAuthManualComponent } from './settings-auth-manual/settings-auth-manual.component';

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
    ProjectSetupComponent,
    CodeEditorComponent,
    ProjectDetailComponent,
    IncidentListItemComponent,
    ProjectNameFilterPipe,
    IssueFilterPipe,
    DiscoverComponent,
    GithubReposComponent,
    GitlabReposComponent,
    GitlabOrderPipe,
    GitlabFilterPipe,
    GitlabProjectListitemComponent,
    GitlabSettingsComponent,
    GithubSettingsComponent,
    GithubFilterPipe,
    GithubProjectListitemComponent,
    ProjectEditComponent,
    UtcToLocalPipe,
    SettingsIntegrationsComponent,
    SettingsAuthenticationComponent,
    SettingsCertificatesComponent,
    SettingsAuthLdapComponent,
    SettingsAuthIdpComponent,
    SettingsAuthManualComponent,
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
    MatGridListModule,
    HttpClientModule,
    FontAwesomeModule,
    MatStepperModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    NgxChartsModule,
    MatSelectModule,
    MatCheckboxModule,
    CodemirrorModule,
    MatCardModule,
    TabControlModule,
    NgxLiquidGaugeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatRadioModule,
    NgxIsElectronModule,
  ],
  providers: [EnvironmentsService,
    {
      provide: APP_INITIALIZER,
      useFactory: Initialiser.initialiseApp,
      deps: [EnvironmentsService],
      multi: true,
    },
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: {
        color: 'primary'
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
