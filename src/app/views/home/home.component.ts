import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from 'rxjs/internal/Observable';
import {Expression} from '../../models/expression';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    xpnCol: AngularFirestoreCollection;
    topRated: Observable<Expression[]>;
    searchWord: string;
    searchResult: Observable<Expression[]>;

    constructor(private afs: AngularFirestore) {
        this.searchWord = '';
        this.xpnCol = this.afs.collection('espressions');
        this.topRated = this.afs
            .collection<Expression>('espressions', ref => ref
                .orderBy('rating', 'desc')
                .limit(5))
            .snapshotChanges()
            .pipe(map(actions => actions.map(
                action => {
                    const xpn: Expression = action.payload.doc.data() as Expression;
                    xpn.id = action.payload.doc.id || '';
                    return xpn;
                }
            )));
    }

    search() {
        this.searchResult = this.afs.collection<Expression>('espressions')
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
