import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacturasProveedorService } from 'src/app/services/contabilidad/facturas-proveedor.service';
import { FacturaProveedor } from 'src/app/models/contabilidad/factura-proveedor';
import { AbonosCP } from 'src/app/models/contabilidad/abonos-cp';
import swal from 'sweetalert2';
import { Constantes } from 'src/app/comun/constantes';
declare var $: any;
import { Proveedor } from '../../../models/proveedor';
import { ProductosService } from '../../../services/productos.service';
import { Producto } from 'src/app/models/producto';
import { ProveedoresService } from 'src/app/services/proveedores.service';

@Component({
  selector: 'app-facturas-proveedor',
  templateUrl: './facturas-proveedor.component.html',
  styles: []
})
export class FacturasProveedorComponent implements OnInit {

  sFecha: string;
  sNumero: string;
  listFacturas: Array<FacturaProveedor>;
  facturaResult: FacturaProveedor;
  tipo: string;
  searchByDate: number;
  txtFecha: string;


  // Wtf?
  mes: number;
  anio: number;
  nombreMes: string;
  nombreAnio: string;

  public currentDate: any = new Object;
  public activeProvidersModal: boolean = false;
  public activeAddInvoice: boolean = false;
  public listaProductos: Producto[] = [];
  public listaProveedores: Proveedor[] = [];
  cantVentas: number;
  totalVentas: number;
  cuentaPorPagar: FacturaProveedor;
  listAbonos: Array<AbonosCP>;
  nuevoAbono: AbonosCP;
  filterByClient: boolean = false;
  filterByDate: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  filterByPayment: boolean = false;

  private proveedorSelected: Proveedor;

  constructor(
    private facturaProveedorService: FacturasProveedorService,
    private router: Router,
    private comProductoServices: ProductosService,
    private comProveedorServices: ProveedoresService,
  ) {

    this.listFacturas = new Array<FacturaProveedor>();
    this.facturaResult = new FacturaProveedor();
    this.sNumero = '';
    this.searchByDate = 1;
    this.tipo = 'date';
    this.txtFecha = 'Fecha';

    const fecha = new Date();
    this.mes = fecha.getUTCMonth() + 1;
    this.anio = fecha.getFullYear();

    this.totalVentas = 0;
    this.cantVentas = 0;

    this.cuentaPorPagar = new FacturaProveedor();
    this.listAbonos = new Array<AbonosCP>();
    this.nuevoAbono = new AbonosCP();
  }

  ngOnInit() {
    this.setCurrentDate();
    this.getProvidersInvoce();
    this.getProducts('0');
    this.getProveedores();
  }

  getProvidersInvoce() {
    this.facturaProveedorService.getProvidersInvoicesByCurrentDate(this.currentDate).subscribe((invoiceList: FacturaProveedor[]) => {
      this.listFacturas = invoiceList;
      console.log(this.listFacturas);
    });
  }

  setCantYtotalVentas() {

    this.cantVentas = this.listFacturas.length;
    this.totalVentas = 0;
    this.listFacturas.forEach(f => {
      this.totalVentas += this.totalVentas + f.valor;
    });
  }

  verDetalles(fac: FacturaProveedor) {

    this.cuentaPorPagar = fac;
    this.facturaProveedorService.getDetallesFacturaProveedor(String(fac.id)).subscribe((response: any) => {
      response = response;

      if (response.code === '1') {
        this.cuentaPorPagar.listaCompras = response.msg;

        if (this.cuentaPorPagar.listaCompras.length === 0) {
          swal('Advertencia', 'Esta factura no tiene detalles', 'warning');

        } else {
          $('#modal-detalles').modal();

        }

      } else {
        swal('Error', response.msg, 'error');
      }
    }, error => Constantes.handleError(error));

  }

  verAbonos(fac: FacturaProveedor) {

    this.cuentaPorPagar = fac;
    this.facturaProveedorService.getAbonosCP(String(this.cuentaPorPagar.id)).subscribe((response: any) => {
      response = response;
      if (response.code === '1') {
        this.listAbonos = response.msg;
        $('#modal-abonos-cp').modal();
      } else {
        swal('Error', response.msg, 'error');
      }
    }, error => Constantes.handleError(error));
  }

