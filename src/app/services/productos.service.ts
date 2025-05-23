import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Constantes } from 'src/app/comun/constantes';
import { Producto } from '../models/producto';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  producto: Producto;
  listaProductos: Array<Producto>;
  idEmpresa: string;


  private listaSource = new BehaviorSubject<Array<Producto>>(this.listaProductos);
  currentLista = this.listaSource.asObservable();

  constructor(private http: HttpClient) {
    this.idEmpresa = localStorage.getItem("idEmpresa")
    if (!this.listaProductos || this.listaProductos.length === 0) {

      const resp = this.getListarProductos();
      resp.subscribe((response: any) => {

        // this.listaProductos = JSON.parse(response.toString()).msg,
        this.listaProductos = response.msg,
          this.listaSource.next(this.listaProductos);
      });

    }
  }

  getListarProductos(): Observable<any> {
    let idEmpresa = localStorage.getItem("idEmpresa")
    return this.http.get(Constantes.HOST + Constantes.GET_PRODUCTOS_TODOS + "/" + idEmpresa);
  }

  // Traer productos de tipo tienda
  getProductsByType(tipoNegocio: string): Observable<any> {
    return this.http.get(`${Constantes.HOST}${Constantes.GET_PRODUCTOS}/${tipoNegocio}`);
  }

  getListarRecetas(tipoNegocio: string): Observable<any> {
    return this.http.get(`${Constantes.HOST}${Constantes.GET_PRODUCTOS}/${tipoNegocio}`);
  }

  getProductosDisponibles() {
    let idEmpresa = localStorage.getItem("idEmpresa")
    return this.http.get(Constantes.HOST + Constantes.GET_PRODUCTOS_DISPONIBLES + "/" + idEmpresa);
  }

  nuevoProducto(producto: Producto) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'
    });
    return this.http.post(Constantes.HOST + Constantes.POST_PRODUCTOS, producto, { headers: httpHeaders });
  }

  actualizarProducto(producto: Producto) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'
    });
    return this.http.post(Constantes.HOST + Constantes.POST_ACTUALIZAR_PRODUCTOS, producto, { headers: httpHeaders }).pipe(
      map((response: any) => {
        return true;
      }), catchError(err => swal('Error!', err.error.message, 'error'))
    )

  }

  eliminarProducto(producto: Producto) {
    const httpHeaders = new HttpHeaders({
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'
    });
    return this.http.delete(Constantes.HOST + Constantes.DELETE_PRODUCTOS + '/' + producto.idProducto, { headers: httpHeaders });
  }

  subirArchivo(file: File): Observable<any> {


    let url = Constantes.HOST + Constantes.POST_ARCHIVO_PRODUCTOS + this.idEmpresa;
    let formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    return this.http.post(url, formData, options);
  }

  getReporteInventario(listaProductos: Array<Producto>): Observable<any> {
    return this.http.post(Constantes.HOST + Constantes.GET_REPORTE_INV_PROD + Constantes.getIdEmpresa(), listaProductos, { responseType: 'blob' });
  }
}
