import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Expression} from '../../models/expression';

@Component({
  selector: 'app-add-expression',
  templateUrl: './add-expression.component.html',
  styleUrls: ['./add-expression.component.css']
})
export class AddExpressionComponent implements OnInit {

    xpnDoc: AngularFirestoreDocument<Expression>;
    xpn: Observable<Expression>;
    xpnCol: AngularFirestoreCollection<Expression>;
    xpns: Observable<Expression[]>;
    snap: any;

    constructor(private afs: AngularFirestore) {
        this.xpnCol = this.afs.collection('espressions');
        this.xpns = this.xpnCol.valueChanges();
    }

    ngOnInit() {
        this.xpnDoc = this.afs.doc<Expression>('/espressions/gicoo2oXbp1J5jLPCe8v');
        this.xpn = this.xpnDoc.valueChanges();
        this.snap = this.xpnDoc.snapshotChanges();
    }

}
