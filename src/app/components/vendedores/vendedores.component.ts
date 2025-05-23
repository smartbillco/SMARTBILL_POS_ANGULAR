import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import swal from 'sweetalert2';

import { Usuario } from 'src/app/models/usuario';
import { Constantes } from 'src/app/comun/constantes';
import { Rol } from 'src/app/models/seguridad/rol';
import { AuthService } from 'src/app/services/auth.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Liquidacion } from 'src/app/models/contabilidad/liquidacion';
import { LiquidacionService } from 'src/app/services/contabilidad/liquidacion.service';

import { Empleados } from '../../models/empleados';
declare var $: any;

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styles: []
})
export class VendedoresComponent implements OnInit {

  listVendedores: Array<Usuario>;
  usuario: Usuario;
  usuarioNuevo: any;
  usuarioLiquidar: Usuario;
  liquidacion: Liquidacion;
  tipoUsuario: any;
  listRoles: any;
  contrasena: string;
  confirmarContrasena: string;
  listaEmpleados: Array<Empleados>;
  public idEmpresa: number  = 0;
  public userToEdit = new Usuario();

  constructor(private authService: AuthService, 
              private userService: UsuariosService,  
              private router: Router) { 

    authService.defaultUser.subscribe(user => this.usuario = user);
    this.usuarioNuevo = new Usuario();
    this.usuarioNuevo.listaRoles = new Array<Rol>()
    this.liquidacion = new Liquidacion()
    this.liquidacion.tipo = 1
    this.usuarioLiquidar = new Usuario()
    this.tipoUsuario = localStorage.getItem('tipoUsuario')
    this.listRoles = Constantes.ROLES_USUARIOS
    this.contrasena = ''
    this.confirmarContrasena = ''
    this.listaEmpleados = new Array<Empleados>();
  }

  ngOnInit() {
    this.idEmpresa = parseInt(localStorage.getItem('idEmpresa'));
    this.consultarUsuarios()
  }


  crearUsuarioNuevo(){
    delete this.usuarioNuevo.listaRoles;
    this.usuarioNuevo.idEmpresa = this.idEmpresa;

    if(this.contrasena != this.confirmarContrasena){
      swal('Error!', 'La contraseña NO coincide.', 'warning');
      return;
    }else{
      this.usuarioNuevo.password = this.contrasena;
    }

    $('#modal-usuarioNuevo').modal('hide');

    this.userService.registerUser(this.usuarioNuevo).subscribe((data: any) => {
      swal('Operación exitosa!', data.message, 'success');
      this.reloadPage('/home/vendedores')
    }, error => {
      Constantes.handleError(error)}
    );
    this.usuarioNuevo = new Object();
    this.usuarioNuevo.listaRoles = new Array<Rol>()
  }

  consultarUsuarios() {
    let idEmpresa = localStorage.getItem("idEmpresa")
    this.userService.getUsersByCompany(idEmpresa).subscribe((response: any) => {
      $(document).ready(function () {
        $('#dt-vendedores').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
      })
      response = response
      this.listVendedores = response.msg;      
    }, error => Constantes.handleError(error));

  }

  getColorHabilitado(habilitado: number){
    if(habilitado == 0){
      return 'badge-danger';
    }else{
      return 'badge-primary';
        }
  }
  
  setVendedorLiquidar(usu: Usuario){
    $('#modal-usuariov').modal('show')
    this.usuarioLiquidar = usu;
  }

  liquidarUsuario(){
    $('#modal-liquidar-vendedor').modal('hide')

    this.liquidacion.idUsuario = this.usuarioLiquidar.id

    // console.log(this.liquidacion)
    // /*
    // this.liquicionService.insertar(this.liquidacion).subscribe((response) =>{

    //   response = JSON.parse(response)
    //   if(response.code == '1'){
    //     Constantes.reloadPage('/home/vendedores', this.router)
    //     swal(          'Listo!',          'Usuario liquidado de manera exitosa',          'success'        );  
    //   }else{
    //     swal(    'Error!',     response.msg,       'error'     );
    //   }
      
    // }, error => Constantes.handleError(error))
    // */
  }

  reloadPage(url: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
  }


  editUser(user: Usuario){


    delete this.userToEdit.estado;
    delete this.userToEdit.idEmpleado;

    this.userToEdit.password = this.contrasena;


    
    this.userToEdit.idEmpresa = this.idEmpresa;
    
    console.log(this.userToEdit);
    this.userService.updateUser(this.userToEdit).subscribe( (res: boolean) =>{
      if(res  = true){
        $('#modal-editUser').modal('hide');
        swal('Opreación exitosa', 'Usuario actualizado correctamente', 'success');
        this.reloadPage('/home/vendedores');
      }
    });
  }
}
