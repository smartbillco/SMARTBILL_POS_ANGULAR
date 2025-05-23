import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constantes } from '../comun/constantes';
import { ConceptoCaja } from '../models/caja/concepto-caja';
import { MovimientoCaja, AperturaCaja, cierreCaja } from '../models/caja/movimiento-caja';
import { map, catchError } from 'rxjs/operators';
import swal from 'sweetalert2';
import { Caja } from '../models/caja/caja';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  constructor(private http: HttpClient) { }

  getConceptosCaja(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_CONCEPTOS_CAJA + Constantes.getIdEmpresa());
  }

  getMovimientosByFecha(idCaja: number,fecha: string): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_MOVIMIENTOS_CAJA_BY_FECHA + String(idCaja) + '/' + fecha);
  }

  getCaja(): Observable<any> {    
    return this.http.get(Constantes.HOST + Constantes.GET_CAJA_INFO + Constantes.getIdEmpresa());    
  }

  nuevoConcepto(concepto: ConceptoCaja): Observable<any> {
    return this.http.post(Constantes.HOST + Constantes.POST_CONCEPTO_CAJA, concepto);
  }

  nuevoMovimiento(movimiento: MovimientoCaja): Observable<any> {
    return this.http.post(Constantes.HOST + Constantes.POST_MOVIMIENTO_CAJA, movimiento);
  }

  getReporte(listMovimientos: Array<MovimientoCaja>): Observable<any> {
    return this.http.post(Constantes.HOST + Constantes.POST_REPORTE_MOVIMIENTOS_CAJA, listMovimientos, {responseType: 'blob'});
  }

  getCashRegisters(compnayId: number){
    return this.http.get(Constantes.HOST + Constantes.GET_ALL_CASH_REGISTERS + `/${compnayId}`).pipe(
      map( (response: any) =>{
        return response
      }), catchError( err => {
        return swal('Error', err, 'error');
      })
    )
  }

  inserCahsRegister(cashRegister: Caja){

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });   
    
    return this.http.post( Constantes.HOST + Constantes.POST_INSERT_CASH_REGISTER, cashRegister, {headers: httpHeaders}).pipe(
      map( (data:any) =>{
        return true;
      }), catchError( err =>{
        return swal('Error!', err, 'error');
      })
    )
  }

  getCashRegisterById(id: number): Observable<any>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });   
    
    return this.http.get(Constantes.HOST + Constantes.GET_CASH_REGISTER_BY_ID + `/${id}`, {headers})
  }

  closeCashRegister(cashRegister: cierreCaja){
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });   
    
    return this.http.post( Constantes.HOST + Constantes.CLOSE_CASH_REGISTER, cashRegister, {headers: httpHeaders}).pipe(
      map( (response: any) => true),
      catchError( err => {
        console.log(err.error.message);
        return swal('Error!', err.error.message, 'error');
      })
    )
  }

  getAllCashRegister(companyId: number){
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });   

    return this.http.get(Constantes.HOST + Constantes.GET_ALL_CASH_REGISTER + `/${companyId}`, {headers: httpHeaders}).pipe(
      map( (response: Caja[]) => {
        return response
      }),catchError( err => {
        return swal('Error!', err, 'error');
      })
    )
  }

  openCashRegister(cashRegisterToOpen: AperturaCaja){
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    }); 

    return this.http.post(Constantes.HOST + Constantes.OPNE_CASH_REGISTER, cashRegisterToOpen, {headers: httpHeaders}).pipe(
      map( (response: any) =>{
        return response        
      }),catchError( err => {
        return swal('Error!', err.error.message, 'error');
      })
    )

  }
}
