import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DiscoverComponent } from './discover/discover.component';
import { GitServiceGuard } from './guards/git-service.guard';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ProjectSetupComponent } from './project-setup/project-setup.component';
import { ProjectsComponent } from './projects/projects.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'projects', component: ProjectsComponent },
  { path: 'discover', component: DiscoverComponent, canActivate: [GitServiceGuard] },
  { path: 'settings', component: SettingsComponent },
  { path: 'project-setup', component: ProjectSetupComponent },
  { path: 'project-edit/:projectID', component: ProjectEditComponent },
  { path: 'project-detail/:projectID', component: ProjectDetailComponent },
  { path: '**', component: DashboardComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
