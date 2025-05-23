import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Constantes } from 'src/app/comun/constantes';
import { Insumo } from '../models/insumo';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InsumosService {

  insumo: Insumo;
  listaInsumos: Array<Insumo>;
  idEmpresa: string;


  private listaSource = new BehaviorSubject<Array<Insumo>>(this.listaInsumos);
  currentLista = this.listaSource.asObservable();

  constructor(private http: HttpClient) {
    this.idEmpresa = localStorage.getItem("idEmpresa")
    if (!this.listaInsumos || this.listaInsumos.length === 0) {

      const resp = this.getListarInsumos();
      resp.subscribe((response: any) => {
      // this.listaInsumos = JSON.parse(response.toString()).msg,
      this.listaInsumos = response.msg,

      this.listaSource.next(this.listaInsumos);
      });

    }
  }

  getListarInsumos() {
    let idEmpresa = localStorage.getItem("idEmpresa")
    return this.http.get(Constantes.HOST + Constantes.GET_INSUMOS + "/" + idEmpresa);
  }

  getInsumosDisponibles() {
    let idEmpresa = localStorage.getItem("idEmpresa")
    return this.http.get(Constantes.HOST + Constantes.GET_INSUMOS_DISPONIBLES + "/" + idEmpresa);
  }

  nuevoInsumo(insumo: Insumo) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.post(Constantes.HOST + Constantes.POST_INSUMOS, insumo, { headers: httpHeaders});
  }

  actualizarInsumo(insumo: Insumo) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.post(Constantes.HOST + Constantes.POST_ACTUALIZAR_INSUMOS, insumo, { headers: httpHeaders});
  }

  eliminarInsumo(insumo: Insumo) {
    const httpHeaders = new HttpHeaders({
      'Authorization': '63c42416b411d71fb39774c144d2bb842bb814ba'});
    return this.http.delete(Constantes.HOST + Constantes.DELETE_INSUMOS + '/' +  insumo.id, { headers: httpHeaders});
  }

  subirArchivo(file: File): Observable<any>{

    let url = Constantes.HOST + Constantes.POST_ARCHIVO_INSUMOS + this.idEmpresa;
    let formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    return this.http.post(url, formData, options);
  }

  getReporte(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_REPORTE_INSUMOS + Constantes.getIdEmpresa(), {responseType: 'blob'});
  }
}
