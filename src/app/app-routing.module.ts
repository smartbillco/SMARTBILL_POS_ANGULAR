import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './comun/auth.guard';
import { AdmRestauranteComponent } from './components/admRestaurante/admRestaurante.component';
import { CajaComponent } from './components/caja/caja.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { HomeComponent } from './components/home/home.component';
import { InsumosComponent } from './components/insumos/insumos.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilEmpresaComponent } from './components/perfil-empresa/perfil-empresa.component';
import { PermisosComponent } from './components/permisos/permisos.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { QuickreportComponent } from './components/quickreport/quickreport.component';
import { RestauranteComponent } from './components/restaurante/restaurante.component';
import { RolesComponent } from './components/roles/roles.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { VendedoresComponent } from './components/vendedores/vendedores.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ComprasComponent } from './components/contabilidad/compras/compras.component';
import { GastosComponent } from './components/contabilidad/gastos/gastos.component';
import { IngresosComponent } from './components/contabilidad/ingresos/ingresos.component';
import { LiquidacionesComponent } from './components/contabilidad/liquidaciones/liquidaciones.component';
import { InventarioInsumosComponent } from './components/inventario/inventario-insumos/inventario-insumos.component';
import { InventarioProductosComponent } from './components/inventario/inventario-productos/inventario-productos.component';
import { IpkardexComponent } from './components/inventario/inventario-productos/ipkardex/ipkardex.component';
import { IkardexComponent } from './components/inventario/inventario-insumos/ikardex/ikardex.component';
import { CuentasCobroComponent } from './components/cuentas-cobro/cuentas-cobro.component';
import { FacturasProveedorComponent } from './components/contabilidad/facturas-proveedor/facturas-proveedor.component';
import { RecetasComponent } from './components/recetas/recetas.component';
import { MainComponent } from './components/main/main.component';
import { RangosDianComponent } from './components/rangos-dian/rangos-dian.component';
import { RecetasPlatosComponent } from './components/recetas/recetas-platos/recetas-platos.component';
import { RegisterComponent } from './components/register/register.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register/:id', component: RegisterComponent },
  {
    path: 'home', component: MainComponent, canActivate: [AuthGuard],
    // {path: 'home', component: MainComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'inicio', component: HomeComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'insumos', component: InsumosComponent },
      { path: 'proveedores', component: ProveedoresComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'quickreport', component: QuickreportComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'facturas', component: FacturasComponent },
      { path: 'vendedores', component: VendedoresComponent },
      { path: 'liquidaciones', component: LiquidacionesComponent },
      { path: 'compras', component: FacturasProveedorComponent },
      { path: 'gastos', component: GastosComponent },
      { path: 'ingresos', component: IngresosComponent },
      { path: 'perfil', component: PerfilEmpresaComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permisos', component: PermisosComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'admRestaurantes', component: AdmRestauranteComponent },
      { path: 'restaurante', component: RestauranteComponent },
      { path: 'inventario-insumos', component: InventarioInsumosComponent },
      { path: 'inventario-productos', component: InventarioProductosComponent },
      { path: 'caja', component: CajaComponent },
      { path: 'productos-kardex', component: IpkardexComponent },
      { path: 'insumos-kardex', component: IkardexComponent },
      { path: 'cuentas-cobrar', component: CuentasCobroComponent },
      { path: 'platos', component: RecetasComponent },
      { path: 'recetas-platos', component: RecetasPlatosComponent },
      { path: 'rangos-dian', component: RangosDianComponent }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
