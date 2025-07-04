import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constantes } from '../comun/constantes';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {

  constructor(private http: HttpClient) {}

  enviarTextoWhatsapp(data: any, url: string): Observable<any> {
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(Constantes.TWILIO + url, data, {headers: httpHeaders});

  }

}
