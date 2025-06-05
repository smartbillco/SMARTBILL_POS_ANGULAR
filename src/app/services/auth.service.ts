import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../models/usuario';
import { Constantes } from '../comun/constantes';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private usuarioSource = new BehaviorSubject<Usuario>(new Usuario());
  defaultUser = this.usuarioSource.asObservable();
  constructor(private http: HttpClient) { }

  login(usuario: Usuario): Observable<any>  {
    // const loginUrl = 'http://www.smartbill.us:8086';
    const pathLogin = '/webservice/user/login';
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(Constantes.HOST + pathLogin, usuario, { headers: httpHeaders});
  }

  cambiarUsuario(user: Usuario) {
    this.usuarioSource.next(user);
  }

  actualizarPassword(usuario: Usuario) {

    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    return this.http.post(Constantes.HOST + Constantes.POST_ACTUALIZAR_PASSWORD, usuario, { headers: httpHeaders});
  }

  registrarUsuario(data: any) {
  return this.http.post(`${Constantes.HOST}/webservice/user/addUser`, data); // Usa el endpoint correcto
}

}
