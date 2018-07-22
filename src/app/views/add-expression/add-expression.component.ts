import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {Expression} from '../../models/expression';
import {partsofspeeches} from '../../models/parts-of-speeches';
import {languages} from '../../models/languages';
import {expressiontypes} from '../../models/expression-types';
import {Example} from '../../models/example';
import {Meaning} from '../../models/meaning';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-add-expression',
  templateUrl: './add-expression.component.html',
  styleUrls: ['./add-expression.component.css']
})
export class AddExpressionComponent implements OnInit {

    xpnFrm: FormGroup;
    meaning: Function;
    example: Function;
    xpnDoc: AngularFirestoreDocument<Expression>;
    xpn: Observable<Expression>;
    xpnCol: AngularFirestoreCollection<Expression>;
    mngCol: AngularFirestoreCollection<Meaning>;
    xmlCol: AngularFirestoreCollection<Example>;
    xpns: Observable<Expression[]>;
    xpnTypes: string[];
    parts: string[];
    lngs: string[];

    constructor(private afs: AngularFirestore) {
        this.xpnCol = this.afs.collection('espressions');
        this.mngCol = this.afs.collection('meanings');
        this.xmlCol = this.afs.collection('examples');
        this.xpnTypes = expressiontypes;
        this.parts = partsofspeeches;
        this.lngs = languages;
        this.xpnFrm = new FormGroup({
            text: new FormControl('', Validators.required),
            type: new FormControl(null, Validators.required),
            rating: new FormControl(5),
            meanings: new FormArray([])
        });
        this.meaning = (): FormGroup => {
            return new FormGroup({
                text: new FormControl(''),
                partsOfSpeech: new FormControl('noun'),
                language: new FormControl('english'),
                examples: new FormArray([])
            });
        };
        this.example = (): FormGroup => {
            return new FormGroup({
                text: new FormControl('')
            });
        };
        (<FormArray>this.xpnFrm.get('meanings')).push(this.meaning());
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(0).get('examples')).push(this.example());



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
        this.xpnDoc = this.afs.doc<Expression>('/espressions/gicoo2oXbp1J5jLPCe8v');
        this.xpn = this.xpnDoc.valueChanges();
    }

    addMeaning() {
        const numOfMeaing = (<FormArray>this.xpnFrm.get('meanings')).length;
        (<FormArray>this.xpnFrm.get('meanings')).push(this.meaning());
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(numOfMeaing).get('examples')).push(this.example());
    }

    addExample(meaningIndex) {
        (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(meaningIndex).get('examples')).push(this.example());
    }

    save() {
        // console.warn(this.xpnFrm);
        const newXpn = {
            text: this.xpnFrm.get('text').value,
            type: this.xpnFrm.get('type').value,
            rating: this.xpnFrm.get('rating').value
        };
        console.warn(newXpn);
        this.xpnCol.add(newXpn as Expression).then(savedXpnDoc => {
            console.log('Saved Expression - ' + savedXpnDoc.id + ' - New Expression - ' + newXpn.text);
            const mngs = (<FormArray>this.xpnFrm.get('meanings'));
            const mngsLen = mngs.length;
            for (let m = 0; m < mngsLen; m++) {
                if (mngs.at(m).dirty) {
                    const newMng = {
                        text: mngs.at(m).get('text').value,
                        partsOfSpeech: mngs.at(m).get('partsOfSpeech').value,
                        language: mngs.at(m).get('language').value,
                        expressionId: savedXpnDoc.id
                    };
                    console.log(newMng);
                    this.mngCol.add(newMng as Meaning).then(savedMngDoc => {
                        console.log('Saved Meaning - ' + savedMngDoc.id + ' - ' + newMng.text);
                        const xmls = (<FormArray>(<FormArray>this.xpnFrm.get('meanings')).at(m).get('examples'));
                        const xplsLen = xmls.length;
                        for (let p = 0; p < xplsLen; p++) {
                            if (xmls.at(p).dirty) {
                                const newXml = {
                                    text: xmls.at(p).get('text').value,
                                    meaningId: savedMngDoc.id
                                };
                                this.xmlCol.add(newXml as Example).then(savedXmplDoc => {
                                    console.log('Saved Example - ' + savedXmplDoc.id + ' - ' + newXml.text);
                                });
                            }
                        }
                    });
                }
            }
        });
    }

}
// If you don't listen to the news you are uninformed, if you read, you are misinformed.