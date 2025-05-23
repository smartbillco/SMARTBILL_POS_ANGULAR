import { Component, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/services/productos.service';
import { Producto } from 'src/app/models/producto';
import swal from 'sweetalert2';
import { Constantes } from 'src/app/comun/constantes';
import { CajaService } from 'src/app/services/caja.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  listaProductos: Producto[];
  public idCaja: number = null;

  constructor(
    private _productoService: ProductosService,
    private _cashRegisterServie: CajaService
  ) { }

  ngOnInit() {
    this.idCaja = Number(localStorage.getItem('idCaja'));
    this.consultarProductos();
    this.getMainCashRegister();
  }

  consultarProductos() {
    this._productoService.getProductosDisponibles().subscribe((response: any) => {
      const respuesta = response;
      if (respuesta.code === '1') {
        this.listaProductos = respuesta.msg;
        localStorage.setItem('productos', JSON.stringify(this.listaProductos));

      } else {
        swal('Error', respuesta.msg, 'error');
      }
    }, error => Constantes.handleError(error));
  }

  getMainCashRegister() {
    if (this.idCaja) {
      return;
    } else {
      this._cashRegisterServie.getCaja().subscribe((data: any) => {
        localStorage.setItem('idCaja', data.msg.id.toString());
      });
    }


  }

}