  registrarNuevoAbono() {
    this.nuevoAbono.idFacturaProveedor = this.cuentaPorPagar.id;
    if (this.nuevoAbono.valor > this.cuentaPorPagar.saldo) {
      swal('Advertencia', 'El monto a abonar no puede ser mayor al saldo de la cuenta de cobro', 'warning');
    } else {
      $('#modal-add-abono-cp').modal('hide');
      this.facturaProveedorService.guardarAbonoCP(this.nuevoAbono).subscribe((response: any) => {
        response = response;
        if (response.code === '1') {
          swal('Listo!', response.msg, 'success');

          if (this.proveedorSelected) {
            this.findInvoiceByProviderId(this.proveedorSelected);
          } else {
            Constantes.reloadPage('/home/compras', this.router);
          }
          
       
        } else {
          swal('Error', response.msg, 'error');
        }
      }, error => Constantes.handleError(error));
    }

  }

  setAddAbonoCC(fac: FacturaProveedor) {
    this.cuentaPorPagar = fac;
    $('#modal-add-abono-cp').modal();
  }


  filterValidate(event: string) {
    if (event === '1') {
      this.filterByClient = true;
      this.filterByDate = false;
      return;
    } else if (event === '2') {
      this.filterByPayment = true;
      this.filterByClient = false;
      this.filterByDate = false;

      this.currentDate.fechaInicio = '2019-01-01';
      this.currentDate.fechaFin = '2019-12-31';
      this.getInvoicesByImplicitDate(this.currentDate);
      return;
    } else if (event === '3') {
      this.filterByDate = true;
      this.filterByClient = false;

    }
  }

  setProvider(provider: Proveedor) {
    $('#modal-selectProvider').hide();
    this.activeProvidersModal = false;
    this.proveedorSelected = provider;
    this.findInvoiceByProviderId(provider);
  }

  getUnpaidInvoices() {
    this.facturaProveedorService.getUnpaidInvoices().subscribe((invoices: FacturaProveedor[]) => {
      if (invoices.length === 0) {
        swal('No hay datos', 'no se encontraron facturas pendientes', 'warning');
      } else {
        this.listFacturas = invoices;
      }
    });
  }

  getInvoicesByImplicitDate(currenDate: Object) {
    this.facturaProveedorService.findInvoicesByImplicitDate(currenDate).subscribe((invoices: FacturaProveedor[]) => {
      if (invoices.length === 0) {
        swal('No hay datos', 'No se encontraron facturas en el rango establecido', 'warning');
      } else if (this.filterByPayment === true) {
        this.listFacturas = invoices.filter(invoice => invoice.estado === 'PENDIENTE');
      } else {
        this.listFacturas = invoices;
      }
    });
  }


  findInvoiceByProviderId(provider: Proveedor) {
    this.facturaProveedorService.getInvoiceByIdprovider(provider.idProveedor).subscribe((invoceList: FacturaProveedor[]) => {
      if (invoceList.length > 0) {
        swal('Faturas encontradas!',
          `Se encontraron ${invoceList.length} facturas registradas a nombre del provedor ${provider.nombre} `,
          'success');
        this.listFacturas = invoceList;
      } else {
        swal('No hay datos', `no se encontraron facturas registradas a nombre de ${provider.nombre}`, 'warning');
      }
    });
  }

  setCurrentDate() {
    const date = new Date;
    let mont = (date.getMonth() + 1).toString();
    if (mont.length <= 1) {
      mont = '0' + mont;
    }
    const currentDate = `${date.getFullYear()}-${mont}-${date.getDate()}`;
    this.currentDate.fechaInicio = currentDate;
    this.currentDate.fechaFin = currentDate;
  }


  getProducts(value: string) {
    this.comProductoServices.getListarProductos().subscribe((data: any) => {
      this.listaProductos = data;
    });
  }

  getProveedores() {
    this.comProveedorServices.getListarProveedores().subscribe((data: any) => {
      this.listaProveedores = data;
    });
  }
}
