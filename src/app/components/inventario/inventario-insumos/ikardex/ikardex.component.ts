import {Component, OnInit} from '@angular/core';
import {InventarioService} from 'src/app/services/inventario.service';
import {MovimientoInventario} from 'src/app/models/movimiento-inventario';
import {Constantes} from 'src/app/comun/constantes';
import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-ikardex',
  templateUrl: './ikardex.component.html',
  styles: []
})
export class IkardexComponent implements OnInit {


  listaMovimientos: Array<MovimientoInventario>;
  listaMovimientosTodos: Array<MovimientoInventario>;
  listConceptos: any;

  mes: number;

  anio: number;
  nombreMes: string;
  nombreAnio: string;
  nombreMesBuscar: string;
  meses: any;
  nombreConcepto: string;

  fechaInicio: string;
  fechaFin: string;

  idInsumoBuscar: number;


  // filters
  filterByDate: boolean = false;
  filterByMotion: boolean = false;

  // Date today
  monthToday: number;
  yearToday: number;

  constructor(private inventarioService: InventarioService) {

    this.listaMovimientos = new Array<MovimientoInventario>();
    const fecha = new Date();
    this.mes = fecha.getUTCMonth() + 1;
    this.anio = fecha.getUTCFullYear();
    this.nombreConcepto = 'Conceptos';

    this.setNombreMes();
    this.meses = Constantes.MESES;
    this.idInsumoBuscar = 0;
  }

  ngOnInit() {
    this.consultarMovimientos();
  }

  consultarMovimientos() {
    this.inventarioService.getMovimientosTodosProdByMes(this.mes, this.anio).subscribe((response) => {

      $(document).ready(function () {
        $('#dt-mov-inv-insumos').DataTable(
          {
            'language': {
              'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
            }
          },
        );
      });

      this.listaMovimientos = response.msg;


    }, error => Constantes.handleError(error));
  }

  consultarMovimientosFecha() {

    if (this.idInsumoBuscar === 0) {

      swal('Error!', 'Debe seleccionar un insumo', 'error');

      return;
    }

    this.inventarioService.getMovimientosProdByFechas(this.idInsumoBuscar, this.fechaInicio, this.fechaFin).subscribe((response) => {
      this.listaMovimientos = response;
    });
  }

  filtrarPorConceptos() {

  }

  filtrarPorTipo(tipo: number) {

  }

  setNombreMes() {

    switch (this.mes) {
      case 1:
        this.nombreMes = 'ENERO';
        break;
      case 2:
        this.nombreMes = 'FEBRERO';
        break;
      case 3:
        this.nombreMes = 'MARZO';
        break;
      case 4:
        this.nombreMes = 'ABRIL';
        break;
      case 5:
        this.nombreMes = 'MAYO';
        break;
      case 6:
        this.nombreMes = 'JUNIO';
        break;
      case 7:
        this.nombreMes = 'JULIO';
        break;
      case 8:
        this.nombreMes = 'AGOSTO';
        break;
      case 9:
        this.nombreMes = 'SEPTIEMBRE';
        break;
      case 10:
        this.nombreMes = 'OCTUBRE';
        break;
      case 11:
        this.nombreMes = 'NOVIEMBRE';
        break;
      case 12:
        this.nombreMes = 'DICIEMBRE';
        break;
    }
  }

  setMesBuscar(m: number) {
    this.mes = m;
    this.nombreMesBuscar = Constantes.setNombreMes(String(m));
  }

  optionFilter(event) {
    if (event === '1') {
      this.filterByDate = true;
      this.filterByMotion = false;
      return;
    } else if (event === '2') {
      this.filterByMotion = true;
      this.filterByDate = false;
      return;
    } else {
      this.filterByMotion = false;
      this.filterByDate = false;
    }
  }

  getDateToday() {
    const date = new Date();

    this.yearToday = date.getFullYear();
    this.monthToday = date.getMonth() + 1;

    console.log(this.yearToday, this.monthToday);

  }

  filtrarPorConcepto() {

  }
}
