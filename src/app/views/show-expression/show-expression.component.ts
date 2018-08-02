import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Expression} from '../../models/expression';
import {AngularFirestore} from 'angularfire2/firestore';
import {ExpressionService} from '../../services/expression.service';

@Component({
  selector: 'app-show-expression',
  templateUrl: './show-expression.component.html',
  styleUrls: ['./show-expression.component.css']
})
export class ShowExpressionComponent implements OnInit {
    xpn: Expression;

    constructor(private route: ActivatedRoute, private afs: AngularFirestore, private xpnServ: ExpressionService) {
        this.xpn = this.xpnServ.getEpressionById(this.route.snapshot.params['id']);
    }

    ngOnInit() {
    }

}
