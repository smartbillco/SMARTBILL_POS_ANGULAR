import { Component, OnInit } from "@angular/core";
import { Cliente } from "../../models/cliente";
import { ClientesService } from "src/app/services/clientes.service";
import { HttpErrorResponse } from "@angular/common/http";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { Usuario } from "src/app/models/usuario";
import { Constantes } from "src/app/comun/constantes";
import * as moment from "moment";
import * as XLSX from "xlsx";
import * as jsPDF from "jspdf";
declare var $: any;

@Component({
  selector: "app-clientes",
  templateUrl: "./clientes.component.html",
})
export class ClientesComponent implements OnInit {
  cliente: Cliente;
  listaClientes: Array<Cliente>;
  clienteActualizar: Cliente;
  fileClientes: File;
  dataTable: any;
  usuario: Usuario;
  tipoUsuario: any;
  listTipos: any;
  constructor(
    private comClientServices: ClientesService,
    private userService: AuthService,
    private router: Router
  ) {
    this.cliente = new Cliente();
    this.clienteActualizar = new Cliente();
    userService.defaultUser.subscribe((user) => (this.usuario = user));
    this.tipoUsuario = localStorage.getItem("tipoUsuario");
    this.listTipos = Constantes.TIPOS_DOCUMENTO;
    this.consultarClientes();
  }

  ngOnInit() {
    this.cliente.tipoIdentificacion = "CC";
  }

  crearCliente() {
    this.comClientServices.nuevoCliente(this.cliente).subscribe(
      (data: any) => {
        const respuesta = data;

        if (respuesta) {
          this.mostrarSweetAlertSuccess("Cliente registrado exitosamente.");
          this.reloadPage("/home/clientes");
        } else {
          this.showDuplicateErrorMessage();
        }
      },
      (error) => this.handleError(error)
    );

    $("#modal-cliente").modal("hide");
  }

  actualizarCliente() {
    $("#modal-editarcliente").modal("hide");

    this.comClientServices.actualizarCliente(this.clienteActualizar).subscribe(
      (response: any) => {
        let respuesta = response;

        if (respuesta) {
          this.reloadPage("/home/clientes");
          Swal("Listo!", "El Cliente ha sido actualizado.", "success");
        } else {
          this.showDuplicateErrorMessage();
        }
      },
      (error) => this.handleError(error)
    );
  }

  setClienteActualizar(client: Cliente) {
    this.clienteActualizar = client;
  }

  eliminarCliente(client: Cliente) {
    Swal({
      title: "¿Deseas eliminar este Cliente (" + client.nombre + ")?",
      // text: 'Esto no se puede revertir',
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
    }).then((result) => {
      if (result.value) {
        this.comClientServices.eliminarCliente(client).subscribe(
          (response: any) => {
            // let respuesta = JSON.parse(response.toString());
            let respuesta = response;

            console.log(respuesta);
            if ((respuesta.code = "1")) {
              this.reloadPage("/home/clientes");
              Swal("Listo!", "El Cliente ha sido eliminado.", "success");
            }
          },
          (error) => this.handleError(error)
        );
      }
    });
  }

  consultarClientes() {
    this.comClientServices.getListaClientes().subscribe(
      (response: any) => {
        this.listaClientes = response;
      },
      (error) => this.handleError(error)
    );
  }

  onFileAdded(files: FileList) {
    this.fileClientes = files[0];
  }

  subirArchivo() {
    if (this.fileClientes != null) {
      const resp = this.comClientServices
        .subirArchivo(this.fileClientes)
        .subscribe(
          (response: any) => {
            console.log("respuesta subir ");
            // let respuesta = JSON.parse(response.toString());
            let respuesta = response;

            if (respuesta.code == "1") {
              this.consultarClientes();
              this.mostrarSweetAlertSuccess(
                "Clientes registrados de manera exitosa."
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

  private handleError(error: HttpErrorResponse) {}

  private showDuplicateErrorMessage() {
    Swal("Error!", "Esta cliente ya se encuentra registrado.", "error");
  }

  private mostrarSweetAlertSuccess(body: string) {
    this.cliente = new Cliente();
    Swal("Listo!", body, "success");
  }

  cerrarModalEditar() {
    this.clienteActualizar = new Cliente();
  }

  reloadPage(url: string) {
    this.router
      .navigateByUrl("/", { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  consultarReporte() {}

  public exportClientsListToExcel(event): void {
    const payload: any[] = [];
    payload.push([
      "Código",
      "Nombre",
      "Celular",
      "Dirección",
      "Tipo de identificación",
      "Identificación",
      "Fecha de nacimiento",
    ]);

    for (const cliente of this.listaClientes) {
      const newElement = [
        cliente.id,
        cliente.nombre,
        cliente.celular,
        cliente.direccion,
        cliente.tipoIdentificacion,
        cliente.identificacion,
        cliente.fechaNacimiento,
      ];
      payload.push(newElement);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(payload);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja 1");
    XLSX.writeFile(
      wb,
      `Lista cliente  ${moment(new Date()).format("DD-MM-YYYY HH:MM ")}.xlsx`
    );
  }

  exportClientsListToPdf(event) {
    const doc = new jsPDF();
    const col = [
      "CÓDIGO",
      "NOMBRE",
      "CELULAR",
      "DIRECCIÓN",
      "TIPO DE IDENTIFICACIÓN",
      "IDENTIFICACIÓN",
      "FECHA DE NACIMIENTO",
    ];
    const rows = [];
    /* The following array of object as response from the API req  */
    const itemNew = this.listaClientes;
    itemNew.forEach((element) => {
      const temp = [
        element.id,
        element.nombre,
        element.celular,
        element.direccion,
        element.tipoIdentificacion,
        element.identificacion,
        element.fechaNacimiento,
      ];
      rows.push(temp);
    });

    doc.autoTable(col, rows);
    doc.save(
      `Lista clientes${moment(new Date()).format("DD-MM-YYYY HH:MM")}.pdf`
    );
  }
}
