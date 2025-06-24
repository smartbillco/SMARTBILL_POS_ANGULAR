import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";

import { Cliente, nuevoCliente } from "src/app/models/cliente";
import { Factura } from "src/app/models/facturas";
import * as jsPDF from "jspdf";
import "jspdf-autotable";
import swal from "sweetalert2";
import { Producto } from "src/app/models/producto";
import { Constantes } from "src/app/comun/constantes";
import { MediosDePago, listaMediosDePago } from "src/app/models/mediosDePagos";
import { DetalleFactura } from "src/app/models/detalleFactura";
import { VentasService } from "src/app/services/ventas.service";
import { CategoriaProducto } from "src/app/models/categoriaProducto";
import { ClientesService } from "src/app/services/clientes.service";
import { ProductosService } from "src/app/services/productos.service";
import { SmartbillService } from "src/app/services/smartbill.service";
import { UtilidadesService } from "src/app/services/utilidades.service";
import { CategoriasService } from "src/app/services/categorias.service";
import { ResetProductosService } from "src/app/services/reset-productos.service";
import { CajaService } from "../../services/caja.service";
import { Caja } from "../../models/caja/caja";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { VarGloblas } from "../../comun/global";
import * as moment from "moment";
import { EMediosDePago } from "../../enum/e-medios-de-pago";
import { ETipoDescuento } from "../../enum/e-tipo-descuento";

declare var $: any;

export interface Detalleproducto {
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
}

@Component({
  selector: "app-ventas",
  templateUrl: "./ventas.component.html",
  styleUrls: ["./ventas.component.scss"],
})
export class VentasComponent implements OnInit {
  //Filtro clientes
  clientes: Array<Cliente>;
  filteredClientes = [];
  searchCliente = '';

  @ViewChild("recibe") recibeElement: ElementRef;
  @ViewChild("idCliente") idClienteElement: ElementRef;
  listaProductos: Array<Producto>;
  listaProductosTodos: Array<Producto>;
  listaCategorias: Array<CategoriaProducto>;
  listaDetalles: Array<DetalleFactura>;
  factura: Factura;
  totalVenta: number;
  mediosDePago: Array<MediosDePago>;
  celularCliente: string;
  clienteExiste: Boolean;
  nombreProductoBuscar: string;
  codigoProductoBuscar: number;
  cantCaja: number;
  listMotivos: Array<string>;

  public idCaja: number;
  public caja: Caja = new Caja();

  listaMediosDePago: listaMediosDePago;

  temporaryTotal: number = 0;

  cliente: Cliente; // cliente a quien se factura
  nuevoCliente: Cliente;

  newCustomer: nuevoCliente;
  listTipos: any;

  claveAuth: string;

  detEditar: DetalleFactura;
  codigoBarrasBuscar: string;
  search: string;
  data: any = {};

  idUsuarioSmartbill: number;

  // search client
  searchById: boolean = true;
  searchByTel: boolean = false;
  payMethodSelected: string = "Efectivo";
  flagToremoveCustomer: boolean = true;

  // filterByCategory
  categoryToFilter: any;
  filteredCategory: any;
  disableReceived: boolean = false;

  constructor(
    private prodService: ProductosService,
    private catService: CategoriasService,
    private smartbillService: SmartbillService,
    private router: Router,
    private ventasService: VentasService,
    private resetProductos: ResetProductosService,
    private comClientServices: ClientesService,
    private utilidadesService: UtilidadesService,
    private _cajaService: CajaService
  ) {
    this.listaDetalles = new Array<DetalleFactura>();
    this.clienteExiste = false;
    this.nombreProductoBuscar = "";
    this.codigoProductoBuscar = 0;
    this.search = "";
    this.cantCaja = Number(localStorage.getItem("cantCaja"));
    this.detEditar = new DetalleFactura();
    this.listMotivos = Constantes.MOTIVOS_CAMBIO_PRECIO;
    this.nuevoCliente = new Cliente();
    this.listaMediosDePago = new listaMediosDePago();
    this.listTipos = Constantes.TIPOS_DOCUMENTO;
    this.cliente = new Cliente();
    this.idUsuarioSmartbill = 0;
    this.codigoBarrasBuscar = "";
  }

