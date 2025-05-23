import { Component, OnInit } from '@angular/core';
import { Insumo } from 'src/app/models/insumo';
import { HttpErrorResponse } from '@angular/common/http';
import { InsumosService } from 'src/app/services/insumos.service';
import Swal, { SweetAlertType } from 'sweetalert2';
import { Proveedor } from 'src/app/models/proveedor';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario';
import { UnidadesMedida } from 'src/app/models/unidadesMedida';
import { Router } from '@angular/router';
import { Constantes } from 'src/app/comun/constantes';
import { CompraService } from 'src/app/services/contabilidad/compra-producto.service';
import { CompraProducto } from 'src/app/models/contabilidad/compra-producto';
import { saveAs } from 'file-saver';
import { NgForm } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html'
})
export class InsumosComponent implements OnInit {

  insumo: Insumo;
  insumoActualizar: Insumo;
  insumoEliminar: Insumo;
  insumoDetalle: Insumo;
  proveedor: Proveedor;
  fileInsumos: File;
  usuario: Usuario;

  listaInsumos: Array<Insumo>;
  listaInsumosTodos: Array<Insumo>;

  listaProveedores: Array<Proveedor>;
  listaUnidadesMedida: Array<UnidadesMedida>;
  isActive: Boolean;
  nombreArchivo: string;
  compra: CompraProducto;
  tipoUsuario: any;

  public imagePath;
  imgURL: any;
  public imgMessage: string;

  inventarioAnterior: number;
  inventarioNuevo: number;

  constructor(
    private router: Router,
    private comInsumoServices: InsumosService,
    private comProveedorServices: ProveedoresService,
    private comUtilidadesServices: UtilidadesService,
    private userService: AuthService,
    private compraService: CompraService) {

    this.insumo = new Insumo();
    this.proveedor = new Proveedor();
    this.insumoActualizar = new Insumo();
    this.insumoDetalle = new Insumo();
    this.tipoUsuario = localStorage.getItem('tipoUsuario');

    const resp = comInsumoServices.getListarInsumos();
    resp.subscribe((response: any) => {
      $(document).ready(function () {
        $('#dt-insumo').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
      }),
        this.listaInsumos = response.msg;
      this.listaInsumosTodos = this.listaInsumos;
    });

    const respInsumos = comInsumoServices.getListarInsumos();
    respInsumos.subscribe((response: any) => {
      // this.listaInsumos = JSON.parse(response.toString()).msg;
      this.listaInsumos = response.msg;

    });

    const respProv = comProveedorServices.getListarProveedores();
    respProv.subscribe((response: any) => {
      // this.listaProveedores = JSON.parse(response.toString()).msg;
      this.listaProveedores = response.msg;

      if (this.listaProveedores.length > 0) {
        this.insumo.idProveedor = this.listaProveedores[0].idProveedor;
      }
    });

    const respUtil = comUtilidadesServices.getUnidadesMedida();
    respUtil.subscribe((response: any) => {
      // this.listaUnidadesMedida = JSON.parse(response.toString()).msg;
      this.listaUnidadesMedida = response.msg;

    });

    userService.defaultUser.subscribe(user => this.usuario = user);

    this.compra = new CompraProducto()
    this.inventarioAnterior = 0
    this.inventarioNuevo = 0
  }

  ngOnInit() {

  }

  crearInsumo(formaInsumo) {
    this.insumo.idEmpresa = Number(localStorage.getItem("idEmpresa"));
    $('#modal-insumo').modal('hide');

    this.comInsumoServices.nuevoInsumo(this.insumo).subscribe((data: any) => {

      // const respuesta = JSON.parse(data.toString())
      const respuesta = data

      if (respuesta.code == '1') { // debe mostrar un success sweet alert
        this.reloadPage('/home/insumos')
        this.mostrarSweetAlertSuccess('Insumo registrado correctamente');
      } else if (respuesta.code == '2') {
        this.showDuplicateErrorMessage()
        this.insumo = new Insumo();
      }

    }, error => this.handleError(error));
  }

