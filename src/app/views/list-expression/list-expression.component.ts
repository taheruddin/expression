import { Component, OnInit } from '@angular/core';
import {ExpressionService} from '../../services/expression.service';
import {expressiontypes} from '../../models/expression-types';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/internal/Observable';
import {Expression} from '../../models/expression';

@Component({
  selector: 'app-list-expression',
  templateUrl: './list-expression.component.html',
  styleUrls: ['./list-expression.component.css']
})
export class ListExpressionComponent implements OnInit {
    type: FormControl = new FormControl('metaphore');
    xpnTypes = expressiontypes;
    xpns: Observable<Expression[]>;

    constructor(private xpnServ: ExpressionService) {
        this.getExpressions(this.type.value);
    }

    getExpressions(type: String|null) {
        if (type) {
            this.xpns = this.xpnServ.getExpressionsByType(type);
        } else {
            this.xpns = this.xpnServ.getAllExpressions();
        }
    }

    ngOnInit() {
    }

}
