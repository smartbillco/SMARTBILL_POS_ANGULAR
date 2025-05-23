import { Component, OnInit, Input } from '@angular/core';
import { Factura } from 'src/app/models/facturas';
import { VentasService } from 'src/app/services/ventas.service';
import swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Constantes } from 'src/app/comun/constantes';
declare var $: any;

@Component({
  selector: 'app-facturas-list',
  templateUrl: './facturas-list.component.html',
  styles: []
})
export class FacturasListComponent implements OnInit {

  @Input() listFacturas: Array<Factura>;
  factura: Factura;
  
  constructor(private facturaService: VentasService) {
    this.factura = new Factura()   
   }

  ngOnInit() {
  }

  ngOnChanges(): void {
    
  }

  verDetalles(fac: Factura){

    this.factura = fac;  
    this.facturaService.getDetallesFactura(String(fac.idFactura)).subscribe((response: any) => {
      response = response
      console.log(response);
      

      if(response.code == '1'){
        this.factura.listDetallesFactura = response.msg

        if(this.factura.listDetallesFactura.length == 0){
          swal('Advertencia', 'Esta factura no tiene detalles','warning')

        }else{
          $('#modal-detalles').modal();

        }

      }else{
        swal('Error', response.msg,'error')
      }
    },  error => Constantes.handleError(error));
    

  }

  reImprimirFactura(){
    this.facturaService.reImprimirFactura(this.factura, '0').subscribe((response)=>{
    },  error => Constantes.handleError(error))
  }

}
