import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
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
    xpnCol: AngularFirestoreCollection<Expression>;
    mngCol: AngularFirestoreCollection<Meaning>;
    xmlCol: AngularFirestoreCollection<Example>;
    xpns: Observable<Expression[]>;
    xpnTypes: string[];
    parts: string[];
    lngs: string[];

    constructor(private router: Router, private xpnServ: ExpressionService) {
        this.xpnTypes = expressiontypes;
        this.parts = partsofspeeches;
        this.lngs = languages;
        this.xpnFrm = this.xpnServ.getBlankExpressionFormGroup();
        (<FormArray>this.xpnFrm.get('meanings')).push(this.xpnServ.getBlankMeaningFormGroup());
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(0).get('examples'))
            .push(this.xpnServ.getBlankExampleFormGroup());
    }

    ngOnInit() {
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
            this.xpnServ.addAll(newXpn, expressionId => {
                this.router.navigate(['/show/' + expressionId]);
            });
        }
    }

}
