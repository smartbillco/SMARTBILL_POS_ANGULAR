import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cliente } from 'src/app/models/cliente';
import { ClientesService } from 'src/app/services/clientes.service';
import swal from 'sweetalert2';
import { VarGloblas } from '../../../comun/global';
declare const $: any;

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  @Output() customerSelected: EventEmitter<Cliente> = new EventEmitter();

  public customerList: Cliente[] = [];

  constructor(
    private _customerService: ClientesService
  ) {
  }

  ngOnInit() {
    this.consultarClientes();
  }

  public consultarClientes(): void {
    this._customerService.getListaClientes().subscribe((response: any) => {
      $(document).ready(function () {
        $('#dt-producto').DataTable({ language: VarGloblas.dtOptions.language });
      });
      this.customerList = response;
    }, error => swal('Error!', error, 'error'));
  }

  selectCustomer(customer: Cliente) {
    $('#modal-selectCustomer').modal('hide');
    this.customerSelected.emit(customer);
  }

}
