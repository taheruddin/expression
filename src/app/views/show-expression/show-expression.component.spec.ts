import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExpressionComponent } from './show-expression.component';

describe('ShowExpressionComponent', () => {
  let component: ShowExpressionComponent;
  let fixture: ComponentFixture<ShowExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
