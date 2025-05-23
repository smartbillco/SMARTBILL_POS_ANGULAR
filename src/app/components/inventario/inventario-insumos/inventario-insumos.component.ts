import { Component, OnInit } from '@angular/core';
import { Insumo } from 'src/app/models/insumo';
import { Router } from '@angular/router';
import { InsumosService } from 'src/app/services/insumos.service';
import { Constantes } from 'src/app/comun/constantes';
import { MovimientoInventario } from 'src/app/models/movimiento-inventario';
declare var $: any;

@Component({
  selector: 'app-inventario-insumos',
  templateUrl: './inventario-insumos.component.html',
  styles: []
})
export class InventarioInsumosComponent implements OnInit {

  listaInsumos: Array<Insumo>;

  movimientoinventario: MovimientoInventario;
  listTipoMovimiento: any;
  listConceptoEntrada: any;
  listConceptoSalida: any;
 
  tipoUsuario: any;

  constructor( private router: Router,
    private comInsumoServices: InsumosService) { 
      this.movimientoinventario = new MovimientoInventario;
      this.listaInsumos = new Array<Insumo>()
      this.consultarInsumos()
      this.listTipoMovimiento = Constantes.TIPO_MOVIMIENTO;
    this.listConceptoEntrada = Constantes.CONCEPTO_ENTRADA;
    this.tipoUsuario = localStorage.getItem('tipoUsuario');

    }

  ngOnInit() {  
    
  }

  consultarInsumos() {
    const resp = this.comInsumoServices.getListarInsumos();
    resp.subscribe((response) => {
      $(document).ready(function () {
        $('#dt-insumos').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
        })
      this.listaInsumos = JSON.parse(response.toString()).msg;
      
    }, error => Constantes.handleError(error));
  }

  setInsumoMov(ins: Insumo){

  }

  public consultarReporte(): void {

  }

  crearProducto(){
    
  }
}
