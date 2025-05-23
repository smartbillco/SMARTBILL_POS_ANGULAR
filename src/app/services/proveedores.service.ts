import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Constantes } from 'src/app/comun/constantes';
import { Proveedor } from '../models/proveedor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  proveedor: Proveedor;
  res_obtenerProveedores;

  constructor(private http: HttpClient) { }


  getListarProveedores(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_PROVEEDORES);
   }

  nuevoProveedor(proveedor: Proveedor): Observable<any> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Autorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.post(Constantes.HOST + Constantes.POST_PROVEEDORES, proveedor, { headers: httpHeaders});
  }

  actualizarProveedor(proveedor: Proveedor) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Autorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.post(Constantes.HOST + Constantes.POST_ACTUALIZAR_PROVEEDORES, proveedor, { headers: httpHeaders});
  }

  eliminarProveedor(proveedor: Proveedor) {
    const httpHeaders = new HttpHeaders({
      'Autorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.delete(Constantes.HOST + Constantes.DELETE_PROVEEDORES + '/' + proveedor.idProveedor, { headers: httpHeaders});
  }
  getReporte(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_REPORTE_PROVEEDORES , {responseType: 'blob'});
  }
  subirArchivo(file: File): Observable<any>{

    let url = Constantes.HOST + Constantes.POST_ARCHIVO_PROVEEDORES;
    let formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    return this.http.post(url, formData, options);
  }
}
