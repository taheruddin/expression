import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from 'rxjs/internal/Observable';
import {Expression} from '../../models/expression';
import {map} from 'rxjs/operators';
import {ExpressionService} from '../../services/expression.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    xpnCol: AngularFirestoreCollection;
    topRated: Observable<Expression[]>;
    searchWord = '';
    searchResult: Observable<Expression[]>;

    constructor(private afs: AngularFirestore, private xpnServ: ExpressionService) {
    }

    search() {
        this.searchResult = this.afs.collection<Expression>(this.xpnServ.xpnColName)
            .snapshotChanges()
            .pipe(map(actions => actions.filter(action => {
                return action.payload.doc.data().text && action.payload.doc.data().text.includes(this.searchWord.toLowerCase());
            })), map(actions => actions.map(
                action => {
                    const xpn = action.payload.doc.data();
                    xpn.id = action.payload.doc.id;
                    return xpn;
                }
            )), );
    }

    ngOnInit() {
    }

}
