import { Component, OnInit } from "@angular/core";
import { CategoriaProducto } from "../../models/categoriaProducto";
import { HttpErrorResponse } from "@angular/common/http";
import { CategoriasService } from "../../services/categorias.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { AuthService } from "src/app/services/auth.service";
import { Usuario } from "src/app/models/usuario";
import { VarGloblas } from "../../comun/global";
import * as moment from "moment";
import * as XLSX from "xlsx";
import * as jsPDF from "jspdf";
declare var $: any;

@Component({
  selector: "app-categorias",
  templateUrl: "./categorias.component.html",
})
export class CategoriasComponent implements OnInit {
  categoria: CategoriaProducto;
  listaCategorias: Array<CategoriaProducto>;
  categoriaActualizar: CategoriaProducto;
  categoriaEliminar: CategoriaProducto;
  fileCategorias: File;
  usuario: Usuario;
  dataTable: any;
  tipoUsuario: any;

  constructor(
    private comCategoryService: CategoriasService,
    private userService: AuthService,
    private router: Router
  ) {
    const resp = comCategoryService.getListaCategoria();
    resp.subscribe((response: any) => {
      $(document).ready(function () {
        $("#dt-categoria").DataTable({
          language: VarGloblas.dtOptions.language,
        });
      }),
        (this.listaCategorias = response);
    });
    userService.defaultUser.subscribe((user) => (this.usuario = user));
    this.categoriaActualizar = new CategoriaProducto();
    this.categoriaEliminar = new CategoriaProducto();
    this.categoria = new CategoriaProducto();
    this.tipoUsuario = localStorage.getItem("tipoUsuario");
  }

  ngOnInit() {
    $("#fileCategorias").fileinput({
      showCaption: true,
      browseClass: "btn btn-primary btn-lg",
      fileType: "any",
    });
  }

  nuevaCategoria() {
    this.comCategoryService.nuevaCategoria(this.categoria).subscribe(
      (data: any) => {
        $("#modal-categoria").modal("hide");

        // const respuesta = JSON.parse(data.toString())
        const respuesta = data;
        if (respuesta.code === "1") {
          // debe mostrar un success sweet alert
          this.reloadPage("/home/categorias");
          this.mostrarSweetAlertSuccess("Categoría registrada exitosamente.");
        } else if (respuesta.code === "2") {
          this.showDuplicateErrorMessage();
        }
      },
      (error) => this.handleError(error)
    );
    this.categoria = new CategoriaProducto();
  }

  actualizarCategoria() {
    $("#modal-editarcategoria").modal("hide");

    this.comCategoryService
      .actualizarCategoria(this.categoriaActualizar)
      .subscribe(
        (response: any) => {
          // const respuesta = JSON.parse(response.toString())
          const respuesta = response;

          if (respuesta.code === "1") {
            // debe mostrar un success sweet alert
            this.reloadPage("/home/categorias");
            this.mostrarSweetAlertSuccess(
              "Categoría actualizada correctamente"
            );
          } else if (respuesta.code === "2") {
            this.showDuplicateErrorMessage();
            this.reloadPage("/categorias");
          }
        },
        (error) => this.handleError(error)
      );
  }

  eliminarCategoria(cat: CategoriaProducto) {
    Swal({
      title: "¿Deseas eliminar esta categoría (" + cat.nombre + ")?",
      // text: 'Esto no se puede revertir',
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
    }).then((result) => {
      if (result.value) {
        this.comCategoryService.eliminarCategoria(cat).subscribe(
          (response: any) => {
            // let respuesta = JSON.parse(response.toString());
            const respuesta = response;

            if (respuesta.code === "1") {
              this.reloadPage("/home/categorias");

              this.mostrarSweetAlertSuccess("La categoría ha sido eliminada.");
            } else if (respuesta.code === "3") {
              Swal("Error", "Esta categoría no puede ser eliminada.", "error");
            } else {
              console.log("no se pudo borrar la categoria");
            }
          },
          (error) => this.handleError(error)
        );
      }
    });
  }

  consultarCategorias() {
    const resp = this.comCategoryService.getListaCategoria();
    resp.subscribe(
      (response: any) => {
        // $('#dt-categoria').DataTable().ajax.reload();

        // this.listaCategorias = JSON.parse(response.toString()).msg;
        this.listaCategorias = response.msg;
      },
      (error) => this.handleError(error)
    );
  }

  cerrarModalEditar() {
    this.categoriaActualizar = new CategoriaProducto();
    $("#modal-editarcategoria").hide();
  }

  subirArchivo() {
    if (this.fileCategorias != null) {
      const resp = this.comCategoryService
        .subirArchivo(this.fileCategorias)
        .subscribe(
          (response: any) => {
            // const respuesta = JSON.parse(response.toString());
            const respuesta = response;

            if (respuesta.code === "1") {
              this.consultarCategorias();
              this.mostrarSweetAlertSuccess(
                "Categorías registradas de manera exitosa."
              );
            } else if (respuesta.code === "2") {
              this.showDuplicateErrorMessage();
            }
          },
          (error) => this.handleError(error)
        );
    } else {
      console.log("error debes subir archivo");
    }
  }
  setCategoriaActualizar(cat: CategoriaProducto) {
    this.categoriaActualizar.idCategoriaProducto = cat.idCategoriaProducto;
    this.categoriaActualizar.nombre = cat.nombre;
  }
  onFileAdded(files: FileList) {
    this.fileCategorias = files[0];
  }
  private handleError(error: HttpErrorResponse) {
    Swal("Error!", error.message, "error");
  }

  private showDuplicateErrorMessage() {
    Swal("Error!", "Esta categorías ya se encuentra registrada.", "error");
  }

  private mostrarSweetAlertSuccess(body: string) {
    Swal("Listo!", body, "success");
  }

  reloadPage(url: string) {
    this.router
      .navigateByUrl("/", { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  public exportCategoriesListToExcel(event): void {
    const payload: any[] = [];
    payload.push(["Código", "Nombre"]);

    for (const categoria of this.listaCategorias) {
      const newElement = [categoria.idCategoriaProducto, categoria.nombre];
      payload.push(newElement);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(payload);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja 1");
    XLSX.writeFile(
      wb,
      `Lista categorías  ${moment(new Date()).format("DD-MM-YYYY HH:MM ")}.xlsx`
    );
  }

  exportCategoriesListToPdf(event) {
    const doc = new jsPDF();
    const col = ["CODIGO", "NOMBRE"];
    const rows = [];
    /* The following array of object as response from the API req  */
    const itemNew = this.listaCategorias;
    itemNew.forEach((element) => {
      const temp = [element.idCategoriaProducto, element.nombre];
      rows.push(temp);
    });

    doc.autoTable(col, rows);
    doc.save(
      `Lista categorías${moment(new Date()).format("DD-MM-YYYY HH:MM")}.pdf`
    );
  }
}
