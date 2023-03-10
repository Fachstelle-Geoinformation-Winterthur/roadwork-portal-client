/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { NgModule } from '@angular/core';
 import { Routes, RouterModule } from '@angular/router';
 import { ReportComponent } from './report/report.component';
import { UsersComponent } from "./users/users.component";
 import { WelcomeComponent } from './welcome/welcome.component';
 import { LoginComponent } from './login/login.component';
 import { ChooseNeedComponent } from './choose-need/choose-need.component';
 import { ProjectAttributesComponent } from './project-attributes/project-attributes.component';
 import { UserService } from 'src/services/user.service';
import { UserComponent } from './user/user.component';
import { EditNeedMapComponent } from './edit-need-map/edit-need-map.component';
import { ManagementAreasComponent } from './management-areas/management-areas.component';
 
 const routes: Routes = [
   {path: '', component: WelcomeComponent, pathMatch: 'full'},
   {path: 'report', component: ReportComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'chooseneed', component: ChooseNeedComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'need/:id', component: ProjectAttributesComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'map/:id', component: EditNeedMapComponent, pathMatch: 'full', canActivate: [UserService]}, // TODO: remove
   {path: 'users', component: UsersComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'users/:email', component: UserComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'managementareas', component: ManagementAreasComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'login', component: LoginComponent, pathMatch: 'full'}
 ];
 
 @NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule]
 })
 export class AppRoutingModule { }
 