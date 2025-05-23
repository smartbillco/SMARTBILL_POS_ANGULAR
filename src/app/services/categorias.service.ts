import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
import { CategoriaProducto } from '../models/categoriaProducto';
import { Observable, BehaviorSubject } from 'rxjs';
import { Constantes } from '../comun/constantes';


@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

 listaCategoria;
  private catlistaSource = new BehaviorSubject<Array<CategoriaProducto>>(this.listaCategoria);
  catcurrentLista = this.catlistaSource.asObservable();
  constructor(private http: HttpClient) { }

  getListaCategoria() {
    return this.http.get(Constantes.HOST + Constantes.GET_CATEGORIAS);
  }

  nuevaCategoria(categoria: CategoriaProducto): Observable<any> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.post(Constantes.HOST + Constantes.POST_CATEGORIAS, categoria, { headers: httpHeaders});
  }

  actualizarCategoria(categoria: CategoriaProducto): Observable<any> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.post(Constantes.HOST + Constantes.POST_ACTUALIZAR_CATEGORIAS, categoria, { headers: httpHeaders});
  }

  eliminarCategoria(categoria: CategoriaProducto) {
    const httpHeaders = new HttpHeaders({
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
      let params: URLSearchParams = new URLSearchParams();
      params.append('id', String(categoria.idCategoriaProducto));
    return this.http.delete(Constantes.HOST + Constantes.DELETE_CATEGORIAS +'/'+ String(categoria.idCategoriaProducto), { headers: httpHeaders } );
    
  }

  subirArchivo(file: File): Observable<any>{

    let url = Constantes.HOST + Constantes.POST_ARCHIVO_CATEGORIAS;
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
