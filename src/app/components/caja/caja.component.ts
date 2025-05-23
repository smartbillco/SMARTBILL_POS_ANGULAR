import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { saveAs } from 'file-saver';

import swal from 'sweetalert2';

import { Constantes } from 'src/app/comun/constantes';
import { Caja } from 'src/app/models/caja/caja';
import { CajaService } from 'src/app/services/caja.service';
import { CuadreCaja } from 'src/app/models/caja/cuadre-caja';
import { ConceptoCaja } from 'src/app/models/caja/concepto-caja';

import { Usuario } from '../../models/usuario';
import { MovimientoCaja } from '../../models/caja/movimiento-caja';
declare var $: any;

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styles: []
})
export class CajaComponent implements OnInit {

  listaMovimientosCaja: Array<MovimientoCaja>;
  listaConceptosCajaTodos: Array<ConceptoCaja>;
  listaConceptosCaja: Array<ConceptoCaja>;
  movimientocaja: MovimientoCaja;
  nuevoConcepto: ConceptoCaja;
  listTipoMovimiento: any;
  tipoUsuario: string;

  nuevoCuadre: CuadreCaja;
  caja: Caja;
  public idCaja: any;
  nombreMov: string;

  dateFrom: string;
  dateTo: string;

  totalActualEnCaja: number = 0;
  diferenciaCaja: number = 0;
  public openingList: any = [];
  public activeCashOpenings: boolean = false;
  public openCashRegister: boolean = false;

  ShowcashRegisterList: boolean = false;
  constructor(private cajaService: CajaService, private router: Router) {
    this.tipoUsuario = localStorage.getItem('tipoUsuario');
    this.movimientocaja = new MovimientoCaja;
    this.movimientocaja.tipo = 1            //movimiento caja salida por defecto
    // this.tipoUsuario = localStorage.getItem('tipoUsuario');
    this.listTipoMovimiento = Constantes.TIPO_MOVIMIENTO;
    this.caja = new Caja()
    this.listaMovimientosCaja = new Array<MovimientoCaja>()
    this.nuevoCuadre = new CuadreCaja()
    this.nuevoConcepto = new ConceptoCaja()
    this.listaConceptosCaja = new Array<ConceptoCaja>();
    this.listaConceptosCajaTodos = new Array<ConceptoCaja>();
    this.nombreMov = 'Tipo de movimiento';
    // cajaService.getCaja().subscribe((respose: any) => {
    
    // },error => Constantes.handleError(error))
    this.idCaja = localStorage.getItem('idCaja');

  }

  ngOnInit() {
    this.setCashRegisterById()
    this.consularMovimientosFecha()
    this.consularConceptos()
   }

  nuevoMovimiento(){
    if(this.movimientocaja.tipo == 1 && (this.movimientocaja.valor > this.caja.efectivo)){
      swal('Error!','No hay suficiente efectivo en caja para realizar el movimiento','error');
      return;
    }


    this.movimientocaja.idCaja = this.caja.id
    this.movimientocaja.idEmpleado = Number(localStorage.getItem('idEmpleado'))
    this.cajaService.nuevoMovimiento(this.movimientocaja).subscribe((respose: any) => {
      respose = respose
      if (respose.code == '1') { // debe mostrar un success sweet alert
        $('#modal-agregarMovimiento').modal('hide');
        swal('Listo!',   respose.message,    'success'  );
        Constantes.reloadPage('/home/caja', this.router)
      } else  {
        swal('Error!',     respose.msg,    'error'   );
      }
    },error => Constantes.handleError(error))
  }

  consularMovimientosFecha(){
    let fecha = new Date()
    fecha.setMonth(fecha.getMonth() + 1)
    this.cajaService.getMovimientosByFecha(this.idCaja, Constantes.formatDate(fecha)).subscribe((respose: any) => {
      respose = respose
      if (respose.code == '1') { 
        this.listaMovimientosCaja = respose.msg
      } else  {
        swal('Error!',respose.message,'error');
      }
    },error => Constantes.handleError(error))
  }

  consularConceptos(){

    this.cajaService.getConceptosCaja().subscribe((respose: any) => {

      respose = respose
      if (respose.code == '1') { 
        this.listaConceptosCajaTodos = respose.msg
        this.listaConceptosCaja = this.listaConceptosCajaTodos.filter(c => c.tipo == 1)

      } else  {
        swal('Error!', respose.message,  'error');
      }

    },error => Constantes.handleError(error))
  }

