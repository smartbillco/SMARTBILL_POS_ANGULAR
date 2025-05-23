import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { DetalleFactura } from 'src/app/models/detalleFactura';
import { Factura } from 'src/app/models/facturas';
import { MediosDePago } from 'src/app/models/mediosDePagos';
import { Cliente } from 'src/app/models/cliente';
import { VentasService } from 'src/app/services/ventas.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { Producto } from 'src/app/models/producto';
import { Constantes } from 'src/app/comun/constantes';
import swal from 'sweetalert2';
import { Mesa } from 'src/app/models/restaurante/mesa';
import { SmartbillService } from 'src/app/services/smartbill.service';
import { ClientesService } from 'src/app/services/clientes.service';
declare var $: any;

@Component({
  selector: 'app-resumen-venta',
  templateUrl: './resumen-venta.component.html',
  styles: []
})
export class ResumenVentaComponent implements OnInit {

  @ViewChild('recibe') recibeElement: ElementRef;
  @ViewChild('idCliente') idClienteElement: ElementRef;
  listaDetalles: Array<DetalleFactura>; // original
  listaDetallesActualizar: Array<DetalleFactura>;
  listaDetallesNuevos: Array<DetalleFactura>;
  factura: Factura;
  totalVenta: number;
  mediosDePago: Array<MediosDePago>;
  cliente: Cliente;       //cliente a quien se factura
  nuevoCliente: Cliente;
  listTipos: any;
  arrayDetalles: Array<Array<DetalleFactura>>;
  claveAuth: string;

  detEditar: DetalleFactura;
  estadoMesaAnterior: number;
  idUsuarioSmartbill: number;

  @Output() cerrarMesaEvent = new EventEmitter<any>();

  constructor(private ventasService: VentasService, private utilidadesService: UtilidadesService,
    private smartbillService: SmartbillService, private comClientServices: ClientesService) {
    this.totalVenta = 0;
    this.initFactura()

    this.utilidadesService.getMediosDePago().subscribe((response) => {
      this.mediosDePago = JSON.parse(response.toString()).msg;
    });

    //this.consultarCodigoFactura();

    this.factura.idEmpleado = Number(localStorage.getItem('idEmpleado'));
    this.cliente = new Cliente()
    this.listaDetalles = new Array<DetalleFactura>()
    this.listaDetallesActualizar = new Array<DetalleFactura>()
    this.listaDetallesNuevos = new Array<DetalleFactura>()
    this.arrayDetalles = new Array<Array<DetalleFactura>>()
    this.idUsuarioSmartbill = 0;

  }

  ngOnInit() { }

  consultarNumeroOrdenMesa(idMesa: number) {

    this.ventasService.getNumeroOrdenMesa(String(idMesa)).subscribe((response) => {

      response = JSON.parse(response.toString())
      if (response.code == '1') {
        this.factura = response.msg
        this.factura.idMediosPago = 1

        //$("#modal-orden-mesa").modal('show');
      }

    }, error => Constantes.handleError(error))
  }
  /**
   * Consultar detalles de orden abierta de mesa
   * @param idMesa 
   */
  consultarDetallesMesa(idMesa: number) {
    this.listaDetallesActualizar = new Array<DetalleFactura>()
    this.listaDetallesNuevos = new Array<DetalleFactura>()
    this.ventasService.getDetallesMesa(String(idMesa)).subscribe((response) => {

      response = JSON.parse(response.toString())
      if (response.code == '1') {
        this.listaDetalles = response.msg

        this.getTotalVenta()
        $("#modal-orden-mesa").modal('show');
      }

    }, error => Constantes.handleError(error))
  }

  addProducto(prod: Producto) {

    if (this.checkDetalle(prod.idProducto)) {                     //si el producto NO existe en lista

      const detalle: DetalleFactura = new DetalleFactura();

      detalle.idFactura = this.factura.idFactura
      detalle.idProducto = prod.idProducto;
      detalle.precioProducto = prod.precio;
      detalle.cantidad = 1;
      detalle.total = detalle.cantidad * detalle.precioProducto;
      detalle.nombre = prod.nombre;

      this.totalVenta = this.totalVenta + detalle.total;
      this.listaDetalles.push(detalle);
      this.listaDetallesNuevos.push(detalle)

    } else {
      const det = this.listaDetalles.find(deta => deta.idProducto === prod.idProducto);

      det.cantidad++;
      det.total = det.cantidad * det.precioProducto;

      if (this.checkDetalleNuevo(det.idProducto)) { // no esta en lista nuevos, pero si en lista original: debe actualizar cantidad


        this.listaDetallesActualizar.push(det)
      } else {      //si esta en lista nuevos, y en lista original, debe buscarse en lista nuevos y actualizar cantidad

        this.listaDetallesNuevos.find(det => det.idProducto == prod.idProducto).cantidad = det.cantidad
        this.listaDetallesNuevos.find(det => det.idProducto == prod.idProducto).total = det.total
      }



      this.totalVenta = this.listaDetalles.reduce((
        acc,
        det,
      ) => (acc + det.cantidad * det.precioProducto), 0);
    }
  }

