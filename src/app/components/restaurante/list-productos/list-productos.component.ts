import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Producto } from 'src/app/models/producto';
import { CategoriaProducto } from 'src/app/models/categoriaProducto';
import { VentasService } from 'src/app/services/ventas.service';
import { ProductosService } from 'src/app/services/productos.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import swal from 'sweetalert2';
import { Constantes } from 'src/app/comun/constantes';

@Component({
  selector: 'app-list-productos',
  templateUrl: './list-productos.component.html',
  styles: []
})
export class ListProductosComponent implements OnInit {
  listaProductos: Array<Producto>;
  listaProductosTodos: Array<Producto>;
  listaCategorias: Array<CategoriaProducto>;
  celularCliente: string;
  clienteExiste: Boolean;
  nombreProductoBuscar: string;
  codigoProductoBuscar: number;
  cantCaja: number;
  listMotivos:  Array<string>;

  

  search: string;
  data: any = {};
  @Output() addProductEvent = new EventEmitter<Producto>();
  constructor(private prodService: ProductosService, private catService: CategoriasService,
    private ventasService: VentasService) { 

      this.listaProductos = new Array<Producto>()
      this.consultarProductos();
      this.catService.getListaCategoria().subscribe((response) => {

        this.listaCategorias = JSON.parse(response.toString()).msg;
      });
    }

  ngOnInit() {
  }

  filtrarPorCategoria(cate: CategoriaProducto){

    this.listaProductos = this.listaProductosTodos;
    this.listaProductos = this.listaProductos.filter( pro => pro.categoria == cate.nombre );
  }

  consultarProductos(){
    this.prodService.getProductosDisponibles().subscribe((response) => {
      let respuesta = JSON.parse(response.toString());
      if(respuesta.code == '1'){
        this.listaProductos = respuesta.msg;
        this.listaProductosTodos = this.listaProductos;
      }else{
        swal(          'Error',          respuesta.msg,          'error'        );
      }
    }, error => Constantes.handleError(error));
  }

  addProducto(prod: Producto) {
    this.addProductEvent.next(prod)
  }


  getSearchValue() {
    return this.search;
  }
}