  eliminarInsumo(insu: Insumo) {
    Swal({
      title: '¿Deseas eliminar este Insumo?',
      // text: 'Esto no se puede revertir',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this.comInsumoServices.eliminarInsumo(insu).subscribe((response: any) => {
          // let respuesta = JSON.parse(response.toString());
          let respuesta = response;
          if (respuesta.code == '1') {
            Swal('Listo!', 'El insumo ha sido eliminado.', 'success');
            this.reloadPage('/home/insumos')
          } else if (respuesta.code == '3') {
            Swal('Error', 'Este insumo no puede ser eliminado.', 'error');
          };
        }, error => this.handleError(error));
      }
    });
  }

  editarInsumo() {
    this.comInsumoServices.actualizarInsumo(this.insumoActualizar).subscribe((response: any) => {
      // let respuesta = JSON.parse(response.toString());
      let respuesta = response

      if (respuesta.code == '1') {
        Swal('Listo!', 'El insumo ha sido actualizado.', 'success');
        this.reloadPage('/home/insumos')

      } else if (respuesta.code == '2') {
        this.showDuplicateErrorMessage()
      }
    }, error => this.handleError(error));

    $('#modal-editarinsumo').modal('hide');
  }

  setActualizarInsumo(insu: Insumo) {
    this.insumoActualizar.id = insu.id;
    this.insumoActualizar.codigo = insu.codigo;
    this.insumoActualizar.nombre = insu.nombre;
    this.insumoActualizar.descripcion = insu.descripcion;
    this.insumoActualizar.cantidad = insu.cantidad;
    this.insumoActualizar.idProveedor = insu.idProveedor;
    this.insumoActualizar.idUnidadMedida = insu.idUnidadMedida;
  }

  consultarInsumos() {
    const resp = this.comInsumoServices.getListarInsumos();
    resp.subscribe((response: any) => {
      // this.listaInsumos = JSON.parse(response.toString()).msg;
      this.listaInsumos = response.msg;

    }, error => this.handleError(error));
  }

  onFileAdded(files: FileList) {

    this.fileInsumos = files[0];
    this.nombreArchivo = this.fileInsumos.name;
  }

  subirArchivo() {

    if (this.fileInsumos != null) {
      const resp = this.comInsumoServices.subirArchivo(this.fileInsumos).subscribe((response) => {
        console.log(response);
        let respuesta = JSON.parse(response.toString());
        if (respuesta.code == '1') {
          //this.consultarInsumos();
          this.reloadPage('/home/insumos')

          Swal(
            'Listo!',
            'Insumos registrados de manera exitosa.',
            'success'
          );
        } else if (respuesta.code == '2') {
          this.showDuplicateErrorMessage()
        } else if (respuesta.code == '0') {
          Swal(
            'Error!',
            respuesta.msg,
            'error'
          );
        }

      }, error => this.handleError(error));
    } else {
      console.log('error debes subir archivo')
    }

  }

  private handleError(error: HttpErrorResponse) {
    Swal(
      'Error!',
      error.message,
      'error'
    );
  }

  private showDuplicateErrorMessage() {
    Swal(
      'Error!',
      'Este insumo ya se encuentra registrado.',
      'error'
    );
  }

  private mostrarSweetAlertSuccess(body: string) {

    Swal(
      'Listo!',
      body,
      'success'
    );

  }

  private mostrarSweetAlert(titulo: string, body: string, tipo: SweetAlertType) {

    Swal(
      titulo,
      body,
      tipo
    );
  }
  reloadPage(url: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
  }
  cerrarModalEditar() {
    $("#modal-editarinsumo").hide();
    this.insumoActualizar = new Insumo();
  }

  verDetalles(insu: Insumo) {

    this.insumoDetalle = insu;
    $("#modal-detalleinsumo").modal('show');

  }

  getColorStock(inventario: number) {
    return Constantes.getColorInventario(inventario);
  }

  nuevaCompra() {

    /*this.compra.setValor()
    this.compra.setTotalUnidades()
    this.compra.idUsuario = Number(localStorage.getItem('idUsuario'))
    this.compraService.nuevaCompra(this.compra).subscribe((response)=>{

      response = JSON.parse(response.toString())
      console.log(response)
      if (response.code == '1') {

        Swal(   'Listo!',          'Compra registrados de manera exitosa.',          'success'        );
        this.reloadPage('/home/insumos')
      } else {
        Swal(          'Error!',           response.msg,          'error'        );
      }
    }, error => this.handleError(error))
    */
  }

  setInsumoCompra(insu: Insumo) {
    this.compra.idProducto = insu.id;
    this.compra.producto = insu.nombre;
    this.inventarioAnterior = insu.cantidad;
  }

  consultarReporte() {
    this.comInsumoServices.getReporte().subscribe(
      data => saveAs(data, 'Insumos.xlsx'),
      error => Constantes.handleError(error))
  }

}
