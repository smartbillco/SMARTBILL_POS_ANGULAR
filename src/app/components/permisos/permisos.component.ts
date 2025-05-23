import { Component, OnInit } from '@angular/core';
import { Permiso } from 'src/app/models/seguridad/permiso';
import { HttpErrorResponse } from '@angular/common/http';
import { SeguridadService } from 'src/app/services/seguridad/seguridad.service';
import Swal, { SweetAlertType } from 'sweetalert2';
import { Router } from '@angular/router';
import { Constantes } from 'src/app/comun/constantes';
declare var $: any;

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html'
})
export class PermisosComponent implements OnInit {

  permiso: Permiso;
  permisoActualizar: Permiso;
  permisoEliminar: Permiso;  
  
  listaPermisos: Array<Permiso>;
  listaPermisosTodos: Array<Permiso>;    
  tipoUsuario: string;
  listaEstados: any;

  constructor(
    private router: Router,
    private comPermisoServices: SeguridadService) {

    this.permiso = new Permiso();
    this.permisoActualizar = new Permiso();    
    this.tipoUsuario = localStorage.getItem('tipoUsuario')
    
    this.listaEstados = Constantes.ESTADOS;
    if (this.listaEstados.length > 0) {
      this.permiso.estado = this.listaEstados[0].valor;
    }

    const resp = comPermisoServices.getPermisos();
    resp.subscribe((response) => {
      $(document).ready(function () {
        $('#dt-permiso').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
      }),
      this.listaPermisos = JSON.parse(response.toString()).msg;
      this.listaPermisosTodos = this.listaPermisos;
    });

    const respPermisos = comPermisoServices.getPermisos();
    respPermisos.subscribe((response) => {      
      this.listaPermisos = JSON.parse(response.toString()).msg;      
    });    
  }

  editarPermiso() {    
    this.comPermisoServices.actualizarPermiso(this.permisoActualizar).subscribe((response) => {
        let respuesta = JSON.parse(response.toString());
        if (respuesta.code == '1') {
          Swal('Listo!', 'El permiso ha sido actualizado.', 'success');
          this.reloadPage('/home/permisos')

        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
        }
    }, error => this.handleError(error));
    
    $('#modal-editarpermiso').modal('hide');
  }

  setActualizarPermiso(per: Permiso) {
    this.permisoActualizar.id = per.id;    
    this.permisoActualizar.nombre = per.nombre;
    this.permisoActualizar.url = per.url;
    this.permisoActualizar.estado = per.estado;    
  }

  ngOnInit() {

  }
    
  consultarPermisos() {
    const resp = this.comPermisoServices.getPermisos();
    resp.subscribe((response) => {
      this.listaPermisos = JSON.parse(response.toString()).msg;
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
    $("#modal-editarpermiso").hide();
    this.permisoActualizar = new Permiso();
  }

  getColorStock(inventario: number) {
    return Constantes.getColorInventario(inventario);
  }  

}
