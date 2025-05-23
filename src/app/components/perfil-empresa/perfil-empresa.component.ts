import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import swal from 'sweetalert2';

import { Empresas } from 'src/app/models/empresas';
import { Constantes } from 'src/app/comun/constantes';
import { EmpresaService } from 'src/app/services/empresa.service';

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styles: []
})
export class PerfilEmpresaComponent implements OnInit {

  empresa: Empresas;
  tipoUsuario: string;
  listRegimen: any;
  listtipoNeg: any;

  constructor(private empresaService: EmpresaService) {
    this.empresa = new Empresas();
    this.consultarInfoEmpresa();
    this.tipoUsuario = localStorage.getItem('tipoUsuario');
    this.listRegimen = Constantes.TIPOS_REGIMEN;
    this.listtipoNeg = Constantes.TIPOS_NEGOCIO;
  }

  ngOnInit() {
  }

  consultarInfoEmpresa() {

    this.empresaService.getInfoEmpresa().subscribe((response: any) => {
      if (response.code === '1') {
        console.log(response.msg);
        this.empresa = response.msg;
      }

    }, error => this.handleError(error));
  }

  private handleError(error: HttpErrorResponse) {
    swal(
      'Error',
      error.message,
      'error'
    );
  }

  actualizarEmpresa(company: Empresas){
    // console.log(JSON.stringify(company));
    this.empresaService.actualizarEmpresa( company ).subscribe( (response: boolean) =>{
      if(response == true){
      }
    })
  }
}
