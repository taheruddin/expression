import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpressionComponent } from './add-expression.component';

describe('AddExpressionComponent', () => {
  let component: AddExpressionComponent;
  let fixture: ComponentFixture<AddExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
