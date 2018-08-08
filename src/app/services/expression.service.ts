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
import {last, take, takeLast} from 'rxjs/operators';

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
        this.afs.doc(this.xpnColName + xpn.id).valueChanges().pipe(take(1)).subscribe(xpnDoc => {
            if (xpnDoc) {
                xpn.text = (<Expression>xpnDoc).text;
                xpn.rating = (<Expression>xpnDoc).rating;
                xpn.type = (<Expression>xpnDoc).type;
                xpn.meanings = [];
                this.afs
                    .collection(this.mngColName , ref => ref.where('expressionId', '==', id))
                    .snapshotChanges().pipe(take(1))
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
                                .snapshotChanges().pipe(take(1))
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

    addMeaning(mng: Meaning, expressionId?: string): Promise<DocumentReference> {
        const newMng = {
            text: mng.text,
            partsOfSpeech: mng.partsOfSpeech,
            language: mng.language,
            expressionId: mng.expressionId || expressionId || ''
        };
        return this.mngCol.add(newMng);
    }

    addExample(xml: Example, meaningId?: string): Promise<DocumentReference> {
        const newXml = {
            text: xml.text,
            meaningId: xml.meaningId || meaningId || ''
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

    formToExpression(xpnFrm: FormGroup): Expression {
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
    }

    formToMeaning(mngForm: FormGroup): Meaning {
        const newMng: Meaning = {
            id: (mngForm.get('id') && mngForm.get('id').value) || '',
            expressionId: (mngForm.get('expressionId') && mngForm.get('expressionId').value) || '',
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
    }

    formToExample(xmlForm: FormGroup): Example {
        const newXml: Example = {
            id: (xmlForm.get('id') && xmlForm.get('id').value) || '',
            meaningId: (xmlForm.get('meaningId') && xmlForm.get('meaningId').value) || '',
            text: xmlForm.get('text').value
        };
        return newXml;
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
            type: new FormControl(xpn.type, Validators.required),
            rating: new FormControl(xpn.rating),
            meanings: mngsFA
        });
    }

    updateAll(xpn: Expression, fG: FormGroup, done?: Function) {
        const upXpn = {};
        ['text', 'type', 'rating'].forEach(field => {
            if (fG.get(field).dirty) {
                upXpn[field] = xpn[field];
            }
        });
        if (Object.keys(upXpn).length) {
            this.afs.doc(this.xpnColName + xpn.id)
                .update(upXpn).then(result => {
                this.updateOrAddMeanings(xpn.meanings, (<FormArray>fG.get('meanings')), xpn.id, done);
            }).catch(reason => {
                console.log(reason);
            });
        } else {
            this.updateOrAddMeanings(xpn.meanings, (<FormArray>fG.get('meanings')), xpn.id, done);
        }
    }

    updateOrAddMeanings(meanings: Meaning[], mngsFA: FormArray, expressionId: string, done: Function) {
        let modified = false;
        meanings.forEach((mng , index) => {
            if (mng.id) {
                if (mngsFA.at(index).dirty) {
                    modified = true;
                    const upMng = {};
                    ['text', 'partsOfSpeech', 'language'].forEach(field => {
                        if (mngsFA.at(index).get(field).dirty) {
                            upMng[field] = mng[field];
                        }
                    });
                    if (Object.keys(upMng).length) {
                        this.afs.doc(this.mngColName + mng.id)
                            .update({text: mng.text}) // double view issue triggers here
                            .then(response => {
                                if (done && index === meanings.length - 1) {
                                    this.updateOrAddExamples(
                                        mng.examples,
                                        (<FormArray>mngsFA.at(index).get('examples')),
                                        mng.id,
                                        done
                                    );
                                } else {
                                    this.updateOrAddExamples(
                                        mng.examples,
                                        (<FormArray>mngsFA.at(index).get('examples'))
                                    );
                                }
                            })
                            .catch(reason => {console.log(reason); });
                    } else {
                        if (done && index === meanings.length - 1) {
                            this.updateOrAddExamples(
                                mng.examples,
                                (<FormArray>mngsFA.at(index).get('examples')),
                                mng.id,
                                done
                            );
                        } else {
                            this.updateOrAddExamples(
                                mng.examples,
                                (<FormArray>mngsFA.at(index).get('examples')),
                                mng.id
                            );
                        }
                    }
                }
            } else {
                modified = true;
                this.addMeaning(mng, expressionId)
                    .then(addedMngDoc => {
                        mng.examples.forEach(xml => {
                            xml.meaningId = addedMngDoc.id;
                        });
                        if (done && index === meanings.length - 1) {
                            this.updateOrAddExamples(
                                mng.examples,
                                (<FormArray>mngsFA.at(index).get('examples')),
                                mng.id,
                                done
                            );
                        } else {
                            this.updateOrAddExamples(
                                mng.examples,
                                (<FormArray>mngsFA.at(index).get('examples')),
                                mng.id
                            );
                        }
                    })
                    .catch(reason => {console.log(reason); });
            }
        });
        if (!modified) {
            done();
        }
    }

    updateOrAddExamples(examples: Example[], xmlsFA: FormArray, meaningId?: string, done?: Function) {
        let modified = false;
        examples.forEach((xml , index) => {
            if (xml.id) {
                if (xmlsFA.at(index).dirty) {
                    modified = true;
                    this.afs.doc(this.xmlColName + xml.id)
                        .update({text: xml.text})
                        .then(response => {
                            if (done && index === examples.length - 1) {
                                done();
                            }
                        })
                        .catch(reason => {console.log(reason); });
                }
            } else {
                modified = true;
                this.addExample(xml, meaningId)
                    .then(response => {
                        console.log(response);
                        if (done && index === examples.length - 1) {
                            done();
                        }
                    })
                    .catch(reason => {console.log(reason); });
            }
        });
        if (!modified) {
            done();
        }
    }

    deleteMeanings(ids: string[], done?: Function) {
        ids.forEach((id, index) => {
            this.afs.doc(this.mngColName + id).delete().then(response => {
                if (index === ids.length - 1 && done) {
                    done();
                }
            }).catch(reason => {
                console.log(reason);
            });
        });
    }

    deleteExamples(ids: string[], done?: Function) {
        ids.forEach((id, index) => {
            this.afs.doc(this.xmlColName + id).delete().then(response => {
                if (index === ids.length - 1 && done) {
                    done();
                }
            }).catch(reason => {
                console.log(reason);
            });
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
