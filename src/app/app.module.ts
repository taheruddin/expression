import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
// import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddExpressionComponent } from './views/add-expression/add-expression.component';
import { HomeComponent } from './views/home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { EditExpressionComponent } from './views/edit-expression/edit-expression.component';
import { ShowExpressionComponent } from './views/show-expression/show-expression.component';


@NgModule({
    declarations: [
        AppComponent,
        AddExpressionComponent,
        HomeComponent,
        EditExpressionComponent,
        ShowExpressionComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireDatabaseModule,
        NgbModule.forRoot()
    ],
    /*providers: [AngularFireDatabase, AngularFirestoreModule],*/
    bootstrap: [AppComponent]
})
export class AppModule { }