  ngOnInit() {
    this.setCashRegisterById();

    this.loadStorageProducts();
    this.totalVenta = 0;
    this.catService.catcurrentLista.subscribe(
      (listaCategoria) => (this.listaCategorias = listaCategoria)
    );
    this.factura = new Factura();
    this.factura.codigo = "";
    this.factura.descuento = 0;
    this.factura.cambio = 0;

    this.utilidadesService.getMediosDePago().subscribe((response: any) => {
      this.mediosDePago = response.msg;
    });
    this.catService.getListaCategoria().subscribe((response: any) => {
      this.listaCategorias = response;
    });

    this.factura.listDetallesFactura = this.listaDetalles;
    this.factura.idMediosPago = 1;
    this.factura.estado = "PAGADA";
    this.factura.idEmpleado = Number(localStorage.getItem("idEmpleado"));

    this.nuevoCliente.tipoIdentificacion = "CC";
    // set values of invoice
    this.factura.idMediosPago = EMediosDePago.EFECTIVO;
    this.factura.tipoDescuento = ETipoDescuento.SIN_DESCUENTO;
    this.factura.descuento = null;

    this.listaMediosDePago.efectivo = null;
    this.listaMediosDePago.tjCredito = null;
    this.listaMediosDePago.tjDebito = null;
    this.listaMediosDePago.cortessia = null;
    this.listaMediosDePago.cxc = null;
  }

  loadStorageProducts() {
    if (localStorage.getItem("productos")) {
      this.listaProductos = JSON.parse(localStorage.getItem("productos"));
      this.filteredCategory = this.listaProductos;
      this.listaProductosTodos = this.listaProductos;
    } else {
      this.consultarProductos();
    }
  }

  consultarProductos() {
    this.prodService.getProductosDisponibles().subscribe(
      (response: any) => {
        // let respuesta = JSON.parse(response.toString());
        const respuesta = response;

        if (respuesta.code === "1") {
          this.listaProductos = respuesta.msg;
          this.filteredCategory = this.listaProductos;
          this.listaProductosTodos = this.listaProductos;
          localStorage.setItem(
            "productos",
            JSON.stringify(this.listaProductos)
          );
        } else {
          swal("Error", respuesta.msg, "error");
        }
      },
      (error) => Constantes.handleError(error)
    );
  }

  /**
   * Guardar factura en base de datos
   */
  setRecivedValue() {
    this.factura.recibido =
      this.listaMediosDePago.efectivo +
      this.listaMediosDePago.tarjeta +
      this.listaMediosDePago.cheque;
  }

  validateInvoice() {
    if (!this.factura.recibido || this.factura.recibido < this.totalVenta) {
      Swal.fire({
        title: "Factura a cuenta por cobrar",
        text:
          "Está factura será registrada como cuenta por cobrar, esta seguro de generar la venta?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "",
        confirmButtonText: "Si, generar",
      }).then((result) => {
        if (result.value) {
          if (this.factura.idCliente === undefined) {
            Swal.fire(
              "Error!",
              "Debe seleccionar un cliente para registrar factura como cuenta por cobrar",
              "error"
            );
            return;
          } else {
            this.guardarFactura();
          }
        }
      });
    } else {
      this.guardarFactura();
    }
  }

  guardarFactura() {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    this.factura.fecha =
      fecha.getFullYear() +
      "-" +
      (mes + 1) +
      "-" +
      fecha.getDate() +
      " " +
      fecha.toLocaleTimeString();
    this.factura.setFecha();
    this.factura.cambio = this.factura.recibido - this.temporaryTotal;
    this.factura.subTotal = this.totalVenta;
    this.factura.valor = this.temporaryTotal;
    this.factura.estado = this.factura.estado.toUpperCase();

    const invoiceToSent = new Factura();
    invoiceToSent.idEmpleado = this.factura.idEmpleado;
    invoiceToSent.idEmpresa = Number(localStorage.getItem("idEmpresa"));
    invoiceToSent.idCliente = this.factura.idCliente;
    invoiceToSent.descuento = this.factura.descuento || 0;
    invoiceToSent.tipoDescuento = this.factura.tipoDescuento;
    invoiceToSent.idCaja = Number(localStorage.getItem("idCaja"));
    invoiceToSent.efectivo = this.listaMediosDePago.efectivo || 0;
    invoiceToSent.cheque = this.listaMediosDePago.cheque || 0;
    invoiceToSent.tarjeta = this.listaMediosDePago.tarjeta || 0;
    invoiceToSent.listDetallesFactura = this.factura.listDetallesFactura;
    invoiceToSent.codigo = this.factura.codigo;
    this.saveNewInvoice(invoiceToSent);
  }

