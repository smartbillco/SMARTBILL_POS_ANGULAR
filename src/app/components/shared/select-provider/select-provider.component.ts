import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cliente } from '../../../models/cliente';
import { ProveedoresService } from '../../../services/proveedores.service';
import swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Proveedor } from '../../../models/proveedor';
import { VarGloblas } from '../../../comun/global';
declare var $: any;

@Component({
  selector: 'app-select-provider',
  templateUrl: './select-provider.component.html',
  styleUrls: ['./select-provider.component.scss']
})
export class SelectProviderComponent implements OnInit {

  @Output() providerSelected: EventEmitter<Cliente> = new EventEmitter();

  public providers: Proveedor[] = [];

  constructor(
    private _providerService: ProveedoresService
  ) { }

  ngOnInit() {
    this.consultarProveedores();
  }

  consultarProveedores() {
    this._providerService.getListarProveedores().subscribe((res: any) => {
      this.providers = res;
      $(document).ready(function () {
        $('#dt-proveedor').DataTable({ language: VarGloblas.dtOptions.language });
      });
    }, error => this.handleError(error));
  }

  selectProvider(provider: Cliente) {
    this.providerSelected.emit(provider);
  }


  private handleError(error: HttpErrorResponse) {
    swal('Error', error.message, 'error');
  }


}
