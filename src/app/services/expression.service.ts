import { Injectable } from '@angular/core';
import {Meaning} from '../models/meaning';
import {ActivatedRoute} from '@angular/router';
import {Expression} from '../models/expression';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    DocumentReference
} from 'angularfire2/firestore';
import {Example} from '../models/example';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {reject} from 'q';
import {Observable} from 'rxjs/internal/Observable';
import {from} from 'rxjs/internal/observable/from';
import {after} from 'selenium-webdriver/testing';

@Injectable({
  providedIn: 'root'
})
export class ExpressionService {
    xpnCol: AngularFirestoreCollection;
    mngCol: AngularFirestoreCollection;
    xmlCol: AngularFirestoreCollection;
    xpnColName: string;
    mngColName: string;
    xmlColName: string;

    constructor(private afs: AngularFirestore) {
        this.xpnCol = this.afs.collection('/espressions/');
        this.mngCol = this.afs.collection('/meanings/');
        this.xmlCol = this.afs.collection('/examples/');
        this.xpnColName = '/espressions/';
        this.mngColName = '/meanings/';
        this.xmlColName = '/examples/';
    }

    getFullEpressionById(id: string, done?: Function) {
        const xpn = new Expression();
        xpn.id = id;
        this.afs.doc(this.xpnColName + xpn.id).valueChanges().subscribe(xpnDoc => {
            if (xpnDoc) {
                xpn.text = (<Expression>xpnDoc).text;
                xpn.rating = (<Expression>xpnDoc).rating;
                xpn.type = (<Expression>xpnDoc).type;
                xpn.meanings = [];
                this.afs
                    .collection(this.mngColName , ref => ref.where('expressionId', '==', id))
                    .snapshotChanges()
                    .subscribe(mctions => {
                        if (mctions.length === 0 && done) {
                            done(xpn);
                        }
                        mctions.forEach((mction, mi) => {
                            const mng: Meaning = (<Meaning>mction.payload.doc.data());
                            mng.id = mction.payload.doc.id;
                            mng.examples = [];
                            this.afs
                                .collection(this.xmlColName , ref => ref.where('meaningId', '==', mng.id))
                                .snapshotChanges()
                                .subscribe(ections => {
                                    if (ections.length === 0 && mi === mctions.length - 1 && done) {
                                        done(xpn);
                                    }
                                    ections.forEach((ection, ei) => {
                                        const xml: Example = <Example>ection.payload.doc.data();
                                        xml.id = ection.payload.doc.id;
                                        xpn.meanings[mi].examples.push(xml);
                                        if (mi === mctions.length - 1 && ei === ections.length - 1 && done) {
                                            done(xpn);
                                        }
                                    });
                                });
                            xpn.meanings.push(mng);
                        });
                    });

            } else {
                xpn.text = 'Expression not found!';
            }
        });
    }

    getEpressionById(id: string): Expression {
        const xpn = new Expression();
        xpn.id = id;
        this.afs.doc(this.xpnColName + xpn.id).valueChanges().subscribe(xpnDoc => {
            if (xpnDoc) {
                xpn.text = (<Expression>xpnDoc).text;
                xpn.rating = (<Expression>xpnDoc).rating;
                xpn.type = (<Expression>xpnDoc).type;
            } else {
                xpn.text = 'Expression not found!';
            }
        });
        xpn.meanings = this.getMeaningsByExpressionId(id);
        return xpn;
    }

    getMeaningsByExpressionId(id: string): Meaning[] {
        const mngs: Meaning[] = [];
        this.afs
            .collection(this.mngColName , ref => ref.where('expressionId', '==', id))
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
            .collection(this.xmlColName , ref => ref.where('meaningId', '==', id))
            .snapshotChanges()
            .subscribe(actions => actions.map(action => {
                const xml: Example = <Example>action.payload.doc.data();
                xml.id = action.payload.doc.id;
                xmls.push(xml);
            }));
        return xmls;
    }

    addExpression(xpn: Expression): Promise<DocumentReference> {
        const newXpn = {
            text: xpn.text,
            type: xpn.type,
            rating: xpn.rating
        };
        return this.xpnCol.add(newXpn);
    }

    addMeaning(mng: Meaning): Promise<DocumentReference> {
        const newMng = {
            text: mng.text,
            partsOfSpeech: mng.partsOfSpeech,
            language: mng.language,
            expressionId: mng.expressionId
        };
        return this.mngCol.add(newMng);
    }

    addExample(xml: Example): Promise<DocumentReference> {
        const newXml = {
            text: xml.text,
            meaningId: xml.meaningId
        };
        return this.xmlCol.add(newXml);
    }

