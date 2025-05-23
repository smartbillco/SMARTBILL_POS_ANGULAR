import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Producto } from '../../models/producto';
import { CategoriaProducto } from '../../models/categoriaProducto';
import { UnidadesMedida } from '../../models/unidadesMedida';
import { Insumo } from '../../models/insumo';
import { ProductosService } from 'src/app/services/productos.service';
import { InsumosService } from 'src/app/services/insumos.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Constantes } from 'src/app/comun/constantes';
declare var $: any;

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent implements OnInit {

  public form: FormGroup;

  producto: Producto;
  listaCategoria: CategoriaProducto[];
  listaUnidadesMedida: UnidadesMedida;
  listaInsumos: Insumo;
  idEmpresa: number;
  public recipeToEdit: Producto;



  listaRecetas: Producto[];
  filteredRecipes: Producto[];
  selectedRecipe: Producto;

  showCrearReceta: boolean = false;

  constructor(
    public _formBuilder: FormBuilder,
    private _comProductoServices: ProductosService,
    private _comInsumoServices: InsumosService,
    private _comCategoriaServices: CategoriasService,
    private _comUtilidadesServices: UtilidadesService,
    private _router: Router
  ) {
    this.selectedRecipe = new Producto();
   }

  ngOnInit() {
    this.idEmpresa = parseInt(localStorage.getItem('idEmpresa'));  

    this.form = this._formBuilder.group({
      codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      nombre: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(45)]],
      idCategoria: [null, [Validators.required]],
      precio: [null, [Validators.required, Validators.minLength(2)]],
      precioMinimo: ['', [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]],
      impoConsumo: [0, Validators.required],
      idUnidadMedida: [1, Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      foto:[null],
      tipoNegocio: [1],
      idEmpresa: [this.idEmpresa],
      costo:[0],
      idProveedor:[1],
      impoconsumoTasa: [0],
      inventario: [0],
      ivaTasa: [0],
      maxStock: [0],
      minStock: [0],
      proveedor:['Ninguno']
    });

    this.getRecipes('1');
    this.getCategories();
    this.getMeasuredUnits();  
  }

  getRecipes(value: string){
    this._comProductoServices.getListarRecetas(value).subscribe((response) => {
      $(document).ready(function () {
        $('#dt-producto').DataTable({
          'language': {
            'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
          }
        });
      }),
      this.listaRecetas = response;
      this.filteredRecipes = this.listaRecetas;
    });
  }

  getCategories(){
    this._comCategoriaServices.getListaCategoria().subscribe((response: any) => {
      this.listaCategoria = response.msg;
    });
  }

  verDetalleReceta(receta: Producto){
    this.selectedRecipe = receta;
    $("#modal-detallereceta").modal('show');
  }

  getMeasuredUnits(){
    this._comUtilidadesServices.getUnidadesMedida().subscribe((data: any) => {
      this.listaUnidadesMedida = data.msg;
    })
  }

  
  crearReceta(){
    console.log(this.form);
    
    // if(this.validatePrices(this.form.value)){
    //   this._comProductoServices.nuevoProducto(this.form.value).subscribe((data: any) =>{
    //     if(data.code === '1'){
    //       swal('Operacion exitosa', 'Plato cread correctamente', 'success');
    //       $("#modal-producto").modal('show');
    //     }else{
    //       swal('Error', 'Error al agregar plato', 'error')
    //     }
    //   })
    // };   
  }



  validatePrices(plato: Producto){
    return plato.precio > plato.costo || plato.precio > plato.precioMinimo ;
  }

  filterByCategory(cateogryId: number){
    if(cateogryId == 0){
      this.filteredRecipes = this.listaRecetas;
      return
    }
    this.filteredRecipes = this.listaRecetas.filter( recipe => recipe.idCategoria == cateogryId );
  }

  editRecipe(){
    this.selectedRecipe.categoria = null;
    this.selectedRecipe.proveedor = null;
    
    if(this.validatePrices(this.selectedRecipe)){
      this._comProductoServices.actualizarProducto(this.selectedRecipe).subscribe( (response: any) =>{
        if( response.code == "1" ){
          swal('Operación exitosa', response.msg, 'success');
          $("#modal-editRecipe").modal('hide');
          this.reloadPage('/home/platos')
        }
      })
    }
  }

  deleteRecipe(recipe: Producto) {
    swal({
      title: '¿Deseas eliminar este Plato?',
      text: 'No podrá deshacer esta acción',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '',
      confirmButtonText: 'Si'
    }).then((result) => {
      if (result.value) {

        this._comProductoServices.eliminarProducto(recipe).subscribe((response: any) => {
          // let respuesta = JSON.parse(response.toString());
          let respuesta = response

          if (respuesta.code == '1') {
            swal('Operacion exitosa!', 'El plato ha sido eliminado.', 'success');
            this.reloadPage('home/platos')
          } else if (respuesta.code == '3') {
            swal('Error', 'Este producto no puede ser eliminado.', 'error');
          };
        }, error => Constantes.handleError(error));
      }
    });
  }

  reloadPage(url: string) {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this._router.navigate([url]));
  }


}
