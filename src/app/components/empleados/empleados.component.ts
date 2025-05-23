import { Component, OnInit } from '@angular/core';

import { Empleados } from 'src/app/models/empleados';
import { Constantes } from 'src/app/comun/constantes';
import { EmpleadoService } from 'src/app/services/empleado.service';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
declare var $: any;

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styles: []
})
export class EmpleadosComponent implements OnInit {

  listEmpleados: Array<Empleados>;
  empleadoNuevo: Empleados;
  empleadoActualizar: Empleados;
  listTipos: any;
  listRegimen: any;
  listtipoNeg: any;
  tipoUsuario: any;

  constructor(private empleadoService: EmpleadoService, private router: Router) {

    this.listEmpleados = new Array<Empleados>();
    this.empleadoNuevo = new Empleados();
    this.empleadoActualizar = new Empleados();
    this.listTipos = Constantes.TIPOS_DOCUMENTO;
    this.listRegimen = Constantes.TIPOS_REGIMEN;
    this.listtipoNeg = Constantes.TIPOS_NEGOCIO;
    this.tipoUsuario = localStorage.getItem('tipoUsuario');
    this.consultarEmpleados();

  }

  ngOnInit() {
  }


  consultarEmpleados() {
    this.empleadoService.getListaEmpleados().subscribe((response: Empleados[]) => {
      this.listEmpleados = response;
    }, error => Constantes.handleError(error));
  }

  nuevoEmpleado() {
    this.empleadoNuevo.idEmpresa = Number(Constantes.getIdEmpresa());
    this.empleadoService.nuevoEmpleado(this.empleadoNuevo).subscribe((response: any) => {

      if (response.code === '1') {
        $('#modal-empleado').modal('hide');
        Constantes.reloadPage('/home/empleados', this.router);

      } else {
        swal('Error!', response.msg, 'error');
      }

    }, error => Constantes.handleError(error));
  }

  actualizarEmpleado() {
    this.empleadoService.actualizarEmpleado(this.empleadoActualizar).subscribe((response: any) => {
      if (response.code === '1') {
        this.cerrarModalEditar();
        swal('Listo!', response.msg, 'success');
        Constantes.reloadPage('/home/empleados', this.router);
      } else {
        swal('Error!', response.msg, 'error');
      }

    }, error => Constantes.handleError(error));
  }

  setempleadoActualizar(emp: Empleados) {
    this.empleadoActualizar = emp;
  }

  consultarReporte() {
    this.empleadoService.getReporte().subscribe(
      data => saveAs(data, 'Empleados.xlsx'),
      error => Constantes.handleError(error));
  }

  cerrarModalEditar() {
    $('#modal-editarempleado').modal('hide');

  }

  eliminarempleado(empleado: Empleados) {

  }

}
