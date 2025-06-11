import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { Constantes } from '../comun/constantes';
import { map } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  res_obtenerClientes;
  cliente: Cliente;

  constructor(private http: HttpClient) { }

  getListaClientes() {
    return this.http.get(Constantes.HOST + Constantes.GET_CLIENTES);
  }

  nuevoCliente(cliente: Cliente): Observable<any> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'
    });
    return this.http.post<any>(Constantes.HOST + Constantes.POST_CLIENTES, cliente, { headers: httpHeaders });
  }

  getByDocument(cliente: Cliente): Observable<any> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(Constantes.HOST + Constantes.GET_CLIENTE_BY_DOCUMENT, cliente, { headers: httpHeaders });
  }

  actualizarCliente(cliente: Cliente) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'
    });
    return this.http.post(Constantes.HOST + Constantes.POST_ACTUALIZAR_CLIENTES, cliente, { headers: httpHeaders });
  }

  eliminarCliente(cliente: Cliente) {
    const httpHeaders = new HttpHeaders({
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'
    });
    return this.http.delete(Constantes.HOST + Constantes.DELETE_CLIENTES + '/' + cliente.id, { headers: httpHeaders });
  }

  subirArchivo(file: File): Observable<any> {

    let url = Constantes.HOST + Constantes.POST_ARCHIVO_CLIENTES;
    let formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    return this.http.post(url, formData, options);
  }

  getCostumerByMobileNumberOrId(value: any) {
    return this.http.get(Constantes.HOST + Constantes.GET_CUSTOMER + value)
  }
}
