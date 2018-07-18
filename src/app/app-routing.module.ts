import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AddExpressionComponent} from './views/add-expression/add-expression.component';
import {HomeComponent} from './views/home/home.component';

const routes: Routes = [
    { path: 'add-expression', component: AddExpressionComponent },
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
