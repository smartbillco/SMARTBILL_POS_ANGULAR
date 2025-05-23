import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Caja } from 'src/app/models/caja/caja';
import { CajaService } from 'src/app/services/caja.service';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
declare var $: any;


@Component({
  selector: 'app-cash-register-insert',
  templateUrl: './cash-register-insert.component.html',
  styleUrls: ['./cash-register-insert.component.scss']
})
export class CashRegisterInsertComponent implements OnInit {

  public cajaToInsert:any;
  private idEmpresa: number;

  @Output() insertDone : EventEmitter<boolean> = new EventEmitter();

  constructor(
    private _cashRegisteService: CajaService,
    private _router: Router
  ) { }

  ngOnInit() {
    
    this.cajaToInsert = new Object;
    this.cajaToInsert.tipo = 1;
    this.idEmpresa = parseInt(localStorage.getItem('idEmpresa'));
  }

  insertCahsRegister(){
    let idEmpresa: any = new Object;
    idEmpresa.id = this.idEmpresa;    
    this.cajaToInsert.efectivo = Number(this.cajaToInsert.efectivo);
    this.cajaToInsert.idEmpresa = idEmpresa;
    this.cajaToInsert.tipo = parseInt(this.cajaToInsert.tipo); 
    this.cajaToInsert.estado = 0;
    
    this._cashRegisteService.inserCahsRegister(this.cajaToInsert).subscribe( (response: boolean) =>{
      if(response == true){
        swal('Operación exitosa', 'La caja se ha creado correctamente', 'success');
        $('#modal-cash-register-insert').modal('hide');
        this.insertDone.emit(true);
      }
    } )
  }



}