  registrarConcepto(){
    this.nuevoConcepto.idEmpresa = Number(Constantes.getIdEmpresa())
    this.cajaService.nuevoConcepto(this.nuevoConcepto).subscribe((respose: any) => {
      // respose = JSON.parse(respose.toString())
      respose = respose
      if (respose.code === '1') { // debe mostrar un success sweet alert
        $('#modal-agregarConcepto').modal('hide');
        swal('Listo!',   respose.message,    'success'  );
        Constantes.reloadPage('/home/caja', this.router)
      } else  {
        swal('Error!',     respose.message,    'error'   );
      }

    },error => Constantes.handleError(error))
  }

  cuadrarCaja(){
    let count: number = 0
    count =  this.nuevoCuadre.cantMoneda50 * 50;
    count += this.nuevoCuadre.cantMoneda100 * 100;
    count += this.nuevoCuadre.cantMoneda200 * 200;
    count += this.nuevoCuadre.cantMoneda500 * 500;
    count += this.nuevoCuadre.cantBill1000 * 1000;
    count += this.nuevoCuadre.cantBill2000 * 2000;
    count += this.nuevoCuadre.cantBill5000 * 5000;
    count += this.nuevoCuadre.cantBill10000 *10000;
    count += this.nuevoCuadre.cantBill20000 * 20000;
    count += this.nuevoCuadre.cantBill50000 * 50000;
    count += this.nuevoCuadre.cantBill100000 * 100000;
    this.totalActualEnCaja = count;
    if(this.totalActualEnCaja < this.caja.efectivo){
      this.diferenciaCaja = this.caja.efectivo - this.totalActualEnCaja;
      swal('Advertencia, La cantiad de efectivo en caja no corresponde a la registrada en sistema', 
           `Hay una diferencia negativa e ${this.diferenciaCaja}`,
           'error')
           return
    }else if(this.totalActualEnCaja > this.caja.efectivo){
      this.diferenciaCaja = this.totalActualEnCaja -this.caja.efectivo;
      swal('Advertencia La cantidad de efectivo en caja no corresponde a la registrada en sistema',
            `Hay una diferencia positiva de ${this.diferenciaCaja}`,
            'error')
            return 
    }else{
      swal('Cuadre efectivo', 'La cantidad de efectivo en caja y al de sistema son iguales', 'success')
            return
    }
    
    
  }

  setConceptoCaja(){
    if(this.movimientocaja.tipo == 1){
      this.listaConceptosCaja = this.listaConceptosCajaTodos.filter(c => c.tipo == 1)
    }else{
      this.listaConceptosCaja = this.listaConceptosCajaTodos.filter(c => c.tipo == 0)
    }
  }

  consultarReporte(){  

    if(this.listaMovimientosCaja.length <= 0){
      swal('Advertencia!', 'No hay movimientos para exportar.',    'warning'  );
      return;
    }

    this.cajaService.getReporte(this.listaMovimientosCaja).subscribe(
      data => saveAs(data, 'Movimientos.xlsx'),
      error => {Constantes.handleError(error)
        console.log(error)
      })
  }
  closeCashRegister(instruction: boolean){
    if(instruction){
      this.reloadPage('/home/caja');
    }
  }


  openCahsRegisterDone(event: boolean){
    if(event == true){
      this.reloadPage('/home/caja');
    }
  }

  closeCahsRegisterDone(event: boolean){
    // this.getMainCashRegister();
    this.reloadPage('home/caja');
  };



  setCashRegisterById(){    
    if(this.idCaja == undefined || null){
      this.getMainCashRegister();
    }else{
      this.cajaService.getCashRegisterById(this.idCaja).subscribe( (res: Caja) =>{
        this.caja = res;
        localStorage.setItem('idCaja', JSON.stringify(this.caja.id))
      })
    }

  }

  getMainCashRegister(){
      this.cajaService.getCaja().subscribe( (data: any) =>{    
        this.caja = data;
        localStorage.setItem('idCaja', data.msg.id.toString());
      })

  }

  reloadPage(url: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
  }



  
}
