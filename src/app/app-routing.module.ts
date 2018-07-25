import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AddExpressionComponent} from './views/add-expression/add-expression.component';
import {HomeComponent} from './views/home/home.component';
import {EditExpressionComponent} from './views/edit-expression/edit-expression.component';
import {ShowExpressionComponent} from './views/show-expression/show-expression.component';

const routes: Routes = [
    { path: 'add', component: AddExpressionComponent },
    { path: 'edit/:id', component: EditExpressionComponent },
    { path: 'show/:id', component: ShowExpressionComponent },
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
