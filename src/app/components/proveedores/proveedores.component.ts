import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";

import Swal from "sweetalert2";

import { Usuario } from "src/app/models/usuario";
import { Proveedor } from "src/app/models/proveedor";
import { Constantes } from "src/app/comun/constantes";
import { AuthService } from "src/app/services/auth.service";
import { ProveedoresService } from "src/app/services/proveedores.service";
import { saveAs } from "file-saver";

declare var $;
// import { DataTableDirective } from 'angular-datatables';
import { VarGloblas } from "../../comun/global";
import * as moment from "moment";
import * as XLSX from "xlsx";
import * as jsPDF from "jspdf";

@Component({
  selector: "app-proveedores",
  templateUrl: "./proveedores.component.html",
})
export class ProveedoresComponent implements OnInit {
  @ViewChild("dataTable") table;
  dataTable: any;
  dtOptions: any;

  proveedor: Proveedor;
  proveedorAeliminar: Proveedor;
  proveedorAactualizar: Proveedor;
  usuario: Usuario;

  listaProveedores: Array<Proveedor>;
  fileProveedores: File;
  tipoUsuario: any;
  listTipos: any;
  listRegimen: any;

  constructor(
    private comProveedorService: ProveedoresService,
    private userService: AuthService,
    private router: Router
  ) {
    this.listTipos = Constantes.TIPOS_DOCUMENTO;
    this.listRegimen = Constantes.TIPOS_REGIMEN;
    userService.defaultUser.subscribe((user) => (this.usuario = user));
    this.tipoUsuario = localStorage.getItem("tipoUsuario");
    this.consultarProveedores();
  }

  res_obtenerProveedores;

  ngOnInit(): void {
    this.proveedor = new Proveedor();
    this.proveedorAactualizar = new Proveedor();
    this.proveedorAeliminar = new Proveedor();
  }

  nuevoProveedor() {
    this.comProveedorService.nuevoProveedor(this.proveedor).subscribe(
      (data: any) => {
        // const respuesta = JSON.parse(data.toString());
        const respuesta = data;
        if (respuesta) {
          // debe mostrar un success sweet alert
          Swal("Listo!", respuesta.msg, "success");
          this.reloadPage("/home/proveedores");
          $("#modal-proveedor").modal("hide");
        } else {
          this.showDuplicateErrorMessage();
        }
      },
      (error) => {
        this.handleError(error), $("#modal-proveedor").modal("hide");
      }
    );
    this.proveedor = new Proveedor();
  }

  editarProveedor() {
    this.comProveedorService
      .actualizarProveedor(this.proveedorAactualizar)
      .subscribe(
        (response: any) => {
          // const respuesta = JSON.parse(response.toString());
          const respuesta = response;

          if (respuesta) {
            //debe mostrar un success sweet alert
            $("#modal-editarproveedor").modal("hide");
            this.mostrarSweetAlertSuccess(
              "Provedor actualizado de manera exitosa."
            );
            this.reloadPage("/home/proveedores");
          } else {
            this.showDuplicateErrorMessage();
            this.proveedorAactualizar = new Proveedor();
          }
        },
        (error) => this.handleError(error)
      );
    $("#modal-editarproveedor").hide();
  }

  setProveedorActulaizar(prov: Proveedor) {
    this.proveedorAactualizar = prov;
  }

  setProveedorAeliminar(prov: Proveedor) {
    this.proveedorAeliminar = prov;
    Swal({
      title: "¿Deseas eliminar este Proveedor (" + prov.nombre + ")?",
      // text: 'Esto no se puede revertir',
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
    }).then((result) => {
      if (result.value) {
        this.comProveedorService
          .eliminarProveedor(this.proveedorAeliminar)
          .subscribe(
            (response: any) => {
              // let respuesta = JSON.parse(response.toString());
              let respuesta = response;
              if (respuesta.code == "1") {
                this.reloadPage("/home/proveedores");
                Swal("Listo!", "El proveedor ha sido eliminado.", "success");
              } else {
                Swal(
                  "Advertencia!",
                  "Este proveedor NO puede ser eliminado.",
                  "warning"
                );
              }
            },
            (error) => this.handleError(error)
          );
      }
    });
  }

