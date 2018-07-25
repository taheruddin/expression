import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFirestore} from 'angularfire2/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor (private db: AngularFireDatabase, private afs: AngularFirestore) {}
  title = 'Interesting Expressions';
  reply: any;

  ngOnInit() {
    this.db.list('expressions').snapshotChanges().subscribe(reply => {
      console.log(reply);
      console.log('after getting reply');
    });
  }
}
