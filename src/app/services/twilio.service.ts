import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constantes } from '../comun/constantes';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {

  private endpointFactura = `${Constantes.TWILIO}/factura`;

  constructor(private http: HttpClient) { }

  enviarMensajeFactura(data: any): Observable<any> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.endpointFactura, data, {
      headers: httpHeaders,
      responseType: 'text'  // 👈 va aquí, fuera de headers
    });
  }
}
