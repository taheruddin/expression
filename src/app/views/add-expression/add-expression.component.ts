import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Expression} from '../../models/expression';
import {Meaning} from '../../models/meaning';
import {Example} from '../../models/example';
import {partsofspeeches} from '../../models/parts-of-speeches';
import {languages} from '../../models/languages';
import {expressiontypes} from '../../models/expression-types';
import {ExpressionService} from '../../services/expression.service';

@Component({
  selector: 'app-add-expression',
  templateUrl: './add-expression.component.html',
  styleUrls: ['./add-expression.component.css']
})
export class AddExpressionComponent implements OnInit {

    xpnFrm: FormGroup;
    meaning: Function;
    example: Function;
    /*xpnDoc: AngularFirestoreDocument<Expression>;
    xpn: Observable<Expression>;*/
    xpnCol: AngularFirestoreCollection<Expression>;
    mngCol: AngularFirestoreCollection<Meaning>;
    xmlCol: AngularFirestoreCollection<Example>;
    xpns: Observable<Expression[]>;
    xpnTypes: string[];
    parts: string[];
    lngs: string[];

    constructor(private router: Router, private afs: AngularFirestore, private xpnServ: ExpressionService) {
        this.xpnCol = this.afs.collection('espressions');
        this.mngCol = this.afs.collection('meanings');
        this.xmlCol = this.afs.collection('examples');
        this.xpnTypes = expressiontypes;
        this.parts = partsofspeeches;
        this.lngs = languages;
        this.xpnFrm = this.xpnServ.getBlankExpressionFormGroup();
        (<FormArray>this.xpnFrm.get('meanings')).push(this.xpnServ.getBlankMeaningFormGroup());
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(0).get('examples'))
            .push(this.xpnServ.getBlankExampleFormGroup());



        // this.xpns = this.xpnCol.valueChanges();
        this.xpns = this.xpnCol.snapshotChanges().pipe(map(actions => {
            return actions.map(action => {
                const dxpn = action.payload.doc.data() as Expression;
                dxpn.id = action.payload.doc.id;
                return dxpn;
            });
        }));
    }

    ngOnInit() {
        /*this.xpnDoc = this.afs.doc<Expression>('/espressions/gicoo2oXbp1J5jLPCe8v');
        this.xpn = this.xpnDoc.valueChanges();*/
    }

    addMeaning() {
        const numOfMeaing = (<FormArray>this.xpnFrm.get('meanings')).length;
        (<FormArray>this.xpnFrm.get('meanings')).push(this.xpnServ.getBlankMeaningFormGroup());
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(numOfMeaing).get('examples'))
            .push(this.xpnServ.getBlankExampleFormGroup());
    }

    addExample(meaningIndex) {
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(meaningIndex).get('examples'))
            .push(this.xpnServ.getBlankExampleFormGroup());
    }

    save() {
        const newXpn = this.xpnServ.formToExpression(this.xpnFrm);
        if (newXpn) {
            this.xpnServ.addExpression(newXpn, (expressionId) => {
                this.router.navigate(['/show/' + expressionId]);
            });
        }
        console.log(newXpn);
    }

}
