import { Component, OnInit } from '@angular/core';
import { Rol } from 'src/app/models/seguridad/rol';
import { HttpErrorResponse } from '@angular/common/http';
import { SeguridadService } from 'src/app/services/seguridad/seguridad.service';
import Swal, { SweetAlertType } from 'sweetalert2';
import { Usuario } from 'src/app/models/usuario';
import { Router } from '@angular/router';
import { Constantes } from 'src/app/comun/constantes';
import { Permiso } from 'src/app/models/seguridad/permiso';
import { PermisoRol } from 'src/app/models/seguridad/permiso-rol';
declare var $: any;

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {

  rol: Rol;
  rolActualizar: Rol;
  rolEliminar: Rol;
  rolDetalle: Rol;
  usuario: Usuario;
  tipoUsuario: string;
  
  listaRols: Array<Rol>;
  listaRolsTodos: Array<Rol>;
  nuevoPermiso: Permiso;
  listaPermisos: Array<Permiso>;
  listaPermisosActivos: Array<Permiso>;
  listaEstados: any;
  listaPermisosRoles: Array<PermisoRol>;

  constructor(
    private router: Router,
    private comRolServices: SeguridadService) {

    this.rol = new Rol();
    this.rol.listaPermisos = new Array<Permiso>();
    this.rolActualizar = new Rol();
    this.rolDetalle = new Rol();
    this.rolDetalle.listaPermisos = new Array<Permiso>();
    this.nuevoPermiso = new Permiso();
    this.listaPermisos = new Array<Permiso>();
    this.listaPermisosActivos = new Array<Permiso>();
    this.listaPermisosRoles =  new Array<PermisoRol>();
    
    this.listaEstados = Constantes.ESTADOS;    
    if (this.listaEstados.length > 0) {
      this.rol.estado = this.listaEstados[0].valor;
    }

    this.tipoUsuario = localStorage.getItem('tipoUsuario')
    
    const resp = comRolServices.getListaRoles();
    resp.subscribe((response) => {
      $(document).ready(function () {
        $('#dt-rol').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
        $('#dt-permisos-rol').DataTable({
        'language': {
          'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
        }
      });
  
      $('#dt-permisos-rol-edit').DataTable({
        'language': {
          'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
        }
      });
      }),
      this.listaRols = JSON.parse(response.toString()).msg;
      this.listaRolsTodos = this.listaRols;
    });

    const respRols = comRolServices.getListaRoles();
    respRols.subscribe((response) => {
      this.listaRols = JSON.parse(response.toString()).msg;
    });
    
    const respPermisos = comRolServices.getPermisosActivos();
    respPermisos.subscribe((response) => {
      this.listaPermisosActivos = JSON.parse(response.toString()).msg;      
    });
        
  }

  ngOnInit() {
    
  }

  crearRol() {

    console.log(this.rol);
    if(this.rol.listaPermisos.length < 1){

      Swal(        'Error!',        'Debe asignar por lo menos un permiso.',        'error'      );
      return;
    }
    this.rol.idEmpresa = Number(localStorage.getItem("idEmpresa"));
    $('#modal-rol').modal('hide');
    
    if (this.rol.listaPermisos.length > 0) {
      this.comRolServices.nuevoRol(this.rol).subscribe((data) => {

        const respuesta = JSON.parse(data.toString())
        if (respuesta.code == '1') { // debe mostrar un success sweet alert
          this.reloadPage('/home/roles')
          this.mostrarSweetAlertSuccess('Rol registrado correctamente');
          this.rol = new Rol();
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
          this.rol = new Rol();
        }
        //this.rol = new Rol();
      }, error =>  this.handleError(error));
    }else{
      this.mostrarSweetAlert('Error', 'Se debe asignar al menos un permiso.', 'error');
    }
  }

  addPermiso() {
    
    if (this.checkDetalle(this.nuevoPermiso.id, this.rol)) {                     //si el insumo NO existe en lista
      this.rol.listaPermisos.push(this.nuevoPermiso);
      this.nuevoPermiso = new Permiso();
    } 
  }


  checkDetalle(idPermiso: number, rol: Rol): boolean {
    const det = rol.listaPermisos.find(deta => deta.id === idPermiso);
    return det === undefined || det === null;
  }

  borrarPermisoRol(det: Permiso) {
    const index = this.rol.listaPermisos.indexOf(det);
    this.rol.listaPermisos.splice(index, 1);
  }
  
  eliminarRol(rl: Rol) {
    Swal({
      title: '¿Deseas eliminar este Rol?',
      // text: 'Esto no se puede revertir',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this.comRolServices.eliminarRol(rl.id).subscribe((response) => {
          let respuesta = JSON.parse(response.toString());
          if (respuesta.code == '1') {
            Swal('Listo!', 'El rol ha sido eliminado.', 'success');
            this.reloadPage('/roles')
          } else if (respuesta.code == '3') {
            Swal('Error', 'Este rol no puede ser eliminado.', 'error');
          };
        }, error => this.handleError(error));
      }
    });
  }

  editarRol() {    
    this.comRolServices.actualizarRol(this.rolActualizar).subscribe((response) => {
        let respuesta = JSON.parse(response.toString());
        if (respuesta.code == '1') {
          this.asignarNuevosPermisosRol()
/*
          Swal('Listo!', 'El rol ha sido actualizado.', 'success');
          this.reloadPage('/home/roles')
*/
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
        }
    }, error => this.handleError(error));
    
    $('#modal-editarrol').modal('hide');
  }

  asignarNuevosPermisosRol(){
    this.comRolServices.asignarPermisoRol(this.listaPermisosRoles).subscribe((response)=> {
      let respuesta = JSON.parse(response.toString());
      if (respuesta.code == '1') {
        
                  Swal('Listo!', 'El rol ha sido actualizado.', 'success');
                  this.reloadPage('/home/roles')
        
                } else if (respuesta.code == '2') {
                  this.showDuplicateErrorMessage()
                }
    }, error => Constantes.handleError(error))
  }
  
  setActualizarRol(rl: Rol) {
    
   /* this.rolActualizar.id = rl.id;
    this.rolActualizar.nombre = rl.nombre;
    this.rolActualizar.estado = rl.estado;
    this.rolActualizar.listaPermisos = new Array<Permiso>();
*/
    const respPermisos = this.comRolServices.getPermisosRol(rl.id);
    respPermisos.subscribe((response) => {
      this.rolActualizar = rl;
      this.rolActualizar.listaPermisos = JSON.parse(response.toString()).msg;
      
    });
  }

  addPermisoEditar() {
    if (this.checkDetalle(this.nuevoPermiso.id, this.rolActualizar)) {                     //si el insumo NO existe en lista
      this.rolActualizar.listaPermisos.push(this.nuevoPermiso);
      this.listaPermisosRoles.push(new PermisoRol(this.nuevoPermiso.id, this.rolActualizar.id))
      this.nuevoPermiso = new Permiso();
    } 
  }

  consultarRols() {
    const resp = this.comRolServices.getListaRoles();
    resp.subscribe((response) => {
      this.listaRols = JSON.parse(response.toString()).msg;
    }, error => this.handleError(error));
  }
  
  setPermisosRol(rol: Rol) {
    this.rolDetalle.id = rol.id;    
    this.rolDetalle.nombre = rol.nombre;
    this.rolDetalle.listaPermisos = new Array<Permiso>();
    const permisos = this.comRolServices.getPermisosRol(rol.id);
    permisos.subscribe((response) => {
      this.listaPermisos = JSON.parse(response.toString()).msg;
      //this.rolDetalle.listaPermisos = this.listaPermisos;
    }, error => this.handleError(error));
    
    $("#modal-permisosRol").modal('show');
  }

  cerrarModalPermisosRol() {
    $("#modal-permisosRol").hide();    
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
      'Este rol ya se encuentra registrado.',
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
    $("#modal-editarrol").hide();
    this.rolActualizar = new Rol();
  }
  
  eliminarPermisoRol(permiso: Permiso) {
    const index = this.rolDetalle.listaPermisos.indexOf(permiso);
    this.rolDetalle.listaPermisos.splice(index, 1);
  }


}
