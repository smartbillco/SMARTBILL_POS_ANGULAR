import { Component, OnInit } from '@angular/core';
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
declare var $: any;

@Component({
  selector: 'app-admRestaurante',
  templateUrl: './admRestaurante.component.html'
})
export class AdmRestauranteComponent implements OnInit {

  restaurante: Restaurante;
  restauranteActualizar: Restaurante;
  restauranteEliminar: Restaurante;
  restauranteDetalle: Restaurante;
  usuario: Usuario;
  tipoUsuario: String;
  listaEstados: any;

  listaRestaurantes: Array<Restaurante>;
  zona: Zona;
  listaZonas: Array<Zona>;
  nuevaZona: Zona;
  listaMesas: Array<Mesa>;
  listaMesasTodas: Array<Mesa>;
  nuevaMesa: Mesa;
  
  public imgMessage: string;
  
  constructor(
    private router: Router,
    private comRestauranteServices: RestauranteService,
    private userService: AuthService) {

    this.restaurante = new Restaurante();
    this.restaurante.listaZonas = new Array<Zona>();
    this.restauranteActualizar = new Restaurante();
    this.restauranteActualizar.listaZonas = new Array<Zona>();
    this.restauranteDetalle = new Restaurante();
    this.restauranteDetalle.listaZonas = new Array<Zona>();
    this.tipoUsuario = localStorage.getItem('tipoUsuario')
    this.zona = new Zona();
    this.zona.listaMesas = new Array<Mesa>();

    this.listaRestaurantes = new Array<Restaurante>();
    this.nuevaZona = new Zona();
    this.nuevaMesa = new Mesa();

    this.listaEstados = Constantes.ESTADOS;
    if (this.listaEstados.length > 0) {
      this.nuevaMesa.estado = this.listaEstados[0].valor;
    }

    const resp = comRestauranteServices.getListaRestaurantes();
    resp.subscribe((response) => {
      $(document).ready(function () {
        $('#dt-restaurante').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
      }),
      this.listaRestaurantes = JSON.parse(response.toString()).msg;      
    });

    /*const respRestaurantes = comRestauranteServices.getListaRestaurantes();
    respRestaurantes.subscribe((response) => {      
      this.listaRestaurantes = JSON.parse(response.toString()).msg;      
    });*/

    userService.defaultUser.subscribe(user => this.usuario = user);
  }

  ngOnInit() {
    this.initTablaMesas();

  }

  crearRestaurante() {

    console.log(this.restaurante);
    this.restaurante.idEmpresa = Number(localStorage.getItem("idEmpresa"));
    $('#modal-restaurante').modal('hide');
    
    this.comRestauranteServices.nuevoRestaurante(this.restaurante).subscribe((data) => {

      const respuesta = JSON.parse(data.toString())
      if (respuesta.code == '1') { // debe mostrar un success sweet alert
        this.reloadPage('/home/admRestaurantes')
        this.mostrarSweetAlertSuccess('Restaurante registrado correctamente');
      } else if (respuesta.code == '2') {
        this.showDuplicateErrorMessage()
        this.restaurante = new Restaurante();
      }
      //this.restaurante = new Restaurante();
    }, error =>  this.handleError(error));
  }

