import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetProductosService {

  private reloadProductsSource = new Subject();
  reset = this.reloadProductsSource.asObservable();

  constructor() { }


  mostratTodos(){
    this.reloadProductsSource.next();
  }
}