  guardarDetallesOrden() {

    this.arrayDetalles = new Array<Array<DetalleFactura>>()
    console.log(this.listaDetallesActualizar)
    console.log(this.listaDetallesNuevos)
    if (this.listaDetallesActualizar.length == 0 && this.listaDetallesNuevos.length == 0) {

      swal('Error', 'No hay cambios en la orden', 'error')
      return;
    }

    this.arrayDetalles.push(this.listaDetallesNuevos)
    this.arrayDetalles.push(this.listaDetallesActualizar)


    this.ventasService.actualizarOrdenMesa(this.arrayDetalles).subscribe((response) => {
      response = JSON.parse(response.toString())
      if (response.code == '1') {
        swal('Listo!', response.msg, 'success')
        $("#modal-orden-mesa").modal('hide');

      } else {
        swal('Error', response.msg, 'error')

      }
    }, error => Constantes.handleError(error))

  }

  cerrarMesa(mesa: Mesa) {

    this.estadoMesaAnterior = mesa.estado;

    if (!(this.listaDetalles.length > 0)) {
      swal('Advertencia!', 'Debe seleccionar al menos un producto para realizar una venta.', 'warning');
    }

    if (this.listaDetallesActualizar.length > 0 || this.listaDetallesNuevos.length > 0) {

      swal('Error', 'Debe guardar todos los cambios hechos a la orden antes de cerrar mesa.', 'error')

      return;
    }

    this.factura.valor = this.totalVenta

    if (this.factura.idMediosPago == 4) {
      this.factura.estado = 'PENDIENTE';        //genera cuenta por cobrar

      if (this.cliente.id != undefined) {  //verificar cliente

        this.factura.cambio = 0
      } else {
        this.idClienteElement.nativeElement.focus()
        swal('Error!', 'Las cuentas de cobro deben asignarse a un cliente.', 'error');
        return;
      }


    } else {
      if (this.factura.recibido < this.factura.valor) {

        swal('Error', 'La cantidad recibida no puede ser inferior al total de la venta.', 'error')
        return;
      }
      this.factura.estado = 'PAGADO'
      this.factura.cambio = this.factura.recibido - this.totalVenta
    }
    //   console.log(this.factura)

    this.setNuevoEstadoMesa(mesa)

    this.ventasService.cerrarMesa(this.factura, mesa.id, mesa.estado).subscribe((response) => {

      response = JSON.parse(response.toString())
      if (response.code == '1') {

        swal('Listo', response.msg, 'success')
        this.cerrarMesaEvent.next('')

        this.enviarFacturaSmartBill()

        $("#modal-orden-mesa").modal('hide');
      } else {
        swal('Error', response.msg, 'error')
        mesa.estado = this.estadoMesaAnterior;

      }
    })

  }

  checkDetalle(idProd: number): boolean {
    const det = this.listaDetalles.find(deta => deta.idProducto === idProd);
    return det === undefined || det === null;
  }

  checkDetalleNuevo(idProd: number): boolean {
    const det = this.listaDetallesNuevos.find(deta => deta.idProducto === idProd);
    return det === undefined || det === null;
  }

  getTotalDetalle(det: DetalleFactura) {

    det.total = det.cantidad * det.precioProducto;
    this.getTotalVenta()
    return det.total;
  }

  getTotalVenta() {

    let cont = 0;
    this.listaDetalles.forEach(det => { cont = cont + det.total })

    this.totalVenta = cont;
  }

  initFactura() {

    this.factura = new Factura();
    this.factura.codigo = '';
    this.factura.cambio = 0;
    this.factura.recibido = 0;
    this.factura.valor = 0;
    this.factura.listDetallesFactura = this.listaDetalles;
    this.factura.idMediosPago = 1;
    this.factura.estado = '0';
    this.factura.idEmpresa = Number(Constantes.getIdEmpresa())
    this.factura.idEmpleado = Number(localStorage.getItem('idEmpleado'));
    this.setIdMedios(1)


  }

  setIdMedios(id: number) {
    this.factura.idMediosPago = id;
  }

  setNuevoEstadoMesa(mesa: Mesa) {

    if (mesa.estado == 0) {

      mesa.estado = 1
    } else if (mesa.estado == 3) {

      mesa.estado = 2
    }

  }

  buscarCliente() {
    console.log(this.cliente.identificacion)
    this.comClientServices.getByDocument(this.cliente).subscribe((response) => {

      response = JSON.parse(response)

      if (response.code == '1') {

        this.cliente = response.msg
        this.factura.idCliente = this.cliente.id

        swal(this.cliente.nombre, 'ID: ' + 'La factura se emitirá a nombre de este cliente: ' + this.cliente.identificacion, 'success')

        this.smartbillService.getUsersByDocument(this.cliente.identificacion).subscribe((response) => {
          this.idUsuarioSmartbill = response.idUser
          console.log('usuario smartbill')
          console.log(this.idUsuarioSmartbill)
        }, error => console.log(error))

      } else if (response.code == '2') {
        swal('Error!', response.msg, 'error')

      } else {
        swal('Error!', response.msg, 'error')

      }

    }, error => Constantes.handleError(error))
  }

  enviarFacturaSmartBill() {
    if (this.idUsuarioSmartbill > 0) {
      this.smartbillService.guardarFactura(this.factura, String(this.idUsuarioSmartbill)).subscribe((response) => {

        console.log('factura enviada')
        console.log(response)
      }, error => console.log(error))

    }
  }
}