  saveNewInvoice(invoice) {
    this.ventasService.guardarFactura(invoice).subscribe(
      (res: any) => {
        console.log(res);

        if (res.efectivo >= 0) {
          $("#modal-venta").modal("hide"); // Provisionalmente
          this.printInvoicePdf(invoice);
          this.reloadPage("/home/ventas");
        } else {
          swal("Error!", "No se pudo procesar la venta: ", "error");
        }
      },
      (error) => {
        console.log(error);
        Constantes.handleError(error);
      }
    );
  }

  addProducto(prod: Producto) {
    if (this.checkDetalle(prod.idProducto)) {
      // si el producto NO existe en lista

      const detalle: DetalleFactura = new DetalleFactura();

      detalle.idFactura = 1;
      detalle.idProducto = prod.idProducto;
      detalle.precioProducto = prod.precio;
      detalle.cantidad = 1;
      detalle.total = detalle.cantidad * detalle.precioProducto;
      detalle.nombre = prod.nombre;

      this.totalVenta = this.totalVenta + detalle.total;
      this.listaDetalles.push(detalle);
    } else {
      const det = this.listaDetalles.find(
        (deta) => deta.idProducto === prod.idProducto
      );

      det.cantidad++;
      det.total = det.cantidad * det.precioProducto;

      this.totalVenta = this.listaDetalles.reduce(
        (
          acc,
          // tslint:disable-next-line: no-shadowed-variable
          det
        ) => acc + det.cantidad * det.precioProducto,
        0
      );
    }
  }

  borrarDetalle(det: DetalleFactura) {
    this.totalVenta = this.totalVenta - det.total;
    const index = this.listaDetalles.indexOf(det);
    this.listaDetalles.splice(index, 1);
  }

  checkDetalle(idProd: number): boolean {
    const det = this.listaDetalles.find((deta) => deta.idProducto === idProd);
    return det === undefined || det === null;
  }

  guardar() {
    if (this.listaDetalles.length === 0) {
      swal(
        "Advertencia!",
        "Debe seleccionar al menos un producto para realizar una venta.",
        "warning"
      );
      return;
    }
    this.ventasService.getNumeroFactura().subscribe((response: number) => {
      const idFactura = response;

      this.setCodigoFactura(idFactura);
      $("#modal-venta").modal("show"); // Provisionalmente
      this.temporaryTotal = this.totalVenta;
      if (this.factura.idMediosPago === 4) {
        // no tener en cuenta efectivo

        if (this.cliente.idCliente !== undefined) {
          // verificar cliente

          $("#modal-venta").modal("show");
          this.factura.cambio = 0;
          this.factura.recibido = 0;
          this.factura.estado = "PENDIENTE";
        } else {
          this.idClienteElement.nativeElement.focus();
          swal(
            "Error!",
            "Las cuentas de cobro deben asignarse a un cliente.",
            "error"
          );
        }
      } else {
        $("#modal-venta").modal("show");
      }
    });
  }

  cancelar() {
    if (this.listaDetalles.length > 0) {
      swal({
        title: "¿Deseas cancelar esta venta?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "",
        confirmButtonText: "Si",
      }).then((result) => {
        if (result.value) {
          this.totalVenta = 0;
          this.temporaryTotal = 0;
          this.factura.tipoDescuento = 0;
          this.factura.descuento = 0;
          this.listaDetalles = new Array<DetalleFactura>();
        }
      });
    }
  }

  setCodigoFactura(id: number) {
    this.factura.codigo = "";
    const code = String(id);
    // tslint:disable-next-line:no-var-keyword
    for (var _i = 6; _i > code.length; _i--) {
      this.factura.codigo = this.factura.codigo + "0";
    }
    this.factura.codigo = this.factura.codigo + code;
    return "";
  }

  filtrarPorCategoria(cate: any) {
    if (cate === "1") {
      this.filteredCategory = this.listaProductos;
    }
    this.resetActiveColor();
    cate.isActive = !cate.isActive;
    this.listaProductos = this.listaProductosTodos;
    this.filteredCategory = this.listaProductos.filter(
      (pro) => pro.categoria === cate.nombre
    );
  }

  resetActiveColor() {
    this.listaCategorias.forEach((element) => {
      element.isActive = false;
    });
  }

  resetListaProductos() {
    this.resetActiveColor();
    this.listaProductos = this.listaProductosTodos;
  }

