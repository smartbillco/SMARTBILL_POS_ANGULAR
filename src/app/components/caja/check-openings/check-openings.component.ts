import { Component, OnInit, Input } from '@angular/core';
import { AperturasCaja } from 'src/app/models/caja/cashOpening';

@Component({
  selector: 'app-check-openings',
  templateUrl: './check-openings.component.html',
  styleUrls: ['./check-openings.component.scss']
})
export class CheckOpeningsComponent implements OnInit {

  @Input() openingList: AperturasCaja;

  constructor() { }

  ngOnInit() {
  }

}
