import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-crear-receta',
  templateUrl: './crear-receta.component.html',
  styleUrls: ['./crear-receta.component.scss']
})
export class CrearRecetaComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $("#modal-receta").modal('show');
  }

}
