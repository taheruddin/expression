import { TestBed, inject } from '@angular/core/testing';

import { ExpressionService } from './expression.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';

class MockAngularFirestore {
    collection() {
        return ({});
    }
}

describe('ExpressionService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExpressionService,
                {
                    provide: AngularFirestore, useClass: MockAngularFirestore
                }
            ]
        });
    });

    it('should be created', inject([ExpressionService], (service: ExpressionService) => {
        expect(service).toBeTruthy();
    }));

    it('getBlankExpressionFormGroup should return a FromGroup with corresponding FormControls',
        inject([ExpressionService], (xpnServ: ExpressionService) => {
            const blankExpressionForm = xpnServ.getBlankExpressionFormGroup();
            expect(blankExpressionForm.get('text').value).toBe('');
            expect(blankExpressionForm.get('type').value).toBe(null);
            expect(blankExpressionForm.get('rating').value).toBe(5);
            expect(blankExpressionForm.get('meanings') instanceof FormArray).toBe(true);
        })
    );

    it('getBlankMeaningFormGroup should return a FromGroup with corresponding FormControls',
        inject([ExpressionService], (xpnServ: ExpressionService) => {
            const blankMeaningForm = xpnServ.getBlankMeaningFormGroup();
            expect(blankMeaningForm.get('text').value).toBe('');
            expect(blankMeaningForm.get('partsOfSpeech').value).toBe('noun');
            expect(blankMeaningForm.get('language').value).toBe('english');
            expect(blankMeaningForm.get('examples') instanceof FormArray).toBe(true);
        })
    );

    it('getBlankExampleFormGroup should return a FromGroup with corresponding FormControls',
        inject([ExpressionService], (xpnServ: ExpressionService) => {
            const blankExampleForm = xpnServ.getBlankExampleFormGroup();
            expect(blankExampleForm.get('text').value).toBe('');
        })
    );
});
