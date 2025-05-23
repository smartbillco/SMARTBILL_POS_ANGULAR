import { Component, OnInit, ViewChild } from '@angular/core';
import { Restaurante } from 'src/app/models/restaurante/restaurante';
import { Zona } from 'src/app/models/restaurante/zona';
import { Mesa } from 'src/app/models/restaurante/mesa';
import { HttpErrorResponse } from '@angular/common/http';
import { RestauranteService } from 'src/app/services/restaurante/restaurante.service';
import Swal, { SweetAlertType } from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario';
import { Router } from '@angular/router';
import { Constantes } from 'src/app/comun/constantes';
import { Cliente } from 'src/app/models/cliente';
import { ClientesService } from 'src/app/services/clientes.service';
import { Reservas } from 'src/app/models/restaurante/reservas';
import { ReservasService } from 'src/app/services/restaurante/reservas.service';
import { Empleados } from 'src/app/models/empleados';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { MeseroMesa } from 'src/app/models/restaurante/mesero-mesa';
import { ListProductosComponent } from './list-productos/list-productos.component';
import { ResumenVentaComponent } from './resumen-venta/resumen-venta.component';
import { Producto } from 'src/app/models/producto';
import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html'
})
export class RestauranteComponent implements OnInit {

  @ViewChild(ListProductosComponent) listaProductosComponent: ListProductosComponent;
  @ViewChild(ResumenVentaComponent) resumenVenta : ResumenVentaComponent;
  restaurante: Restaurante;
  restauranteActualizar: Restaurante;
  restauranteEliminar: Restaurante;
  usuario: Usuario;
  tipoUsuario: any;
  listaEstados: any;
  listaClientes: Array<Cliente>;
  listaReservas: Array<Reservas>;
  listaEmpleados: Array<Empleados>;

  listaRestaurantes: Array<Restaurante>;
  zona: Zona;
  listaZonas: Array<Zona>;
  nuevaZona: any;
  listaMesas: Array<Mesa>;
  nuevaMesa: Mesa;
  nuevoMeseroMesa: MeseroMesa;
  mesa: Mesa;

  nuevaReserva: Reservas;
  reservaCancelar: Reservas;
  reservaEditar: Reservas;

  public imgMessage: string;

  constructor(
    private router: Router, private comReservaService: ReservasService,
    private comRestauranteServices: RestauranteService, private comEmpleadoService: EmpleadoService,
    private userService: AuthService, private comClientServices: ClientesService) {

    this.restaurante = new Restaurante();
    this.restaurante.listaZonas = new Array<Zona>();
    this.restauranteActualizar = new Restaurante();
    this.restauranteActualizar.listaZonas = new Array<Zona>();
    this.restaurante = new Restaurante();
    this.restaurante.listaZonas = new Array<Zona>();
    this.tipoUsuario = localStorage.getItem('tipoUsuario')
    this.zona = new Zona();
    this.zona.listaMesas = new Array<Mesa>();

    this.listaRestaurantes = new Array<Restaurante>();
    this.nuevaZona = new Zona();
    this.nuevaMesa = new Mesa();
    this.nuevoMeseroMesa = new MeseroMesa()
    this.mesa = new Mesa();
    this.nuevaReserva = new Reservas()
    this.listaReservas = new Array<Reservas>()
    this.listaEstados = Constantes.ESTADOS;
    this.listaEmpleados = new Array<Empleados>()
    this.consultarEmpleados()
    this.reservaEditar = new Reservas()
    if (this.listaEstados.length > 0) {
      this.nuevaMesa.estado = this.listaEstados[0].valor;
    }

    const resp = comRestauranteServices.getListaRestaurantes();
    resp.subscribe((response: any) => {
      // this.listaRestaurantes = JSON.parse(response.toString()).msg;
      this.listaRestaurantes = response.msg

      if(this.listaRestaurantes.length > 0){
        this.restaurante = this.listaRestaurantes[0];
        this.setRestaurante(this.restaurante);
      }
    });

    userService.defaultUser.subscribe(user => this.usuario = user);
    this.comClientServices.getListaClientes().subscribe((response :any) => {
      // this.listaClientes = JSON.parse(response.toString()).msg;
      this.listaClientes = JSON.parse(response.toString()).msg;response.msg
    }, error => Constantes.handleError(error));

    this.reservaCancelar = new Reservas()
  }

  ngOnInit() {

  }

  consultarRestaurantes() {
    const resp = this.comRestauranteServices.getListaRestaurantes();
    resp.subscribe((response: any) => {
      // this.listaRestaurantes = JSON.parse(response.toString()).msg;
      this.listaRestaurantes = response.msg

    }, error => Constantes.handleError(error));
  }

