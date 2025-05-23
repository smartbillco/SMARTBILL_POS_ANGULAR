import { Component, OnInit } from '@angular/core';
import { Constantes } from 'src/app/comun/constantes';
import { IngresosService } from 'src/app/services/contabilidad/ingresos.service';
import { Ingresos } from 'src/app/models/contabilidad/ingresos';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styles: []
})
export class IngresosComponent implements OnInit {

  listIngresos: Array<Ingresos>;
  ingresoNuevo: Ingresos;
  mes: number;
  anio: number;
  nombreMesBuscar:string;
  meses: any;
  nombreMes: string;
  total: number;
  listConceptoIngreso: any;
  constructor(private router: Router,private ingresoService: IngresosService) { 
    let fecha = new Date()
    this.mes = fecha.getUTCMonth() + 1
    this.anio = fecha.getFullYear()
    this.consultarIngresosPorMes()
    this.meses = Constantes.MESES;
    this.nombreMesBuscar = 'Mes'
    this.setNombreMes()
    this.total = 0
    this.ingresoNuevo = new Ingresos()
    this.listConceptoIngreso = Constantes.TIPO_DE_INGRESOS
  }

  ngOnInit() {
    $(document).ready(function () {
      $('#dt-ingresos').DataTable(
        {
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        },

      );
    })
  }

  consultarIngresosPorMes(){

    this.ingresoService.getByMes(String(this.mes), String(this.anio)).subscribe((response) => {
      response = JSON.parse(response)
      if (response.code == '1') {

        this.listIngresos = response.msg
        this.setTotal()

      } else {
        swal('Error!', response.msg, 'error');
      }
    }, error => Constantes.handleError(error))
  }

  registrarIngreso(){

    $('#modal-insertar-ingresos').modal('hide');

    this.ingresoNuevo.idEmpresa = Number(Constantes.getIdEmpresa())
    this.ingresoService.insertar(this.ingresoNuevo).subscribe((response) => {
      response = JSON.parse(response)
      if (response.code == '1') {
        swal('Listo!', response.msg, 'success');
        Constantes.reloadPage('/home/ingresos', this.router)
      } else {
        swal('Error!', response.msg, 'error');

      }
    }, error => Constantes.handleError(error))
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
    this.listIngresos.forEach(ing => {
      this.total = this.total + ing.valor
    })
  }

  setMesBuscar(m: number){
    this.mes = m
    this.nombreMesBuscar = Constantes.setNombreMes(String(m))

  }

}