  consultarCliente() {
    if (!this.validarCliente()) {
      if (this.celularCliente === "3136302690") {
        this.clienteExiste = true;
      } else {
        this.clienteExiste = false;
      }
    }
  }

  setIdMedios(id: number) {
    this.factura.idMediosPago = id;
    this.payMethodSelected = this.mediosDePago.filter(
      (method) => method.id === id
    )[0].descripcion;
  }

  discountType(type: number) {
    this.factura.tipoDescuento = type;
    this.setTotalSale();
  }

  setTotalSale() {
    if (this.factura.tipoDescuento === 1) {
      const discountPercentage = this.factura.descuento / 100;
      const totalDiscountPertentage = this.totalVenta * discountPercentage;
      this.temporaryTotal = this.totalVenta - totalDiscountPertentage;
    }

    if (this.factura.tipoDescuento === 0) {
      this.temporaryTotal = this.totalVenta - this.factura.descuento;
    }
  }

  /**
   * Retorna true si el celular es válido
   */
  validarCliente(): boolean {
    return this.celularCliente === "";
  }

  buscarProductoPorNombre(nombreP) {
    this.resetListaProductos();
    if (nombreP !== "" && nombreP != null) {
      this.listaProductos = this.listaProductos.filter(
        (pro) => pro.nombre === nombreP
      );
    }
  }

  buscarProductoPorCodigo(codigoP) {
    this.resetListaProductos();

    if (codigoP != null && codigoP > 0) {
      this.listaProductos = this.listaProductos.filter(
        (pro) => pro.codigo === codigoP
      );
    }
  }

  getSearchValue() {
    return this.search;
  }

  setCantCaja() {
    localStorage.setItem("cantCaja", String(this.cantCaja));
    $("#modal-cant-caja").modal("hide");
  }

  setDetalleEditar(det: DetalleFactura) {
    $("#modal-edit_precio").modal("show");
    this.detEditar = det;
  }

  editarDetalle() {
    $("#modal-edit_precio").modal("hide");
  }

  getTotalVenta() {
    let cont = 0;
    this.listaDetalles.forEach((det) => {
      cont = cont + det.total;
    });
    this.totalVenta = cont;
  }

  getTotalDetalle(det: DetalleFactura) {
    det.total = det.cantidad * det.precioProducto;
    this.getTotalVenta();
    return det.total;
  }

  openNuevoClienteModal() {
    $("#modal-cliente").modal("show");
  }

  crearCliente() {
    $("#modal-cliente").modal("hide");
    this.comClientServices.nuevoCliente(this.nuevoCliente).subscribe(
      (data: any) => {
        // const respuesta = JSON.parse(data.toString());
        const respuesta = data;
        if (respuesta.code === "1") {
          swal(
            "Operacion exitosa",
            "Cliente registrado exitosamente.",
            "success"
          );
          this.cliente.identificacion = this.nuevoCliente.identificacion;
          this.searchCustomer();
        } else if (respuesta.code === "2") {
          swal("Error!", "Este cliente ya existe en el sistema", "error");
        }
      },
      (error) => {
        console.error(error);
        Constantes.handleError(error);
      }
    );
  }

  searchCustomer() {
    this.comClientServices
      .getCostumerByMobileNumberOrId(this.searchCliente)
      .subscribe(
        (data: any) => {
          if (data.length === 0) {
            swal(
              "Error",
              "No se ha encontrado cliente con el numero de celular o documento indicado",
              "error"
            );
          } else {
            this.newCustomer = data[0];
            this.factura.idCliente = this.newCustomer.id;
            // tslint:disable-next-line: max-line-length
            swal(
              this.newCustomer.nombre,
              `La factura se emitirá a nombre del cliente ${this.newCustomer.nombre} identidicado con el numero: ${this.newCustomer.identificacion}`,
              "success"
            );
            this.idUsuarioSmartbill = this.newCustomer.identificacion;
            this.flagToremoveCustomer = false;
            this.searchCliente = '';
          }
        },
        (error) => Constantes.handleError(error)
      );
  }

  cancelInvocie() {
    this.newCustomer = null;
  }

  // Tranferir a smartbill
  enviarFacturaSmartBill() {
    // importante nit
    if (this.idUsuarioSmartbill) {
      this.smartbillService
        .guardarFactura(this.factura, String(this.idUsuarioSmartbill))
        .subscribe(
          (response) => { },
          (error) => console.error(error)
        );
    }
  }