  consultarProveedores() {
    this.comProveedorService.getListarProveedores().subscribe(
      (response: any) => {
        this.listaProveedores = response;
        $(document).ready(function () {
          $("#dt-proveedor").DataTable({
            language: VarGloblas.dtOptions.language,
          });
        });
      },
      (error) => this.handleError(error)
    );
  }
  onFileAdded(files: FileList) {
    this.fileProveedores = files[0];
  }

  subirArchivo() {
    if (this.fileProveedores != null) {
      const resp = this.comProveedorService
        .subirArchivo(this.fileProveedores)
        .subscribe(
          (response: any) => {
            // let respuesta = JSON.parse(response.toString());
            let respuesta = response;

            if (respuesta.code == "1") {
              this.consultarProveedores();
              Swal(
                "Listo!",
                "Proveedores registrados de manera exitosa.",
                "success"
              );
            } else if (respuesta.code == "2") {
              this.showDuplicateErrorMessage();
            }
          },
          (error) => this.handleError(error)
        );
    } else {
      console.log("error debes subir archivo");
    }
  }

  private handleError(error: HttpErrorResponse) {
    Swal("Error", error.message, "error");
  }

  private showDuplicateErrorMessage() {
    Swal("Error!", "Este provvedor ya se encuentra registrado.", "error");
  }

  private mostrarSweetAlertSuccess(body: string) {
    Swal("Listo!", body, "success");
  }

  reloadPage(url: string) {
    this.router
      .navigateByUrl("/", { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  consultarReporte() {
    this.comProveedorService.getReporte().subscribe(
      (data) => saveAs(data, "Proveedores.xlsx"),
      (error) => {
        Constantes.handleError(error), console.log(error);
      }
    );
  }

  cerrarModalEditar() {
    $("#modal-editarproveedor").hide();
    this.proveedorAactualizar = new Proveedor();
  }

  public exportProveedoresListToExcel(event): void {
    const payload: any[] = [];
    payload.push([
      "Código",
      "Nombre",
      "Teléfono",
      "Dirección",
      "Contacto",
      "Tipo identificación",
      "Identificación",
      "Régimen",
      "Correo",
    ]);

    for (const proveedor of this.listaProveedores) {
      const newElement = [
        proveedor.idProveedor,
        proveedor.nombre,
        proveedor.telefono,
        proveedor.direccion,
        proveedor.contacto,
        proveedor.tipoIdentificacion,
        proveedor.identificacion,
        proveedor.regimen,
        proveedor.correo,
      ];
      payload.push(newElement);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(payload);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja 1");
    XLSX.writeFile(
      wb,
      `Lista proveedores  ${moment(new Date()).format(
        "DD-MM-YYYY HH:MM "
      )}.xlsx`
    );
  }

  exportProveedoresListToPdf(event) {
    const doc = new jsPDF();
    const col = [
      "CÓDIGO",
      "NOMBRE",
      "TELÉFONO",
      "DIRECCIÓN",
      "CONTACTO",
      "TIPO IDENTIFICACIÓN",
      "IDENTIFICACIÓN",
      "RÉGIMEN",
      "CORREO",
    ];
    const rows = [];
    /* The following array of object as response from the API req  */
    const itemNew = this.listaProveedores;
    itemNew.forEach((proveedor) => {
      const temp = [
        proveedor.idProveedor,
        proveedor.nombre,
        proveedor.telefono,
        proveedor.direccion,
        proveedor.contacto,
        proveedor.tipoIdentificacion,
        proveedor.identificacion,
        proveedor.regimen,
        proveedor.correo,
      ];
      rows.push(temp);
    });

    doc.autoTable(col, rows);
    doc.save(
      `Lista proveedores ${moment(new Date()).format("DD-MM-YYYY HH:MM")}.pdf`
    );
  }
}
