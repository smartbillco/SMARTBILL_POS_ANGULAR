import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuracion-impresion',
  templateUrl: './configuracion-impresion.component.html',
  styleUrls: ['./configuracion-impresion.component.scss']
})
export class ConfiguracionImpresionComponent implements OnInit {

  constructor() { }

  tipoSeleccionado: string = 'tiquete';

  ngOnInit() {
    const guardado = sessionStorage.getItem('tipo_impresion');
    this.tipoSeleccionado = guardado ? guardado : 'tiquete';
  }

  guardarConfiguracion() {
    sessionStorage.setItem('tipo_impresion', this.tipoSeleccionado);
    alert('Tipo de impresión guardado: ' + this.tipoSeleccionado.toUpperCase());
  }
}
