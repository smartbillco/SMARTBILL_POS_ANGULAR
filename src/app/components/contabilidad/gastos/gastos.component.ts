import { Component, OnInit } from '@angular/core';
import { GastosService } from 'src/app/services/contabilidad/gastos.service';
import { Gastos } from 'src/app/models/contabilidad/gastos';
import { Constantes } from 'src/app/comun/constantes';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styles: []
})
export class GastosComponent implements OnInit {

  listGastos: Array<Gastos>;
  listTiposGastos: any;
  gastoNuevo: Gastos;
  mes: number;
  anio: number;
  nombreMes: string;
  nombreAnio: string;
  nombreMesBuscar:string;
  meses: any;
  total: number;

  constructor(private router: Router,private gastosService: GastosService) {
    this.gastoNuevo = new Gastos()
    this.listGastos = new Array<Gastos>();
    let fecha = new Date()
    this.mes = fecha.getUTCMonth() + 1
    this.anio = fecha.getFullYear()
    this.listTiposGastos = Constantes.TIPO_DE_GASTOS;
    this.consultarGastosPorMes()
    this.setNombreMes()
    this.nombreMesBuscar = 'Mes'
    this.meses = Constantes.MESES;
    this.total = 0

    }

  ngOnInit() {
    $(document).ready(function () {
      $('#dt-gastos').DataTable(
        {
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        },

      );
    })
  }

  consultarGastosPorMes() {

    this.gastosService.getByMes(String(this.mes), String(this.anio)).subscribe((response) => {
      response = JSON.parse(response)
      if (response.code == '1') {

        this.listGastos = response.msg
        this.setTotal()

      } else {
        swal('Error!', response.msg, 'error');
      }
    }, error => Constantes.handleError(error))
  }

  insertarGastos() {
    $('#modal-insertar-gasto').modal('hide');

    this.gastoNuevo.idEmpresa = Number(Constantes.getIdEmpresa())
    this.gastosService.insertar(this.gastoNuevo).subscribe((response) => {
      response = JSON.parse(response)
      if (response.code == '1') {
        swal('Listo!', response.msg, 'success');
        Constantes.reloadPage('/home/gastos', this.router)
      } else {
        swal('Error!', response.msg, 'error');

      }
    }, error => Constantes.handleError(error))
  }

  verDetalles(g: Gastos) {

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

  setMesBuscar(m: number){
    this.mes = m
    this.nombreMesBuscar = Constantes.setNombreMes(String(m))

  }

  setTotal(){
    this.total = 0
    this.listGastos.forEach(g => {
      this.total = this.total + g.valor
    })
  }

}
