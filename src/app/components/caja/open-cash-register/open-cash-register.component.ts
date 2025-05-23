import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CajaService } from 'src/app/services/caja.service';
import { Caja } from 'src/app/models/caja/caja';
import { MovimientoCaja, AperturaCaja, cierreCaja } from 'src/app/models/caja/movimiento-caja';
import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-open-cash-register',
  templateUrl: './open-cash-register.component.html',
  styleUrls: ['./open-cash-register.component.scss']
})
export class OpenCashRegisterComponent implements OnInit {

  @Output() openDone: EventEmitter<boolean> = new EventEmitter()
  @Output() closeDone: EventEmitter<boolean> = new EventEmitter()

  public cashRegisterList: Caja[] = [];
  public cashRegisterToOpen: AperturaCaja = new AperturaCaja;
  public idEmployeeLoged: number;
  public activeOpenCashRegister: boolean = false;

  constructor(
    private _cashRegisterService: CajaService,
  ) { }

  ngOnInit() {
    this.getAllCashRegister();
    this.idEmployeeLoged = parseInt(localStorage.getItem('idEmpleado'));
  }

  getAllCashRegister() {
    this._cashRegisterService.getAllCashRegister(1).subscribe((data: Caja[]) => {
      this.cashRegisterList = data;
    })
  }

  setCashRegister(cashRegister: Caja) {
    this.activeOpenCashRegister = true;
    this.cashRegisterToOpen.caja = cashRegister.id;
    this.cashRegisterToOpen.empleadoAbre = this.idEmployeeLoged;
  }
  openCashRegister() {
    this._cashRegisterService.openCashRegister(this.cashRegisterToOpen).subscribe((response: any) => {

      if (response.id) {

        swal('Operacion exitosa', 'La caja se ha abierto correctamente', 'success');
        localStorage.setItem('idCaja', response.caja)
        $('#modal-openCashRegister').modal('hide');
        this.openDone.emit(true);
      }
    })
  }

  closeCashRegister(cashRegister: Caja) {
    let cashToClose = new cierreCaja();
    cashToClose.caja = cashRegister.id;
    cashToClose.empleadoCierra = this.idEmployeeLoged;
    cashToClose.efectivoCierre = cashRegister.efectivo;

    this._cashRegisterService.closeCashRegister(cashToClose).subscribe((response: boolean) => {
      if (response == true) {
        // localStorage.removeItem('idCaja');
        this.getMainCashRegister();
      }
    })
  }

  getMainCashRegister(){
    this._cashRegisterService.getCaja().subscribe( (data: any) =>{  
      localStorage.setItem('idCaja', data.msg.id.toString());
      this.doneOperations();
    })
}
  doneOperations(){
    swal('Operación exiotas', 'La caja se ha cerrado correctamente', 'success');
    $('#modal-openCashRegister').modal('hide');
    this.closeDone.emit(true);
  }
  
}
