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
import "jspdf-autotable"; // necesario para autoTable
declare var $: any;

@Component({
  selector: "app-categorias",
  templateUrl: "./categorias.component.html",
})

export class CategoriasComponent implements OnInit {
  categoria: CategoriaProducto = new CategoriaProducto();
  listaCategorias: Array<CategoriaProducto> = [];
  categoriaActualizar: CategoriaProducto = new CategoriaProducto();
  categoriaEliminar: CategoriaProducto;
  fileCategorias: File;
  usuario: Usuario;
  tipoUsuario: any;

  constructor(
    private comCategoryService: CategoriasService,
    private userService: AuthService,
    private router: Router
  ) {
    this.tipoUsuario = localStorage.getItem("tipoUsuario");
    this.userService.defaultUser.subscribe((user) => (this.usuario = user));
  }

  ngOnInit() {
    this.recargarTabla();
    this.initFileInput();
  }

  initFileInput() {
    $("#fileCategorias").fileinput({
      showCaption: true,
      browseClass: "btn btn-primary btn-lg",
      fileType: "any",
    });
  }

  recargarTabla(): void {
    console.log("[recargarTabla] Iniciando llamada a getListaCategoria...");
    this.comCategoryService.getListaCategoria().subscribe((response: any) => {
      this.listaCategorias = response;
      console.log("[recargarTabla] Categorías recibidas:", this.listaCategorias);

      setTimeout(() => {
        if ($.fn.DataTable.isDataTable('#dt-categoria')) {
          console.log("[recargarTabla] DataTable ya existe. Destruyendo...");
          $('#dt-categoria').DataTable().destroy();
        } else {
          console.log("[recargarTabla] DataTable no existía.");
        }

        $('#dt-categoria').DataTable({
          language: VarGloblas.dtOptions.language,
          retrieve: true,
        });
        console.log("[recargarTabla] DataTable inicializado");
      }, 0);
    });
  }

  nuevaCategoria() {
    console.log("[nuevaCategoria] Enviando nueva categoría:", this.categoria);
    this.comCategoryService.nuevaCategoria(this.categoria).subscribe(
      (response: any) => {
        this.recargarTabla();
        $("#modal-categoria").modal("hide");
        window.location.reload();
        const respuesta = response;
        console.log("[nuevaCategoria] Respuesta del servidor:", respuesta);

        if (respuesta.code === "1") {
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
    console.log("[actualizarCategoria] Actualizando categoría:", this.categoriaActualizar);

    this.comCategoryService.actualizarCategoria(this.categoriaActualizar).subscribe(
      (response: any) => {
        this.recargarTabla();
        $("#modal-editarcategoria").modal("hide");
        window.location.reload();
        const respuesta = response;
        console.log("[actualizarCategoria] Respuesta del servidor:", respuesta);

        if (respuesta.code === "1") {
          this.mostrarSweetAlertSuccess("Categoría actualizada correctamente");
        } else if (respuesta.code === "2") {
          this.showDuplicateErrorMessage();
          this.recargarTabla();
        }
      },
      (error) => this.handleError(error)
    );
  }

  eliminarCategoria(cat: CategoriaProducto) {
    Swal({
      title: `¿Deseas eliminar esta categoría (${cat.nombre})?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
    }).then((result) => {
      if (result.value) {
        this.comCategoryService.eliminarCategoria(cat).subscribe(
          (response: any) => {
            const respuesta = response;
            if (respuesta.code === "1") {
              this.mostrarSweetAlertSuccess("La categoría ha sido eliminada.");
              window.location.reload();
              this.recargarTabla();
            } else if (respuesta.code === "3") {
              Swal("Error", "Esta categoría no puede ser eliminada.", "error");
            }
          },
          (error) => this.handleError(error)
        );
      }
    });
  }

  subirArchivo() {
    if (this.fileCategorias) {
      this.comCategoryService.subirArchivo(this.fileCategorias).subscribe(
        (response: any) => {
          const respuesta = response;
          if (respuesta.code === "1") {
            this.recargarTabla();
            this.mostrarSweetAlertSuccess("Categorías registradas de manera exitosa.");
          } else if (respuesta.code === "2") {
            this.showDuplicateErrorMessage();
          }
        },
        (error) => this.handleError(error)
      );
    } else {
      console.log("Error: debes subir un archivo.");
    }
  }

  cerrarModalEditar() {
    this.categoriaActualizar = new CategoriaProducto();
    $("#modal-editarcategoria").modal("hide");
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
    Swal("Error!", "Esta categoría ya se encuentra registrada.", "error");
  }

  private mostrarSweetAlertSuccess(body: string) {
    Swal("¡Listo!", body, "success");
  }

  public exportCategoriesListToExcel(event): void {
    const payload: any[] = [["Código", "Nombre"]];
    for (const categoria of this.listaCategorias) {
      payload.push([categoria.idCategoriaProducto, categoria.nombre]);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(payload);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja 1");

    XLSX.writeFile(
      wb,
      `Lista categorías ${moment(new Date()).format("DD-MM-YYYY HH:mm")}.xlsx`
    );
  }

  exportCategoriesListToPdf(event) {
    const doc = new jsPDF();
    const col = ["CÓDIGO", "NOMBRE"];
    const rows = this.listaCategorias.map((cat) => [
      cat.idCategoriaProducto,
      cat.nombre,
    ]);

    doc.autoTable(col, rows);
    doc.save(`Lista categorías ${moment(new Date()).format("DD-MM-YYYY HH:mm")}.pdf`);
  }
}
