import { Injectable } from '@angular/core';
import {Meaning} from '../models/meaning';
import {ActivatedRoute} from '@angular/router';
import {Expression} from '../models/expression';
import {AngularFirestore} from 'angularfire2/firestore';
import {Example} from '../models/example';

@Injectable({
  providedIn: 'root'
})
export class ExpressionService {
    xpn: Expression;

    constructor(private afs: AngularFirestore, private xpnServ: ExpressionService) {
    }

    getEpressionById(id: string): Expression {
        const xpn = new Expression();
        xpn.id = id;
        console.log(id);
        this.afs.doc('/espressions/' + xpn.id).valueChanges().subscribe(xpnDoc => {
            console.log(xpnDoc);
            xpn.text = (<Expression>xpnDoc).text;
            xpn.rating = (<Expression>xpnDoc).rating;
            xpn.type = (<Expression>xpnDoc).type;
            console.log(xpn);
        });
        xpn.meanings = this.getMeaningsByExpressionId(id);
        return xpn;
    }

    getMeaningsByExpressionId(id): Meaning[] {
        const mngs: Meaning[] = [];
        this.afs
            .collection('/meanings', ref => ref.where('expressionId', '==', id))
            .snapshotChanges()
            .subscribe(actions => actions.forEach(action => {
                const mng: Meaning = (<Meaning>action.payload.doc.data());
                mng.id = action.payload.doc.id;
                mng.examples = this.getExamplesByMeaningId(mng.id);
                mngs.push(mng);
            }));
        return mngs;
    }

    getExamplesByMeaningId(id: string): Example[] {
        const xmls: Example[] = [];
        this.afs
            .collection('/examples', ref => ref.where('meaningId', '==', id))
            .snapshotChanges()
            .subscribe(actions => actions.map(action => {
                const xml: Example = <Example>action.payload.doc.data();
                xml.id = action.payload.doc.id;
                xmls.push(xml);
            }));
        return xmls;
    }
}
