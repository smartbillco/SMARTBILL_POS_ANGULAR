import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CajaService } from 'src/app/services/caja.service';
import { Caja } from 'src/app/models/caja/caja';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cash-register-list',
  templateUrl: './cash-register-list.component.html',
  styleUrls: ['./cash-register-list.component.scss']
})
export class CashRegisterListComponent implements OnInit {

  private companyId: number;
  public cashRegistersList: Caja[];
  public activeCashOpenings: boolean = false;
  

  openCashRegisterInsert: boolean = false;

  @Output() closeCashRegister: EventEmitter<boolean> = new EventEmitter()

  constructor(
    private _cashRegisterService: CajaService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.companyId = Number(localStorage.getItem('idEmpresa'));
    this.getAllCashRegisters();
  }


  getAllCashRegisters(){
    this._cashRegisterService.getCashRegisters(this.companyId).subscribe( (data: any) =>{
      if(data.length > 0){
        this.cashRegistersList = data;
      }else{
        swal('Error', 'No hay cajas registradas', 'error');
      }
    });
  }

  isertDone(directive: boolean){
    if(directive == true){
      this.reloadPage('/home/caja');
    }

  }

  checkOpenings(){
  }

  reloadPage(url: string) {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this._router.navigate([url]));
  }
  



}