    addAll(xpn: Expression, allDone?: Function) {
        this.addExpression(xpn).then(addedXpnDoc => {
            const mngs = xpn.meanings;
            const mngsLen = mngs.length;
            if (mngsLen === 0 && allDone) {
                allDone(addedXpnDoc.id);
            } else {
                for (let m = 0; m < mngsLen; m++) {
                    mngs[m].expressionId = addedXpnDoc.id;
                    this.addMeaning(mngs[m]).then(addedMngDoc => {
                        const xmls = mngs[m].examples;
                        const xmlsLen = xmls.length;
                        if (!xmlsLen && m === mngsLen - 1 && allDone) {
                            allDone(addedXpnDoc.id);
                        } else {
                            for (let p = 0; p < xmlsLen; p++) {
                                xmls[p].meaningId = addedMngDoc.id;
                                this.addExample(xmls[p]).then(addedXmlDoc => {
                                    if (m === mngsLen - 1 && p === xmlsLen - 1 && allDone) {
                                        allDone(addedXpnDoc.id);
                                    }
                                }).catch(reason => {
                                    console.log(`Adding ${p}th example of ${m}th meaning failed!`);
                                });
                            }
                        }
                    }).catch(reason => {
                        console.log(`Adding ${m}th meaning failed!`);
                    });
                }
            }
        }).catch(reason => {
            console.log('Adding expression failed!');
            return false;
        });
    }

    formToExpression(xpnFrm: FormGroup): Expression |false {
        if (xpnFrm.dirty) {
            const newXpn: Expression = {
                id: (xpnFrm.get('id') && xpnFrm.get('id').value) || '',
                text: xpnFrm.get('text').value,
                type: xpnFrm.get('type').value,
                rating: xpnFrm.get('rating').value,
                meanings: []
            };
            const mngs = (<FormArray>xpnFrm.get('meanings'));
            const mngsLen = mngs.length;
            for (let m = 0; m < mngsLen; m++) {
                const newMeaning = this.formToMeaning(<FormGroup>mngs.at(m));
                if (newMeaning) {
                    newXpn.meanings.push(newMeaning);
                }
            }
            return newXpn;
        } else {
            return false;
        }
    }

    formToMeaning(mngForm: FormGroup): Meaning | false {
        if (mngForm.dirty) {
            const newMng: Meaning = {
                expressionId: '',
                text: mngForm.get('text').value,
                partsOfSpeech: mngForm.get('partsOfSpeech').value,
                language: mngForm.get('language').value,
                examples: []
            };
            const xmls = (<FormArray>mngForm.get('examples'));
            const xplsLen = xmls.length;
            for (let p = 0; p < xplsLen; p++) {
                const newXml = this.formToExample(<FormGroup>xmls.at(p));
                if (newXml) {
                    newMng.examples.push(newXml);
                }
            }
            return newMng;
        } else {
            return false;
        }
    }

    formToExample(xmlForm: FormGroup): Example | false {
        if (xmlForm.dirty) {
            const newXml: Example = {
                meaningId: '',
                text: xmlForm.get('text').value
            };
            return newXml;
        } else {
            return false;
        }
    }

    expressionToForm(xpn: Expression): FormGroup {
        const mngsFA = new FormArray([]);
        xpn.meanings.forEach(mng => {
            const xmlsFA = new FormArray([]);
            mng.examples.forEach(xml => {
                xmlsFA.push(new FormGroup({
                    id: new FormControl(xml.id),
                    meaningId: new FormControl(xml.meaningId),
                    text: new FormControl(xml.text, Validators.required)
                }));
            });
            mngsFA.push(new FormGroup({
                id: new FormControl(mng.id),
                text: new FormControl(mng.text, Validators.required),
                partsOfSpeech: new FormControl(mng.partsOfSpeech),
                language: new FormControl(mng.language),
                examples: xmlsFA
            }));
        });
        return new FormGroup({
            id: new FormControl(xpn.id),
            text: new FormControl(xpn.text, Validators.required),
            type: new FormControl(xpn.type),
            rating: new FormControl(xpn.rating),
            meanings: mngsFA
        });
    }

    getBlankExpressionFormGroup() {
        return new FormGroup({
            id: new FormControl(''),
            text: new FormControl('', Validators.required),
            type: new FormControl(null, Validators.required),
            rating: new FormControl(5),
            meanings: new FormArray([])
        });
    }

    getBlankMeaningFormGroup() {
        return new FormGroup({
            id: new FormControl(''),
            text: new FormControl('', Validators.required),
            partsOfSpeech: new FormControl('noun'),
            language: new FormControl('english'),
            examples: new FormArray([])
        });
    }

    getBlankExampleFormGroup() {
        return new FormGroup({
            id: new FormControl(''),
            text: new FormControl('', Validators.required)
        });
    }
}
