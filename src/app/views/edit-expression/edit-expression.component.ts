import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ExpressionService} from '../../services/expression.service';
import {Expression} from '../../models/expression';
import {FormArray, FormGroup} from '@angular/forms';
import {languages} from '../../models/languages';
import {expressiontypes} from '../../models/expression-types';
import {partsofspeeches} from '../../models/parts-of-speeches';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {reject} from 'q';

@Component({
  selector: 'app-edit-expression',
  templateUrl: './edit-expression.component.html',
  styleUrls: ['./edit-expression.component.css']
})
export class EditExpressionComponent implements OnInit {
    @ViewChild('confirmer') cfmr: ElementRef;
    id: string;
    xpn: Expression;
    xFG: FormGroup;
    xpnTypes: string[];
    parts: string[];
    lngs: string[];
    mngsToDel: string[];
    xmlsToDel: string[];
    mHigh: number;
    eHigh: {m: number, e: number};

    constructor(private route: ActivatedRoute,
                private router: Router,
                private xpnServ: ExpressionService,
                private modalServ: NgbModal) {
        this.xpnTypes = expressiontypes;
        this.parts = partsofspeeches;
        this.lngs = languages;
        this.mngsToDel = [];
        this.xmlsToDel = [];
        this.mHigh = -1;
        this.eHigh = {m: -1, e: -1};
        this.id = this.route.snapshot.params['id'];
        this.xpnServ.getFullEpressionById(this.id, xpn => {
            this.xpn = xpn;
            this.xFG = this.xpnServ.expressionToForm(this.xpn);
        });
    }

    ngOnInit() {
    }

    addMeaning() {
        const numOfMeaing = (<FormArray>this.xFG.get('meanings')).length;
        (<FormArray>this.xFG.get('meanings')).push(this.xpnServ.getBlankMeaningFormGroup());
        (<FormArray>(<FormArray>this.xFG.get('meanings')).at(numOfMeaing).get('examples'))
            .push(this.xpnServ.getBlankExampleFormGroup());
    }

    addExample(meaningIndex) {
        (<FormArray>(<FormArray>this.xFG.get('meanings')).at(meaningIndex).get('examples'))
            .push(this.xpnServ.getBlankExampleFormGroup());
    }

    overMeaning(meaningIndex) {
        this.mHigh = meaningIndex;
    }

    leaveMeaning(meaningIndex) {
        this.mHigh = -1;
    }

    overExample(meaningIndex, exampleIndex) {
        this.eHigh.m = meaningIndex;
        this.eHigh.e = exampleIndex;
    }

    leaveExample(meaningIndex, exampleIndex) {
        this.eHigh.m = -1;
        this.eHigh.e = -1;
    }

    removeMeaning(meaningIndex) {
        this.modalServ.open(this.cfmr).result.then(result => {
            const mngId = (<FormArray>this.xFG.get('meanings')).at(meaningIndex).get('id').value;
            if (mngId) {
                this.mngsToDel.push(mngId);
                this.xpn.meanings[meaningIndex].examples.forEach(xml => {
                    this.xmlsToDel.push(xml.id);
                });
            }
            (<FormArray>this.xFG.get('meanings')).removeAt(meaningIndex);
        }).catch(reason => {
            // console.log(reason);
        });
    }

    removeExample(meaningIndex: number, exampleIndex: number) {
        this.modalServ.open(this.cfmr).result.then(result => {
            const eid = (<FormArray>(<FormArray>this.xFG.get('meanings'))
                .at(meaningIndex)
                .get('examples'))
                .at(exampleIndex)
                .get('id')
                .value;
            if (eid) {
                this.xmlsToDel.push(eid);
            }
            (<FormArray>(<FormArray>this.xFG.get('meanings'))
                .at(meaningIndex)
                .get('examples'))
                .removeAt(exampleIndex);
        }).catch(reason => {
            // console.log(reason);
        });

    }

    save() {
        console.log(this.xpn);
        const unqXmlsDel = Array.from(new Set(this.xmlsToDel));
        const unqMngsDel = Array.from(new Set(this.mngsToDel));
        console.log(unqXmlsDel);
        console.log(unqMngsDel);
        const up = this.xpnServ.formToExpression(this.xFG);
        if (unqXmlsDel.length && unqMngsDel.length) {
            this.xpnServ.deleteExamples(unqXmlsDel, () => {
                this.xpnServ.deleteMeanings(unqMngsDel, () => {
                    if (this.xFG.dirty) {
                        this.xpnServ.updateAll(up, this.xFG, () => {
                            this.router.navigate(['/show/' + this.xpn.id]);
                        });
                    } else {
                        this.router.navigate(['/show/' + this.xpn.id]);
                    }
                });
            });
        } else if (unqXmlsDel.length) {
            this.xpnServ.deleteExamples(unqXmlsDel, () => {
                if (this.xFG.dirty) {
                    this.xpnServ.updateAll(up, this.xFG, () => {
                        this.router.navigate(['/show/' + this.xpn.id]);
                    });
                } else {
                    this.router.navigate(['/show/' + this.xpn.id]);
                }
            });
        } else if (unqMngsDel.length) {
            this.xpnServ.deleteMeanings(unqMngsDel, () => {
                if (this.xFG.dirty) {
                    this.xpnServ.updateAll(up, this.xFG, () => {
                        this.router.navigate(['/show/' + this.xpn.id]);
                    });
                } else {
                    this.router.navigate(['/show/' + this.xpn.id]);
                }
            });
        } else {
            if (this.xFG.dirty) {
                this.xpnServ.updateAll(up, this.xFG, () => {
                    this.router.navigate(['/show/' + this.xpn.id]);
                });
            } else {
                this.router.navigate(['/show/' + this.xpn.id]);
            }
        }

    }
}
