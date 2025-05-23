import { Component, OnInit } from "@angular/core";
import { VentasService } from "src/app/services/ventas.service";
import { Factura } from "src/app/models/facturas";
import swal from "sweetalert2";
import { Constantes } from "src/app/comun/constantes";
import { saveAs } from "file-saver";
import { Cliente } from "src/app/models/cliente";
declare var $: any;

@Component({
  selector: "app-facturas",
  templateUrl: "./facturas.component.html",
  styles: [],
})
export class FacturasComponent implements OnInit {
  sFecha: string;
  sNumero: string;
  listFacturas: Array<Factura>;
  facturaResult: Factura;
  tipo: string;
  searchByDate: number;
  txtFecha: string;
  invoiceFound: Factura;

  cantVentas: number;
  totalVentas: number;

  // fechaDesde: string;
  // fechaHasta: string;
  facturaExist: boolean = false;
  public activeCustomerList: boolean = false;

  public dateToSend: any = new Object();

  searchInvoiceByDate: boolean = false;
  searchInvoiceByNumber: boolean = true;
  searchInvoiceByCustomer: boolean = false;
  searcVoidedInvocies: boolean = false;
  searchDiscountedInvoices: boolean = false;
  searhByCashRegister: boolean = false;

  constructor(
    private facturaService: VentasService,
    private _salesService: VentasService
  ) {
    this.invoiceFound = new Factura();
    this.listFacturas = new Array<Factura>();
    this.facturaResult = new Factura();
    this.sFecha = this.formatDate(new Date());
    this.sNumero = "";
    this.searchByDate = 1;
    this.tipo = "date";
    this.txtFecha = "Fecha";
    // this.buscarPorFecha()

    this.totalVentas = 0;
    this.cantVentas = 0;
  }

  ngOnInit() {}

  getInvoiceByCurrentDate() {
    this.dateToSend.fechaInicio = this.sFecha;
    this.dateToSend.fechaFin = this.sFecha;
    this.facturaService
      .getInvoicesByDate(this.dateToSend)
      .subscribe((invoices: Factura[]) => {
        this.listFacturas = invoices;
        this.setCantYtotalVentas();
      });
  }

  findByImplicitDate() {
    this.facturaService
      .getInvoicesByDate(this.dateToSend)
      .subscribe((data: any[]) => {
        if (data.length <= 0) {
          swal(
            "Error!",
            "No se encontraron facturas en el rango de fecha establecido",
            "error"
          );
        } else {
          this.listFacturas = data;
          this.setCantYtotalVentas();
        }
      });
  }

  buscarPorNumero() {
    if (this.sNumero) {
      this.facturaService.getFacturaByNumero(this.sNumero).subscribe(
        (response: any) => {
          if (response) {
            this.invoiceFound = response;
            this.listFacturas = [];
            this.listFacturas.push(this.invoiceFound);
            $("#modal-detalles-e").modal("show");
            this.facturaExist = true;
            this.setCantYtotalVentas();
          }
        },
        (error) => {
          Constantes.handleError(error);
        }
      );
    } else {
      alert("Debe ingresar un valor.");
    }
  }

  cambiarTipo(event: string) {
    this.sFecha = "";
    if (event === "1") {
      this.tipo = "date";
      this.txtFecha = "Fecha";
      this.searchInvoiceByNumber = true;
      this.searchInvoiceByCustomer = false;
      this.searchInvoiceByDate = false;
      this.searcVoidedInvocies = false;
      this.searchDiscountedInvoices = false;
      this.searhByCashRegister = false;
    } else if (event === "2") {
      this.tipo = "text";
      this.txtFecha = "Número de Factura";
      this.searchInvoiceByNumber = false;
      this.searchInvoiceByCustomer = false;
      this.searchInvoiceByDate = true;
      this.searcVoidedInvocies = false;
      this.searchDiscountedInvoices = false;
      this.searhByCashRegister = false;
    } else if (event === "3") {
      this.tipo = "text";
      this.txtFecha = "Número de identificación";
      this.searchInvoiceByCustomer = true;
      this.searchInvoiceByDate = false;
      this.searchInvoiceByNumber = false;
      this.searcVoidedInvocies = false;
      this.searchDiscountedInvoices = false;
      this.searhByCashRegister = false;
    } else if (event === "4") {
      this.tipo = "text";
      this.txtFecha = "Número de identificación";
      this.searchInvoiceByCustomer = false;
      this.searchInvoiceByDate = false;
      this.searchInvoiceByNumber = false;
      this.searcVoidedInvocies = true;
      this.searchDiscountedInvoices = false;
      this.searhByCashRegister = false;
    } else if (event === "5") {
      this.tipo = "text";
      this.txtFecha = "Número de identificación";
      this.searchInvoiceByCustomer = false;
      this.searchInvoiceByDate = false;
      this.searchInvoiceByNumber = false;
      this.searcVoidedInvocies = false;
      this.searchDiscountedInvoices = true;
      this.searhByCashRegister = false;
    } else if (event === "6") {
      this.tipo = "text";
      this.txtFecha = "Número de identificación";
      this.searchInvoiceByCustomer = false;
      this.searchInvoiceByDate = false;
      this.searchInvoiceByNumber = false;
      this.searcVoidedInvocies = false;
      this.searchDiscountedInvoices = false;
      this.searhByCashRegister = true;
    }
  }

  formatDate(d: Date) {
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
      month = "0" + month;
    }
    if (day.length < 2) {
      day = "0" + day;
    }
    return [year, month, day].join("-");
  }

  setCantYtotalVentas() {
    this.cantVentas = this.listFacturas.length;
    this.totalVentas = 0;
    this.listFacturas.forEach((f) => {
      this.totalVentas += f.valor;
    });
  }

  consultarReporte() {
    if (this.listFacturas.length <= 0) {
      swal("Advertencia", "No existen facturas para exportar.", "warning");
      return;
    }

    this.facturaService.getReporteVentas(this.listFacturas).subscribe(
      (data) => saveAs(data, "ReporteVentas.xlsx"),
      (error) => Constantes.handleError(error)
    );
  }

  buscarPorCliente(customer: Cliente) {
    $("#modal-selectCustomer").modal("hide");
    this.activeCustomerList = false;
    this.findInvoicesByCustomer(customer);
  }

  findInvoicesByCustomer(customer: Cliente) {
    this._salesService
      .getInvoicesByCustomerId(customer)
      .subscribe((data: any[]) => {
        this.listFacturas = data;
        this.setCantYtotalVentas();
      });
  }

  getVoidedInvocies() {
    this._salesService
      .getVoidedInvocies(this.dateToSend)
      .subscribe((data: any[]) => {
        if (data.length === 0) {
          swal(
            "No hay datos",
            "No se encontraron facturas anuladas en el rango de fecha establecido",
            "warning"
          );
        } else {
          this.listFacturas = data;
          this.setCantYtotalVentas();
        }
      });
  }
  getDiscountedInvoices() {
    this._salesService
      .getDiscountedIinvoices(this.dateToSend)
      .subscribe((data: any[]) => {
        if (data.length === 0) {
          swal(
            "No hay datos",
            "No se encontraron facturas con descuento en el rango de fecha establecido",
            "warning"
          );
        } else {
          this.listFacturas = data;
        }
      });
  }

  setFacturaExists(exists: boolean) {
    this.facturaExist = exists;
  }
}
