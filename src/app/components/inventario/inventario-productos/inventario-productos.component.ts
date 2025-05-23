import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Producto } from 'src/app/models/producto';
import { Constantes } from 'src/app/comun/constantes';
import { CategoriaProducto } from 'src/app/models/categoriaProducto';
import { ProductosService } from 'src/app/services/productos.service';
import { CategoriasService } from 'src/app/services/categorias.service';

import { MovimientoInventario } from '../../../models/movimiento-inventario';
import { InventarioService } from 'src/app/services/inventario.service';
import { saveAs } from 'file-saver';
import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-inventario-productos',
  templateUrl: './inventario-productos.component.html',
  styles: []
})
export class InventarioProductosComponent implements OnInit {

  listaProductos: Array<Producto>;
  listaProductosTodos: Array<Producto>;
  listaCategoria: Array<CategoriaProducto>;
  categoria: CategoriaProducto;
  tipoUsuario: string;
  movimientoinventario: MovimientoInventario;
  listTipoMovimiento: any;
  listConceptos: any;

  constructor(private router: Router, private comCategoriaServices: CategoriasService,
    private comProductoServices: ProductosService, private inventarioService: InventarioService) {

      this.movimientoinventario = new MovimientoInventario;
      this.listaProductos = new Array<Producto>();
      this.listaCategoria = new Array<CategoriaProducto>();
      const respCat = comCategoriaServices.getListaCategoria();
    respCat.subscribe((response) => {
      this.listaCategoria = JSON.parse(response.toString()).msg;
    });
    this.consultarProductos();
    this.tipoUsuario = localStorage.getItem('tipoUsuario');
    this.listTipoMovimiento = Constantes.TIPO_MOVIMIENTO;
    this.listConceptos = Constantes.CONCEPTO_ENTRADA;

    }

  ngOnInit() {
  }

  consultarProductos() {
    const resp = this.comProductoServices.getListarProductos();
    resp.subscribe((response) => {
      response = JSON.parse(response.toString());
      if (response.code === '1') {
        $(document).ready(function () {
          $('#dt-productos').DataTable({
            'language': {
              'url': '//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json'
            }
          });
        });
      this.listaProductos = response.msg;
      this.listaProductos = this.listaProductos.filter(p => p.tipoNegocio === 0);
      this.listaProductosTodos = this.listaProductos;
      }
    }, error => Constantes.handleError(error));

  }

  nuevoMovimiento() {

    this.movimientoinventario.idEmpleado = Number(localStorage.getItem('idEmpleado'));
    this.inventarioService.nuevoMovimientoProd(this.movimientoinventario).subscribe((response) => {
      response = JSON.parse(response.toString());

      if (response.code === '1') {
        swal('Listo!', response.msg, 'success');
        $('#modal-agregarMovimiento').modal('hide');

        Constantes.reloadPage('/home/inventario-productos', this.router);

      } else {
        swal('Error', response.msg, 'error');

      }
    }, error => Constantes.handleError(error));
  }

  /*consultarReporte(){
    this.inventarioService.getReporteInventario().subscribe(
      data => saveAs(data, 'inventario.xlsx'),
      error => Constantes.handleError(error))
  }*/

  filtrarPorCategoria(cate: CategoriaProducto) {
    this.listaProductos = this.listaProductosTodos;
    this.listaProductos = this.listaProductos.filter(pro => pro.idCategoria === cate.idCategoriaProducto);
  }

  getColorStock(inventario: number) {
    return Constantes.getColorInventario(inventario);
  }

  setConceptos() {

    if (this.movimientoinventario.tipo === 0) {

      this.listConceptos = Constantes.CONCEPTO_ENTRADA;
    } else {
      this.listConceptos = Constantes.CONCEPTO_SALIDA;

    }

  }

  setProductoMovimiento(prod: Producto) {
    this.movimientoinventario.idProducto = prod.idProducto;
  }

}
