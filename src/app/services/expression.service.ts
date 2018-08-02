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
    xpn: Expression;
    xpnCol: AngularFirestoreCollection;
    mngCol: AngularFirestoreCollection;
    xmlCol: AngularFirestoreCollection;

    constructor(private afs: AngularFirestore) {
        this.xpnCol = this.afs.collection('/espressions/');
        this.mngCol = this.afs.collection('/meanings/');
        this.xmlCol = this.afs.collection('/examples/');
    }

    getEpressionById(id: string): Expression {
        const xpn = new Expression();
        xpn.id = id;
        console.log(id);
        this.afs.doc('/espressions/' + xpn.id).valueChanges().subscribe(xpnDoc => {
            console.log(xpnDoc);
            if (xpnDoc) {
                xpn.text = (<Expression>xpnDoc).text;
                xpn.rating = (<Expression>xpnDoc).rating;
                xpn.type = (<Expression>xpnDoc).type;
            } else {
                xpn.text = 'Expression not found!';
            }
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

    addExpressionO(xpn: Expression): Promise<DocumentReference> {
        const newXpn = {
            text: xpn.text,
            type: xpn.type,
            rating: xpn.rating
        };
        return this.xpnCol.add(newXpn);
    }

    addMeaningO(mng: Meaning): Promise<DocumentReference> {
        const newMng = {
            text: mng.text,
            partsOfSpeech: mng.partsOfSpeech,
            language: mng.language,
            expressionId: mng.expressionId
        };
        return this.mngCol.add(newMng);
    }

    addExampleO(xml: Example): Promise<DocumentReference> {
        const newXml = {
            text: xml.text,
            meaningId: xml.meaningId
        };
        return this.xmlCol.add(newXml);
    }

    addAll(xpn: Expression, allDone?: Function) {
        this.addExpressionO(xpn).then(addedXpnDoc => {
            const mngs = xpn.meanings;
            const mngsLen = mngs.length;
            if (mngsLen === 0 && allDone) {
                allDone(addedXpnDoc.id);
            } else {
                for (let m = 0; m < mngsLen; m++) {
                    mngs[m].expressionId = addedXpnDoc.id;
                    this.addMeaningO(mngs[m]).then(addedMngDoc => {
                        const xmls = mngs[m].examples;
                        const xmlsLen = xmls.length;
                        if (!xmlsLen && m === mngsLen - 1 && allDone) {
                            allDone(addedXpnDoc.id);
                        } else {
                            for (let p = 0; p < xmlsLen; p++) {
                                xmls[p].meaningId = addedMngDoc.id;
                                this.addExampleO(xmls[p]).then(addedXmlDoc => {
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
        });
    }

    /*addExpression(xpn: Expression, after?: Function, before?: Function) {
        if (before) {
            before();
        }
        const newXpn = {
            text: xpn.text,
            type: xpn.type,
            rating: xpn.rating
        };
        this.xpnCol.add(newXpn).then(savedXpnDoc => {
            const mngs = xpn.meanings;
            const mngsLen = mngs.length;
            if (mngsLen === 0) {
                if (after) {
                    after(savedXpnDoc.id);
                }
            } else {
                for (let m = 0; m < mngsLen; m++) {
                    mngs[m].expressionId = savedXpnDoc.id;
                    if (m === (mngsLen - 1)) {
                        this.addManing(mngs[m], savedXpnDoc.id, after || undefined);
                    } else {
                        this.addManing(mngs[m], savedXpnDoc.id);
                    }
                }
            }
        });
    }*/

    /*addManing(mng: Meaning, expressionId: string, after?: Function, before?: Function) {
        if (before) {
            before();
        }
        const newMng = {
            text: mng.text,
            partsOfSpeech: mng.partsOfSpeech,
            language: mng.language,
            expressionId: mng.expressionId
        };
        this.mngCol.add(newMng).then(savedMngDoc => {
            const xmls = mng.examples;
            const xplsLen = xmls.length;
            if (xplsLen === 0) {
                if (after) {
                    after(expressionId);
                }
            } else {
                for (let p = 0; p < xplsLen; p++) {
                    xmls[p].meaningId = savedMngDoc.id;
                    if (p === (xplsLen - 1)) {
                        this.addExample(xmls[p], expressionId, savedMngDoc.id, after || undefined);
                    } else {
                        this.addExample(xmls[p], expressionId, savedMngDoc.id);
                    }
                }
            }
        });
    }*/

    /*addExample(xml: Example, expressionId: string, meaningId: string, after?: Function, before?: Function) {
        if (before) {
            before();
        }
        const newXml = {
            text: xml.text,
            meaningId: xml.meaningId
        };
        this.xmlCol.add(newXml as Example).then(savedXmplDoc => {
            if (after) {
                after(expressionId);
            }
        });
    }*/

    formToExpression(xpnFrm: FormGroup): Expression |false {
        if (xpnFrm.dirty) {
            const newXpn: Expression = {
                id: '',
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

    getBlankExpressionFormGroup() {
        return new FormGroup({
            text: new FormControl('', Validators.required),
            type: new FormControl(null, Validators.required),
            rating: new FormControl(5),
            meanings: new FormArray([])
        });
    }

    getBlankMeaningFormGroup() {
        return new FormGroup({
            text: new FormControl(''),
            partsOfSpeech: new FormControl('noun'),
            language: new FormControl('english'),
            examples: new FormArray([])
        });
    }

    getBlankExampleFormGroup() {
        return new FormGroup({
            text: new FormControl('')
        });
    }
}
