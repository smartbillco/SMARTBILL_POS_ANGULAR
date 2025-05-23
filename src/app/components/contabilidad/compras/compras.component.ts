import { Component, OnInit } from '@angular/core';
import { CompraService } from 'src/app/services/contabilidad/compra-producto.service';
import { Router } from '@angular/router';
import { CompraProducto } from 'src/app/models/contabilidad/compra-producto';
import { Constantes } from 'src/app/comun/constantes';
import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styles: []
})
export class ComprasComponent implements OnInit {

  listCompras: Array<CompraProducto>;
  detCompra: CompraProducto;
  mes: number;
  anio: number;
  meses: any;
  nombreMes: string;
  total: number;

  constructor(private router: Router,  private compraService: CompraService) { 
    
    this.listCompras = new Array<CompraProducto>()
    this.detCompra = new CompraProducto()
    let fecha = new Date()
    this.mes = fecha.getUTCMonth() + 1
    this.anio = fecha.getFullYear()
    this.consultarComprasMes()
    this.meses = Constantes.MESES;
    this.nombreMes = 'Mes'
    this.total = 0

  }

  ngOnInit() {
    $(document).ready(function () {
      $('#dt-compras').DataTable(
        {
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        },

      );
    })
  }

  consultarComprasMes(){
    
    this.compraService.getcomprasByMes(String(this.mes), String(this.anio)).subscribe((response) => {

      response = JSON.parse(response)
      
      if (response.code == '1') { 

        this.listCompras = response.msg
        this.setTotal()

      } else  {
        swal('Error!',     response.msg,      'error'     );
      }

    }, error => Constantes.handleError(error))
  }

  consultarComprasProducto(){

  }

  verDetalles(c: CompraProducto){

    $('#modal-detallecompra').modal('show');
    this.detCompra = c;
  }

  buscarPorMes(){
    
  }

  setMesBuscar(m: number){
    this.mes = m
    this.nombreMes =Constantes.setNombreMes(String(m))

  }

  setTotal(){
    this.total = 0
    this.listCompras.forEach(c => {
      this.total = this.total + c.valor
    })
  }

}
