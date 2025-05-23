import { Component, OnInit } from '@angular/core';
import { LiquidacionService } from 'src/app/services/contabilidad/liquidacion.service';
import { Liquidacion } from 'src/app/models/contabilidad/liquidacion';
import swal from 'sweetalert2';
import { Constantes } from 'src/app/comun/constantes';
declare var $: any;

@Component({
  selector: 'app-liquidaciones',
  templateUrl: './liquidaciones.component.html',
  styles: []
})
export class LiquidacionesComponent implements OnInit {

  listLiquidaciones: Array<Liquidacion>;
  mes: number;
  anio: number;
  nombreMesBuscar:string;
  meses: any;
  nombreMes: string;
  total: number;

  constructor(private liquicionService: LiquidacionService) { 

    this.listLiquidaciones = new Array<Liquidacion>()
    let fecha = new Date()
    this.mes = fecha.getUTCMonth() + 1
    this.anio = fecha.getFullYear()
    this.consultarLiquidacionesPorMes()
    this.meses = Constantes.MESES;
    this.nombreMesBuscar = 'Mes'
    this.setNombreMes()
    let l = new Liquidacion()
    this.total = 0
  }

  ngOnInit() {
    $(document).ready(function () {
      $('#dt-liquidaciones').DataTable(
        {
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        },

      );
    })
  }

  consultarLiquidacionesPorMes(){
    this.liquicionService.getByMes(String(this.mes), String(this.anio)).subscribe((response) => {
      response = JSON.parse(response)
      if (response.code == '1') {

        this.listLiquidaciones = response.msg
        this.setTotal()
      } else {
        swal('Error!', response.msg, 'error');
      }
    }, error => Constantes.handleError(error))
  }

  setMesBuscar(m: number){
    this.mes = m
    this.nombreMesBuscar = Constantes.setNombreMes(String(m))
    this.setNombreMes()

  }
  setNombreMes() {

    switch (this.mes) {
      case 1:
        this.nombreMes = 'ENERO'
        break;
      case 2:
        this.nombreMes = 'FEBRERO'
        break;
      case 3:
        this.nombreMes = 'MARZO'
        break;
      case 4:
        this.nombreMes = 'ABRIL'
        break;
      case 5:
        this.nombreMes = 'MAYO'
        break;
      case 6:
        this.nombreMes = 'JUNIO'
        break;
      case 7:
        this.nombreMes = 'JULIO'
        break;
      case 8:
        this.nombreMes = 'AGOSTO'
        break;
      case 9:
        this.nombreMes = 'SEPTIEMBRE'
        break;
      case 10:
        this.nombreMes = 'OCTUBRE'
        break;
      case 11:
        this.nombreMes = 'NOVIEMBRE'
        break;
      case 12:
        this.nombreMes = 'DICIEMBRE'
        break;
    }
  }

  setTotal(){
    this.total = 0
    this.listLiquidaciones.forEach(l => {
      this.total = this.total + l.valor
    })
  }
}