  setRestaurante(rest: Restaurante){
    this.restaurante.listaZonas = new Array<Zona>()
    this.consultarZonas(rest.id);
  }

  setZonaRestaurante(zona: Zona){

    if(zona !== null){
      this.zona = zona;
      this.zona.listaMesas = new Array<Mesa>();
      this.consultarMesas(zona.id);
    }else{
      this.consultarMesas(0);
    }
  }

  private showDuplicateErrorMessage() {
    Swal(      'Error!',      'Este restaurante ya se encuentra registrado.',      'error'    );
  }

  private mostrarSweetAlertSuccess(body: string) {

    Swal(      'Listo!',      body,      'success'    );
  }

  reloadPage(url: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
  }

  cerrarModalEditar() {
    $("#modal-editarReserva").hide();
    this.restauranteActualizar = new Restaurante();
  }

  // ZONAS
  // ----------------------------------------------------------------------------------------------

  setZonas() {
    this.nuevaZona.idRestaurante = this.restaurante.id;
    // this.nuevaZona.idRestaurante = '1';

    $("#modal-zonas").modal('show');
  }

  addZona() {

    $("#modal-zonas").modal('hide');
    if (this.checkZona(this.nuevaZona.nombre)) {        //si la zona NO existe en lista

      console.log(this.nuevaZona);


      this.comRestauranteServices.nuevaZona(this.nuevaZona).subscribe((data) => {
        console.log(data);


        const respuesta = JSON.parse(data.toString())

        if (respuesta.code == '1') { // debe mostrar un success sweet alert
          this.mostrarSweetAlertSuccess('Zona registrada correctamente');
          this.consultarZonas(this.restaurante.id);
          var idRestaurante: Number;
          idRestaurante = this.nuevaZona.idRestaurante;
          this.nuevaZona = new Zona();
          this.nuevaZona.idRestaurante = Number(idRestaurante);
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
          this.nuevaZona = new Zona();
        }
        //this.nuevaZona = new nuevaZona();
      }, error =>  Constantes.handleError(error));

    }
  }

  checkZona(nombreZona: string): boolean {
    const det = this.restaurante.listaZonas.find(deta => deta.nombre === nombreZona);
    return det === undefined || det === null;
  }

