import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Constantes } from '../comun/constantes';
import { Observable, throwError } from 'rxjs';
import { Empresas } from '../models/empresas';
import { catchError, map } from 'rxjs/operators';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor(private http: HttpClient) { }


  private handleError(error: HttpErrorResponse) {
    console.error('Server error:', error);
    return throwError(() => new Error('Error en el registro de empresa. Intente más tarde.'));
  }


  registrarNuevaEmpresa(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(Constantes.HOST + Constantes.POST_EMPRESA, data, { headers }).pipe(
      catchError(this.handleError)
    );


  }

  getInfoEmpresa(): Observable<any> {
    let nit = localStorage.getItem("nit")
    return this.http.get(Constantes.HOST + Constantes.GET_INFO_EMPRESA + nit);
  }

  actualizarEmpresa(emp: Empresas){
    return this.http.put(Constantes.HOST + Constantes.PUT_EMPRESA, emp).pipe(
      map( (response: any) => true ),
      catchError( err => {
      return swal('Error!', err.error.message, 'error')})
    )
  }
}
