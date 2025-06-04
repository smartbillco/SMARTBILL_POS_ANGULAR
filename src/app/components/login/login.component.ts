import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Usuario } from '../../models/usuario';
import Swal, { SweetAlertType } from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Constantes } from 'src/app/comun/constantes';
import { response } from 'express';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  usuario: Usuario;
  nuevoUsuario;
  LoginUserData = {};
  correoOlvidado: string;

  @Output() inicioSesion = new EventEmitter<Usuario>();

  constructor(private _auth: AuthService, private router: Router,
    private userService: AuthService) {
    this.usuario = new Usuario();
  }

  ngOnInit() {

  }

  login() {

    if (this.usuario.email === '' || this.usuario.password == '') {
      Swal('Campos vacios', 'Verifique si ha escrito su usuario y contraseña', 'error');
      return;
    }

    if (!this.validateEmail(this.usuario.email)) {
      Swal('Correo inválido', 'Debe ingresar un correo electrónico válido.', 'warning');
      return;
    }

    // Llamada a servicio de autenticación de usuario
    this._auth.login(this.usuario).subscribe((res: any) => {
      const resLogin = res;
      if (resLogin.code === '1') {
        this.usuario.tipo = resLogin.msg.tipo;
        this.usuario.setRol();
        this.usuario.empresa = resLogin.msg.empresa;

        // this.inicioSesion.emit(this.usuario);
        this.userService.cambiarUsuario(this.usuario);
        localStorage.setItem('isLoggedIn', 'LogIn');
        localStorage.setItem('nombreEmpleado', resLogin.msg.nombreEmpleado);
        localStorage.setItem('idUsuario', String(resLogin.msg.id));
        localStorage.setItem('idEmpleado', String(resLogin.msg.idEmpleado));
        localStorage.setItem('correo', this.usuario.email);
        localStorage.setItem('rol', this.usuario.rol);
        localStorage.setItem('tipoUsuario', String(this.usuario.tipo));
        localStorage.setItem('idEmpresa', String(this.usuario.empresa.id));
        localStorage.setItem('nit', String(this.usuario.empresa.nit));
        //s wal('Bienvenido', `Hola ${this.usuario.Nombre}, has iniciado sesión exitosamente`, 'success');
        swal('Bienvenido', `Hola, has iniciado sesión exitosamente`, 'success');
        this.router.navigate(['/home']);
      } else {
        swal('Login', `Usuario y/o contraseña invalidos`, 'error');
      }
    });
  }

  resetPassword() {

    if (!this.validateEmail(this.correoOlvidado)) {
      Swal('Correo inválido', 'Debe ingresar un correo electrónico válido.', 'warning');
      return;
    }

    if (this.correoOlvidado == '' || this.correoOlvidado == null) {
      this.mostrarSweetAlert('Error', 'El campo correo es obligatorio', 'warning');
      return;
    }
    const userActualizar = new Usuario();
    userActualizar.email = this.correoOlvidado;
    this.userService.actualizarPassword(userActualizar).subscribe((response) => {

      const respuesta = JSON.parse(response.toString());
      const code = respuesta.code;
      if (code == '1') {

        this.mostrarSweetAlert(Constantes.CORREO_ENVIADO, 'Listo', 'success');
        this.router.navigate(['/login']);
      } else if (code == '2') {                //EL USUARIO NO EXISTE
        this.mostrarSweetAlert(Constantes.CORREO_NO_EXISTE, 'Error', 'error');
        this.router.navigate(['/login']);

      }

    }, error => this.handleError(error));
  }

  private mostrarSweetAlert(body: string, titulo: string, tipo: SweetAlertType) {

    Swal(titulo, body, tipo);

  }

  private handleError(error: HttpErrorResponse) {

  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  registerUser() {
    if (this.nuevoUsuario.email === '' || this.nuevoUsuario.password == '') {
      Swal('Campos vacios', 'Verifique si ha escrito su usuario y contraseña', 'error');
      return;
    }

    if (!this.validateEmail(this.nuevoUsuario.email)) {
      Swal('Correo inválido', 'Debe ingresar un correo electrónico válido.', 'warning');
      return;
    }

    console.log(`Registrando ${this.nuevoUsuario.email}`);

  }

}