  buscarProductoCodigoBarras() {
    if (this.codigoBarrasBuscar !== "") {
      const prod = this.listaProductosTodos.find(
        (p) => p.codigoBarras === this.codigoBarrasBuscar
      );
      if (prod !== undefined) {
        this.addProducto(prod);
        this.codigoBarrasBuscar = "";
      }
    }
  }

  findClientBySelect(event) {
    {
      if (event === "1") {
        this.searchById = false;
        this.searchByTel = true;
      } else {
        this.searchByTel = false;
        this.searchById = true;
      }
    }
  }

  addNewCustomer() {
    $("#modal-cliente").modal("show");
  }

  removeCustomer() {
    this.newCustomer = null;
    this.factura.idCliente = null;
    this.idUsuarioSmartbill = null;
    this.flagToremoveCustomer = true;
    this.cliente.identificacion = null;
  }

  setCashRegisterById() {
    this.idCaja = Number(localStorage.getItem("idCaja"));
    this._cajaService
      .getCashRegisterById(this.idCaja)
      .subscribe((res: Caja) => {
        this.caja = res;
      });
  }

  reloadPage(url: string) {
    this.router
      .navigateByUrl("/", { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  getPfdCarta(factura: Factura) {
    const doc = new jsPDF("p", "pt");
    const nombreCliente = this.newCustomer
      ? this.newCustomer.nombre
      : "Generico";
    // Header
    doc.addImage(VarGloblas.logoJpg, "JPEG", 30, 23, 60, 70);
    doc.setFontSize(45);
    doc.text(100, 60, "SMARTBILL");
    doc.setFontSize(20);
    doc.text(100, 90, "DOCUMENTO DE VENTA");

    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(57, 110, "CLIENTE:");
    doc.text(107, 110, nombreCliente);
    doc.rect(103, 101, 450, 13);
    doc.text(45, 123, "EMPLEADO:");
    doc.text(107, 123, "Nombre empleado");
    doc.rect(103, 114, 450, 13);
    doc.text(65, 136, "FECHA:");
    doc.text(107, 136, `${moment(new Date()).format("DD-MM-YYYY")}`);
    doc.rect(103, 127, 450, 13);

    doc.setFontSize(14);
    doc.rect(401, 25, 150, 65);
    doc.setFontSize(14);
    doc.text(427, 40, "FACTURA No:");
    doc.setFontSize(27);
    doc.text(425, 70, `${this.factura.codigo}`);

    const col = ["PRODUCTO", "CANTIDAD", "VALOR UNITARIO", "TOTAL"];
    const rows = [];
    let elemento = ["111111", 111, 1111, 111];

    let totalFactura = 0;
    for (const cc of factura.listDetallesFactura) {
      elemento = [
        cc.nombre,
        cc.cantidad,
        `$ ${new Intl.NumberFormat().format(cc.precioProducto)}`,
        `$ ${new Intl.NumberFormat().format(cc.total)}`,
      ];
      totalFactura = totalFactura + cc.total;
      rows.push(elemento);
    }

    elemento = [" ", " ", " ", " "];
    rows.push(elemento);

    elemento = [
      "Total",
      " ",
      " ",
      `$ ${new Intl.NumberFormat().format(totalFactura)}`,
    ];
    rows.push(elemento);

    const header = function (data) {
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFontStyle("normal");
      // doc.text('Smartbill - factura', data.settings.margin.left, 50);
    };

    doc.autoTable(col, rows, {
      margin: { top: 150 },
      beforePageContent: header,
    });
    addFooters(doc);

    const final: any = doc.lastAutoTable.finalY;
    // doc.text(20, final, 'Hello!');

    const string = doc.output("datauristring");
    const iframe =
      "<iframe width='100%' height='100%' src='" + string + "'></iframe>";
    const x = window.open("", "_blank");
    x.document.open();
    x.document.write(iframe);
  }

  getPfdTiquete(factura: Factura) {
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: [226.77, 1200], // 80mm de ancho
    });

    const nombreCliente = this.newCustomer ? this.newCustomer.nombre : "GENÉRICO";
    let y = 20;

    // === LOGO CENTRADO y proporcional ===
    const displayWidth = 50;
    const aspectRatio = 317 / 261; // basado en tu logo
    const displayHeight = displayWidth * aspectRatio;
    const xPos = (226.77 - displayWidth) / 2;

    doc.addImage(VarGloblas.logoJpg, "PNG", xPos, y, displayWidth, displayHeight);
    y += displayHeight + 18; // más margen debajo del logo

    // === TÍTULO ===
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SMARTBILL", 113, y, { align: "center" });
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text("DOCUMENTO DE VENTA", 113, y, { align: "center" });
    y += 10;

    doc.setDrawColor(150);
    doc.line(10, y, 216, y); // línea separadora
    y += 10;

    // === DATOS DE CABECERA ===
    doc.setFontSize(8);
    doc.text(`FACTURA No: ${factura.codigo}`, 113, y, { align: "center" });
    y += 12;
    doc.text(`CLIENTE: ${nombreCliente}`, 113, y, { align: "center" });
    y += 12;
    doc.text(`EMPLEADO: Nombre empleado`, 113, y, { align: "center" });
    y += 12;
    doc.text(`FECHA: ${moment(new Date()).format("DD-MM-YYYY")}`, 113, y, { align: "center" });
    y += 10;

    doc.line(10, y, 216, y);
    y += 10;

    // === ENCABEZADO PRODUCTOS ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PRODUCTO", 10, y);
    doc.text("CANT", 100, y);    // más a la izquierda
    doc.text("TOTAL", 210, y, { align: "right" }); // más a la derecha
    y += 10;

    doc.setFont("helvetica", "normal");

    // === DETALLES DE PRODUCTOS ===
    let totalFactura = 0;
    for (const item of factura.listDetallesFactura) {
      const nombre = item.nombre.length > 18 ? item.nombre.substring(0, 17) + "…" : item.nombre;
      const cantidad = item.cantidad.toString();
      const total = `$${item.total.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
      })}`;

      doc.text(nombre, 10, y);
      doc.text(cantidad, 100, y);
      doc.text(total, 210, y, { align: "right" });

      y += 12;
      totalFactura += item.total;
    }

    // === LÍNEA DE SEPARACIÓN ===
    y += 5;
    doc.setDrawColor(150);
    doc.line(10, y, 216, y);
    y += 10;

    // === TOTAL FINAL ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL:", 10, y);
    doc.text(
      `$${totalFactura.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`,
      210,
      y,
      { align: "right" }
    );
    y += 25;

    // === PIE DE PÁGINA ===
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Gracias por su compra", 113, y, { align: "center" });
    y += 10;
    doc.text("www.smartbill.com.co", 113, y, { align: "center" });

    // === MOSTRAR PDF EN NUEVA PESTAÑA ===
    const string = doc.output("datauristring");
    const iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>";
    const x = window.open("", "_blank");
    x.document.open();
    x.document.write(iframe);
  }

  imprimirFactura(factura: Factura) {
    const tipo = sessionStorage.getItem('tipo_impresion') || 'tiquete';

    if (tipo === 'carta') {
      this.getPfdCarta(factura);
    } else {
      this.getPfdTiquete(factura);
    }
  }

  public printInvoicePdf(invoice: Factura): void {
    Swal.fire({
      title: "Factura registrada con exito",
      text: `La factura ${this.factura.codigo} Se ha registrado con exito, puede imprimir un pdf si lo desea`,
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Ok",
      cancelButtonText: "Inprimir pdf",
    }).then((result) => {
      if (!result.value) {
        this.imprimirFactura(invoice);
      } else {
        return;
      }
    });
  }


  //Old filter method
  //public fetchClientes(): void { 
  //this.comClientServices.getListaClientes().subscribe({
  //next: (data) => {
  // confirm it's an array
  //if (Array.isArray(data)) {
  //this.clientes = data;
  //this.filteredClientes = data;
  //console.log(this.clientes);
  //} else {
  //console.error('Expected array but got:', data);
  //}
  //},
  //error: (err) => {
  //console.error('Failed to load customers', err);
  //}
  //})

  //}


  //NEW FILTER METHOD 

  public async filtrarClientes() {
    await this.comClientServices.getCostumerByMobileNumberOrId(this.searchCliente).subscribe((data) => {
      console.log(data);
      if (Array.isArray(data)) {
        this.clientes = data
        this.filteredClientes = data.slice(0, 7);
        console.log(this.clientes);
      } else {
        console.error('Expected array but got:', data);
      }
    })


  }

  changeSearchCliente(documento: string) {
    this.searchCliente = documento

  }

}

const addFooters = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      "Page " + String(i) + " of " + String(pageCount),
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 20,
      {
        align: "center",
      }
    );
  }
};