  eliminarZona(zona: Zona) {
    Swal({
      title: '¿Deseas eliminar esta Zona?',
      // text: 'Esto no se puede revertir',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this.comRestauranteServices.eliminarZona(zona.id).subscribe((response) => {
          let respuesta = JSON.parse(response.toString());
          if (respuesta.code == '1') {
            Swal('Listo!', 'La Zona ha sido eliminada.', 'success');
            this.consultarZonas(zona.idRestaurante);
            $('#dt-zonas').update();
          } else if (respuesta.code == '3') {
            Swal('Error', 'Esta zona no puede ser eliminada.', 'error');
          };
        }, error => Constantes.handleError(error));
      }
    });
  }

  cerrarModalZonas() {
    $("#modal-zonas").hide();
    this.nuevaZona = new Zona();
  }

  // MESAS
  // ----------------------------------------------------------------------------------------------

  setMesas(rest: Restaurante) {
    this.restaurante = rest;
    this.consultarZonas(rest.id);
    $("#modal-mesas").modal('show');
  }

  setZona(zona: Zona){
    this.zona = zona;
    this.nuevaMesa.idZona = zona.id;
    if (this.listaEstados.length > 0) {
      this.nuevaMesa.estado = this.listaEstados[0].valor;
    }
    $("#modal-mesas").modal('show');
  }

  addMesa() {

    $("#modal-mesas").modal('hide');
    if (this.checkMesa(this.nuevaMesa)) {                     //si la mesa NO existe en lista

      console.log(this.nuevaMesa);
      this.comRestauranteServices.nuevaMesa(this.nuevaMesa).subscribe((data) => {

        const respuesta = JSON.parse(data.toString())
        if (respuesta.code == '1') { // debe mostrar un success sweet alert
          this.mostrarSweetAlertSuccess('Mesa registrada correctamente');
          this.consultarMesas(this.nuevaMesa.idZona);
          this.nuevaMesa = new Mesa();
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
          this.nuevaMesa = new Mesa();
        }
        //this.nuevaMesa = new NuevaMesa();
      }, error =>  Constantes.handleError(error));

    }
  }

  checkMesa(mesa: Mesa): boolean {

    this.consultarMesas(mesa.idZona);
    const det = this.zona.listaMesas.find(deta => deta.nombre === mesa.nombre);
    return det === undefined || det === null;
  }

  eliminarMesa(mesa: Mesa) {
    Swal({
      title: '¿Deseas eliminar esta Mesa?',
      // text: 'Esto no se puede revertir',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this.comRestauranteServices.eliminarMesa(mesa.id).subscribe((response) => {
          let respuesta = JSON.parse(response.toString());
          if (respuesta.code == '1') {
            Swal('Listo!', 'La Mesa ha sido eliminada.', 'success');
            this.consultarMesas(mesa.idZona);
            $('#dt-mesas').update();
          } else if (respuesta.code == '3') {
            Swal('Error', 'Esta mesa no puede ser eliminada.', 'error');
          };
        }, error => Constantes.handleError(error));
      }
    });
  }

  consultarZonas(idRestaurante: number){
    const respUtil = this.comRestauranteServices.getListaZonas(idRestaurante);
    respUtil.subscribe((response) => {
      this.restaurante.listaZonas = JSON.parse(response.toString()).msg;
      for(var i = 0; i < this.restaurante.listaZonas.length; i++){
        const respUtil = this.comRestauranteServices.getListaMesasZona(this.restaurante.listaZonas[i].id);
        respUtil.subscribe((response) => {
          //this.restaurante.listaZonas[i].listaMesas = new Array<Mesa>();
          //this.restaurante.listaZonas[i].listaMesas = JSON.parse(response.toString()).msg;
        });
      }
    });
  }


  consultarMesas(idZona: number){

    if(idZona == 0){
      const respUtil = this.comRestauranteServices.getListaMesas(this.restaurante.id);
      respUtil.subscribe((response) => {
        this.zona.listaMesas = JSON.parse(response.toString()).msg;
      });
    }else{
      const respUtil = this.comRestauranteServices.getListaMesasZona(idZona);
      respUtil.subscribe((response) => {
        this.zona.listaMesas = JSON.parse(response.toString()).msg;
      });
    }

  }

  cerrarModalMesas() {
    $("#modal-mesas").hide();
    this.nuevaMesa = new Mesa();
  }

  abrirMesa(mesa: Mesa){
    this.mesa = mesa;
    if(this.mesa.estado != 0 && this.mesa.estado != 3) { //la mesa esta disponible
    $("#modal-abrirMesa").modal('show');
    return;
    }else{
      // la mesa esta abierta, ver productos y venta
      this.consultarDetallesMesa(mesa.id)
      //$("#modal-orden-mesa").modal('show');

    }

  }

  consultarDetallesMesa(idMesa: number){

    this.resumenVenta.consultarNumeroOrdenMesa(idMesa)
    this.resumenVenta.consultarDetallesMesa(idMesa)
  }

  cerrarMesa(){
    this.resumenVenta.cerrarMesa(this.mesa)
    //this.consultarMesas(this.mesa.idZona)
  }

  asignarMeseroMesa(){
    this.nuevoMeseroMesa.idMesa = this.mesa.id
    this.resumenVenta.initFactura()
    this.nuevoMeseroMesa.factura = this.resumenVenta.factura;

    let estado = this.mesa.estado;

    if(estado == 1) estado = 0;
    if(estado == 2) estado = 3;

    this.comRestauranteServices.asignarMesa(this.nuevoMeseroMesa, estado).subscribe((response) => {
      response = JSON.parse(response.toString())
      if(response.code == '1'){

        Swal('Listo', response.msg, 'success');
        this.consultarMesas(this.restaurante.id)
        $("#modal-abrirMesa").modal('hide');

      }else{
        Swal('Error', response.msg, 'error');

      }

    }, error => Constantes.handleError(error))

  }

  actualizarMesa(mesa: Mesa){
    this.mesa = mesa;
    this.comRestauranteServices.actualizarMesa(this.mesa).subscribe((response) => {
      let respuesta = JSON.parse(response.toString());
      if (respuesta.code == '1') {
        Swal('Listo!', 'La Mesa ha sido actualizada.', 'success');
      } else if (respuesta.code == '2') {
        this.showDuplicateErrorMessage()
      }
  }, error => Constantes.handleError(error));

  $('#modal-abrirMesa').modal('hide');
  }

  // RESERVAS
  // ----------------------------------------------------------------------------------------------

  reservarMesa(mesa: Mesa){
    //this.zona = this.restaurante.listaZonas.find(z => z.id == mesa.idZona)
    this.nuevaReserva.idMesa = mesa.id
    this.mesa = mesa;

    $("#modal-agregarReserva").modal('show');
  }

  crearReserva() {

    this.nuevaReserva.idMesa = this.mesa.id
    $('#modal-agregarReserva').modal('hide');

    if(this.nuevaReserva.cantidadPersonas > this.mesa.cantidadPersonas){

      Swal(      'Error!',      'La cantidad de personas de la reserva no puede ser mayor al numero de personas de la mesa.',      'error'    );

      return;
    }

    let dateIni = new Date()
    let dateEnd = new Date(this.nuevaReserva.fechaReserva)

    if(dateIni > dateEnd){

      Swal(      'Error!',  'Fecha de reserva incorrecta',  'error'    );

      return;
    }

    this.comReservaService.nuevaReserva(this.nuevaReserva).subscribe((data) => {

      const respuesta = JSON.parse(data.toString())
      if (respuesta.code == '1') { // debe mostrar un success sweet alert
        this.mostrarSweetAlertSuccess('Reserva registrada correctamente');
        this.nuevaReserva = new Reservas()
        this.consultarMesas(this.restaurante.id)
      } else if (respuesta.code == '2') {
        this.showDuplicateErrorMessage()
        this.mesa = new Mesa();
      }
      //this.restaurante = new Restaurante();
    }, error =>  Constantes.handleError(error));
  }

  eliminarReserva(res: Reservas) {

    this.reservaCancelar = res;

    Swal({
      title: '¿Deseas cancelar esta Reserva?',
      // text: 'Esto no se puede revertir',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this.reservaCancelar.estado = 0
        this.comReservaService.actualizarReserva(this.reservaCancelar).subscribe((response) => {
          let respuesta = JSON.parse(response.toString());
          if (respuesta.code == '1') {
            Swal('Listo!', 'La Reserva ha sido eliminada.', 'success');
            this.reloadPage('/home/restaurante')
            $('#modal-verReservas').modal('hide');

          } else if (respuesta.code == '3') {
            Swal('Error', 'Esta reserva no puede ser eliminada.', 'error');
          };
        }, error => Constantes.handleError(error));
      }
    });
  }

  setColorMesa(estado: number){

    switch(estado){
      case 0:
      return 'panel-danger';
      case 1:
      return 'panel-primary';
      case 2:
      return 'panel-success';
      case 3:
      return 'panel-amber';
    }
  }

  consultarReservas(mesa: Mesa){

    this.mesa = mesa
    this.comReservaService.getReservasMesa(String(mesa.id)).subscribe((data) => {

      const respuesta = JSON.parse(data.toString())
      if (respuesta.code == '1') {                        // debe mostrar un success sweet alert
        this.listaReservas = respuesta.msg
        $("#modal-verReservas").modal('show');
      } else if (respuesta.code == '2') {
        this.showDuplicateErrorMessage()
        //this.mesa = new Mesa();
      }
    }, error =>  Constantes.handleError(error));

  }

  getReservasRestaurante(){

    this.comReservaService.getReservasRestaurante(String(this.restaurante.id)).subscribe((response) => {

      const respuesta = JSON.parse(response.toString())

      if(respuesta.code == '1'){

        this.listaReservas = respuesta.msg
      }else{
        swal('Error',respuesta.msg,'error')
      }

    }, error =>  Constantes.handleError(error))
  }

  actualizarReserva(){

    this.comReservaService.actualizarReserva(this.reservaEditar).subscribe((response) =>{

      const respuesta = JSON.parse(response.toString())
      if (respuesta.code == '1') {                        // debe mostrar un success sweet alert

        $("#modal-editarReserva").modal('hide');
        Swal(      'Listo!', respuesta.msg,      'success'    );

      } else  {
        Swal(      'Error!', respuesta.msg,      'error'    );
      }

    }, error =>  Constantes.handleError(error))
  }

  setReservaEditar(res: Reservas){

    $("#modal-verReservas").modal('hide');
    $("#modal-reservas-todas").modal('hide');

    console.log(this.mesa)
    console.log(this.zona)
    this.reservaEditar = res
    console.log(this.reservaEditar)
    $("#modal-editarReserva").modal('show');


  }

  addProducto(prod: Producto){

    this.resumenVenta.addProducto(prod)

  }

  mesaCerradaEvent(res: any){
    this.consultarMesas(this.mesa.idZona)
    this.mesa = new Mesa()
  }
  //EMPLEADOS
  consultarEmpleados(){
    this.comEmpleadoService.getListaEmpleados().subscribe((response) => {
      response = JSON.parse(response.toString())
      if(response.code == '1'){
        this.listaEmpleados = response.msg
      }else{
        Swal('Error', 'No se puede consultar empleados.', 'error');
      }
    }, error => Constantes.handleError(error))
  }

  public guardarDetallesOrden(): void {

  }
  
}

