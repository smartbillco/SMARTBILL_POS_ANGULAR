import { Component, OnInit } from '@angular/core';
import { Factura } from 'src/app/models/facturas';
import { AbonosCC } from 'src/app/models/abonos-cc';
import { CuentasCobrarService } from 'src/app/services/contabilidad/cuentas-cobrar.service';
import { VentasService } from 'src/app/services/ventas.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { Constantes } from 'src/app/comun/constantes';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Cliente } from '../../models/cliente';
import { Invoice } from '../../models/facturas';
declare var $: any;

@Component({
  selector: 'app-cuentas-cobro',
  templateUrl: './cuentas-cobro.component.html',
  styles: []
})
export class CuentasCobroComponent implements OnInit {

  sFecha: string;
  sNumero: string;
  listFacturas: Invoice[] = [];
  facturaResult: Factura;
  tipo: string;
  searchByDate: number;
  txtFecha: string;

  nombreMes: string;
  nombreAnio: string;

  cantVentas: number;
  totalVentas: number;

  cuentaCobro: Factura;
  listAbonos: Array<AbonosCC>;
  nuevoAbono: AbonosCC;

  filterByClient: boolean = false;
  filterByDate: boolean = false;
  filterByOutstanding: boolean = false;

  dateFrom: string;
  dateTo: string;
  public currentDate: any = new Object();
  public activeSelectCustomer: boolean = false;

  private customerSelected: Cliente;


  constructor(
    private cuentaCobroService: CuentasCobrarService,
    private facturaService: VentasService,
    private router: Router) {
    this.facturaResult = new Factura();
    this.sNumero = '';
    this.searchByDate = 1;
    this.tipo = 'date';
    this.txtFecha = 'Fecha';

    this.totalVentas = 0;
    this.cantVentas = 0;

    this.cuentaCobro = new Factura();
    this.listAbonos = new Array<AbonosCC>();
    this.nuevoAbono = new AbonosCC();
  }

  ngOnInit() {
    this.setParams();
    this.getAccountsReceivable();
  }

  getAccountsReceivable() {
    this.cuentaCobroService.getAccountsReceivableByDate(this.currentDate).subscribe((invoices: Invoice[]) => {
      this.listFacturas = invoices;
    });
  }

  getAccountsReceivableByIdCustomer(customerId: number) {
    this.currentDate.fechaInicio = '2000-01-31';
    this.currentDate.fechaFin = '2030-12-31';
    this.currentDate.idCliente = customerId;

    this.cuentaCobroService.getInvoicesByDateAndIdCustomer(this.currentDate).subscribe((invoices: Invoice[]) => {
      if (invoices.length === 0) {
        Swal.fire('No hay datos', 'No se encontraron facturas registradas con el cliente seleccionado', 'warning');
      } else {
        Swal.fire('Datos encontrados', `Se encontraron ${invoices.length} facturas registradas a nombre del cliente`, 'success');
        this.listFacturas = invoices;
      }
    });
  }

  setCantYtotalVentas() {
    this.cantVentas = this.listFacturas.length;
    this.totalVentas = 0;
    this.listFacturas.forEach(f => {
      this.totalVentas += this.totalVentas + f.valor;
    });
  }

  verDetalles(fac: Factura) {
    this.cuentaCobro = fac;
    this.facturaService.getDetallesFactura(String(fac.idFactura)).subscribe((response: any) => {
      this.cuentaCobro.listDetallesFactura = response.msg;
      if (this.cuentaCobro.listDetallesFactura.length === 0) {
        swal('Advertencia', 'Esta factura no tiene detalles', 'warning');
      }
    }, error => Constantes.handleError(error));
  }

  verAbonos(fac: Factura) {
    this.cuentaCobro = fac;
    this.cuentaCobroService.getAbonosCC(String(this.cuentaCobro.idFactura)).subscribe((response: any) => {
      this.listAbonos = response.msg;
      $('#modal-abonos-cc').modal('show');
    }, error => Constantes.handleError(error));
  }

  registrarNuevoAbono() {
    this.nuevoAbono.idFactura = this.cuentaCobro.idFactura;
    if (this.nuevoAbono.valor > this.cuentaCobro.saldo) {
      swal('Advertencia', 'El monto a abonar no puede ser mayor al saldo de la cuenta de cobro', 'warning');
    } else {
      $('#modal-add-abono-cc').modal('hide');
      this.cuentaCobroService.guardarAbonoCC(this.nuevoAbono).subscribe((response: any) => {

        swal('Listo!', response.msg, 'success');

        if (this.customerSelected) {
          this.getAccountsReceivableByIdCustomer(this.customerSelected.id);
        } else {
          Constantes.reloadPage('/home/cuentas-cobrar', this.router);
        }

      }, error => Constantes.handleError(error));
    }
  }

  setAddAbonoCC(fac: Factura) {
    $('#modal-add-abono-cc').modal('show');
    this.cuentaCobro = fac;
  }

  filterBalidate(event) {
    if (event === '1') {
      this.filterByClient = true;
      this.filterByDate = false;
      return;
    } else if (event === '2') {
      Swal('Operación',
        'Cuando se selecione esta opción se mostrará en tabla las cuentas de cobro pendientes',
        'success');

      this.filterByClient = false;
      this.filterByDate = false;
      return;
    } else if (event === '3') {
      this.filterByDate = true;
      this.filterByClient = false;
      this.filterByOutstanding = false;
    }
  }

  setCustomer(customer: Cliente) {
    this.customerSelected = customer;
    $('#modal-selectCustomer').modal('hide');
    this.getAccountsReceivableByIdCustomer(customer.id);
    this.activeSelectCustomer = false;
  }

  setParams() {
    const date = new Date();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    const currentDate = `${date.getFullYear()}-${month}-${day}`;
    this.currentDate.fechaInicio = currentDate;
    this.currentDate.fechaFin = currentDate;
  }
}