  eliminarRestaurante(rest: Restaurante) {
    Swal({
      title: '¿Deseas eliminar este Restaurante?',
      // text: 'Esto no se puede revertir',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this.comRestauranteServices.eliminarRestaurante(rest.id).subscribe((response) => {
          let respuesta = JSON.parse(response.toString());
          if (respuesta.code == '1') {
            Swal('Listo!', 'El restaurante ha sido eliminado.', 'success');
            this.reloadPage('/home/restaurantes')
          } else if (respuesta.code == '3') {
            Swal('Error', 'Este restaurante no puede ser eliminado.', 'error');
          };
        }, error => this.handleError(error));
      }
    });
  }

  editarRestaurante() {    
    this.comRestauranteServices.actualizarRestaurante(this.restauranteActualizar).subscribe((response) => {
        let respuesta = JSON.parse(response.toString());
        if (respuesta.code == '1') {
          Swal('Listo!', 'El restaurante ha sido actualizado.', 'success');
          this.reloadPage('/home/restaurantes')

        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
        }
    }, error => this.handleError(error));
    
    $('#modal-editarrestaurante').modal('hide');
  }

  setActualizarRestaurante(rest: Restaurante) {
    this.restauranteActualizar.id = rest.id; 
    this.restauranteActualizar.nombre = rest.nombre;
    this.restauranteActualizar.direccion = rest.direccion;    
  }

  consultarRestaurantes() {
    const resp = this.comRestauranteServices.getListaRestaurantes();
    resp.subscribe((response) => {
      this.listaRestaurantes = JSON.parse(response.toString()).msg;
    }, error => this.handleError(error));
  }
  
  private handleError(error: HttpErrorResponse) {
    Swal(
      'Error!',
      error.message,
      'error'
    );
  }

  private showDuplicateErrorMessage() {
    Swal(
      'Error!',
      'Este restaurante ya se encuentra registrado.',
      'error'
    );
  }

  private mostrarSweetAlertSuccess(body: string) {

    Swal(
      'Listo!',
      body,
      'success'
    );

  }

  private mostrarSweetAlert(titulo: string, body: string, tipo: SweetAlertType) {

    Swal(
      titulo,
      body,
      tipo
    );
  }

  reloadPage(url: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
  }

  cerrarModalEditar() {
    $("#modal-editarrestaurante").hide();
    this.restauranteActualizar = new Restaurante();
  }

  setZonas(rest: Restaurante) {
    this.restauranteDetalle = rest;
    this.consultarZonas(rest.id);
    this.nuevaZona.idRestaurante = rest.id;
    $("#modal-zonas").modal('show');
  }

  addZona() {
    
    if (this.checkZona(this.nuevaZona.nombre)) {                     //si la zona NO existe en lista
      
      console.log(this.nuevaZona);     
      this.comRestauranteServices.nuevaZona(this.nuevaZona).subscribe((data) => {

        const respuesta = JSON.parse(data.toString())
        if (respuesta.code == '1') { // debe mostrar un success sweet alert          
          this.mostrarSweetAlertSuccess('Zona registrada correctamente');
          this.restauranteDetalle.listaZonas.push(this.nuevaZona);
          var idRestaurante: Number;      
          idRestaurante = this.nuevaZona.idRestaurante;
          this.nuevaZona = new Zona();
          this.nuevaZona.idRestaurante = Number(idRestaurante);
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
          this.nuevaZona = new Zona();
        }
        //this.nuevaZona = new nuevaZona();
      }, error =>  this.handleError(error));

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
        }, error => this.handleError(error));
      }
    });
  }

  cerrarModalZonas() {
    $("#modal-zonas").hide();
    this.restauranteDetalle = new Restaurante();
  }
  
  setMesas(rest: Restaurante) {
    this.restauranteDetalle = rest;
    this.consultarZonas(rest.id);
    this.consultarMesasRestaurante(rest.id)
    $("#modal-mesas").modal('show');
  }

  setZona(){
    this.zona.listaMesas = new Array<Mesa>();
    this.listaMesas = this.listaMesasTodas.filter(m => m.idZona == this.nuevaMesa.idZona);
    $("#modal-mesas").modal('show');
  }

  addMesa() {
    
    if (this.checkMesa(this.nuevaMesa.nombre)) {                     //si la mesa NO existe en lista
      
      console.log(this.nuevaMesa);
      this.comRestauranteServices.nuevaMesa(this.nuevaMesa).subscribe((data) => {

        const respuesta = JSON.parse(data.toString())
        if (respuesta.code == '1') { // debe mostrar un success sweet alert          
          this.mostrarSweetAlertSuccess('Mesa registrada correctamente');
          this.zona.listaMesas.push(this.nuevaMesa);
          this.nuevaMesa = new Mesa();
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
          this.nuevaZona = new Zona();
        }
        //this.nuevaMesa = new NuevaMesa();
      }, error =>  this.handleError(error));

    } 
  }  

  checkMesa(nombreMesa: string): boolean {
    const det = this.zona.listaMesas.find(deta => deta.nombre === nombreMesa);
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
        }, error => this.handleError(error));
      }
    });
  }

  consultarZonas(idRestaurante: number){
    const respUtil = this.comRestauranteServices.getListaZonas(idRestaurante);
    respUtil.subscribe((response) => {
      this.restauranteDetalle.listaZonas = JSON.parse(response.toString()).msg;
      console.log(this.restauranteDetalle.listaZonas)
    });
  }

  consultarMesas(idZona: number){
    const respUtil = this.comRestauranteServices.getListaMesasZona(idZona);
    respUtil.subscribe((response) => {
      this.zona.listaMesas = JSON.parse(response.toString()).msg;
    });
  }

  consultarMesasRestaurante(idRestaurante: number){
    const respUtil = this.comRestauranteServices.getListaMesas(idRestaurante);
    respUtil.subscribe((response) => {
      this.listaMesas = JSON.parse(response.toString()).msg;
      this.listaMesasTodas = this.listaMesas
      console.log(this.listaMesas)
    });
  }

  initTablaMesas(){    
    $('#dt-mesas').DataTable({
      'language': {
        'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
      }
    });
  }

  cerrarModalMesas() {
    $("#modal-mesas").hide();
    this.restauranteDetalle = new Restaurante();
  }
}
