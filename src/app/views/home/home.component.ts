import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from 'rxjs/internal/Observable';
import {Expression} from '../../models/expression';
import {filter, map} from 'rxjs/operators';

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
            .collection<Expression>('espressions', ref => ref.orderBy('rating', 'desc'))
            .snapshotChanges()
            .pipe(map(actions => actions.map(
                action => {
                    const xpn: Expression = action.payload.doc.data() as Expression;
                    xpn.id = action.payload.doc.id || '';
                    return xpn;
                }
            )));
        this.topRated.subscribe(value => console.log(value));
    }

    search() {
        console.log('searching ...');
        /*this.searchResult = [];
        this.afs.collection<Expression>('espressions')
            .snapshotChanges()
            .subscribe(actons => actons.map(action => {
                console.log(action.payload.doc.data());
                const xpn: Expression = action.payload.doc.data();
                if (xpn.text && xpn.text.includes('f')) {
                    this.searchResult.push(xpn);
                }
            }));*/
        // this.searchResult = [];
        this.searchResult = this.afs.collection<Expression>('espressions')
            .snapshotChanges()
            .pipe(map(actions => actions.filter(action => {
                console.log(action);
                return action.payload.doc.data().text && action.payload.doc.data().text.includes('f');
            })), map(actions => actions.map(
                action => {
                    const xpn = action.payload.doc.data();
                    xpn.id = action.payload.doc.id;
                    console.log(xpn);
                    return xpn;
                }
            )), );
    }

    ngOnInit() {
    }

}
