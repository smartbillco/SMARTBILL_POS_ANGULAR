import { Component, OnInit } from '@angular/core';
import { Constantes } from 'src/app/comun/constantes';
import { InventarioService } from 'src/app/services/inventario.service';
import { MovimientoInventario, InventoryMovements } from 'src/app/models/movimiento-inventario';
import { VarGloblas } from '../../../../comun/global';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

declare var $: any;

@Component({
  selector: 'app-ipkardex',
  templateUrl: './ipkardex.component.html',
  styleUrls: ['./ipkardex.component.scss']
})
export class IpkardexComponent implements OnInit {

  listaMovimientos: InventoryMovements[] = [];
  listaMovimientosTodos: InventoryMovements[] = [];
  listConceptos: any;

  public filterParam: string;

  private mes: number;

  anio: number;
  nombreMes: string;
  nombreAnio: string;
  nombreMesBuscar: string;
  nombreConcepto: string;

  idInsumoBuscar: number;

  filtroConcepto: string;

  filtroTipoMov: number;
  nombreMov: string;

  // filters
  filterByDate: boolean = false;
  filterByMotion: boolean = false;

  // Date today
  monthToday: number;
  yearToday: number;

  public dateFilterValues: DateFilterValues = new Object();

  constructor(
    private inventarioService: InventarioService
  ) {
    const fecha = new Date();
    this.mes = fecha.getUTCMonth() + 1;
    this.anio = fecha.getUTCFullYear();
    this.nombreConcepto = 'Conceptos';

    this.idInsumoBuscar = 0;
    this.nombreMov = 'Tipo de movimiento';
  }

  ngOnInit() {
    this.consultarMovimientos();
  }

  public consultarMovimientos(): void {
    this.inventarioService.getAllMovements().subscribe(movements => {
      $(document).ready(function () {
        $('#dt-mov-inv-productos').DataTable({ language: VarGloblas.dtOptions.language });
      });
      this.listaMovimientos = movements;
      this.listaMovimientosTodos = this.listaMovimientos;
    });
  }

  filtrarConcepto(c: string) {
    this.listaMovimientos = this.listaMovimientos.filter(m => m.concepto === c);
    this.nombreConcepto = c;
  }

  setMesBuscar(m: number) {
    this.mes = m;
    this.nombreMesBuscar = Constantes.setNombreMes(String(m));

  }

  setConceptos(tipoMov: number) {
    if (tipoMov === 0) {
      this.listConceptos = Constantes.CONCEPTO_ENTRADA;
      this.nombreMov = 'ENTRADAS';
    } else {
      this.listConceptos = Constantes.CONCEPTO_SALIDA;
      this.nombreMov = 'SALIDAS';
    }
  }

  public optionFilter(param: string): void {
    this.filterParam = param;
  }

  getDateToday() {
    const date = new Date();
    this.yearToday = date.getFullYear();
    this.monthToday = date.getMonth() + 1;
  }

  public exportProductListToExcel(): void {
    const payload: any[] = [];
    payload.push([
      'Producto',
      'Tipo',
      'Cantidad',
      'Empleado',
      'Fecha',
      'Concepto',
      'Observacion'
    ]);

    for (const producto of this.listaMovimientosTodos) {
      const newElement = [
        producto.idProducto,
        producto.tipo,
        producto.cantidad,
        producto.nombreEmpleado,
        producto.fecha,
        producto.concepto,
        producto.observacion
      ];
      payload.push(newElement);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(payload);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja 1');
    XLSX.writeFile(wb, `Kardex  ${moment(new Date()).format('DD-MM-YYYY HH:MM ')}.xlsx`);

  }

  exportProductListToPdf() {

    var doc = new jsPDF();
    var col = ["PRODUCTO", "TIPO", "CANTIDAD", "EMPLEADO", "FECHA", "CONCEPTO", "OBSERVACION"];
    var rows = [];

    /* The following array of object as response from the API req  */

    var itemNew = this.listaMovimientosTodos;


    itemNew.forEach(element => {
      var temp = [element.idEmpleado, element.tipo, element.cantidad, element.nombreEmpleado, element.fecha, element.concepto, element.observacion];
      rows.push(temp);

    });

    doc.autoTable(col, rows);
    doc.save(`Lista kardex  ${moment(new Date()).format('DD-MM-YYYY HH:MM ')}.pdf`);
  }


  public filterByDates(): void {
    const newDataList: InventoryMovements[] = [];
    for (const movement of this.listaMovimientosTodos) {
      const compareDate = moment(movement.fecha);
      const startDate = moment(this.dateFilterValues.startDate);
      const endDate = moment(this.dateFilterValues.endDate);
      const isBetween = compareDate.isBetween(startDate, endDate);

      if (isBetween) {
        newDataList.push(movement);
      }
    }

    this.listaMovimientos = newDataList;
  }

  public filterByMovementType(type: string): void {
    this.listaMovimientos = this.listaMovimientosTodos.filter(m => m.tipo === Number(type));
  }

}

interface DateFilterValues {
  startDate?: string;
  endDate?: string;
}
