import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { Ng2TableModule } from 'ng2-table/ng2-table';

import { PaginationModule } from 'ngx-bootstrap/pagination';

import { appRoutingProviders } from '../app/app.routing';
import { ProveedoresComponent } from '../../src/app/components/proveedores/proveedores.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { Constantes } from './comun/constantes';
import { SearchFilterPipe } from './comun/search-filter.pipe';
import { SidenavDirDirective } from './directivas/sidenav-dir.directive';
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
import { QuickreportComponent } from './components/quickreport/quickreport.component';
import { RangosDianComponent } from './components/rangos-dian/rangos-dian.component';
import { RestauranteComponent } from './components/restaurante/restaurante.component';
import { RolesComponent } from './components/roles/roles.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { VendedoresComponent } from './components/vendedores/vendedores.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ComprasComponent } from './components/contabilidad/compras/compras.component';
import { GastosComponent } from './components/contabilidad/gastos/gastos.component';
import { IngresosComponent } from './components/contabilidad/ingresos/ingresos.component';
import { LiquidacionesComponent } from './components/contabilidad/liquidaciones/liquidaciones.component';
import { FacturasListComponent } from './components/facturas/facturas-list/facturas-list.component';
import { InventarioInsumosComponent } from './components/inventario/inventario-insumos/inventario-insumos.component';
import { InventarioProductosComponent } from './components/inventario/inventario-productos/inventario-productos.component';
import { ListProductosComponent } from './components/restaurante/list-productos/list-productos.component';
import { ResumenVentaComponent } from './components/restaurante/resumen-venta/resumen-venta.component';
import { IpkardexComponent } from './components/inventario/inventario-productos/ipkardex/ipkardex.component';
import { IkardexComponent } from './components/inventario/inventario-insumos/ikardex/ikardex.component';
import { CuentasCobroComponent } from './components/cuentas-cobro/cuentas-cobro.component';
import { NuevaCompraComponent } from './components/productos/nueva-compra/nueva-compra.component';
import { FacturasProveedorComponent } from './components/contabilidad/facturas-proveedor/facturas-proveedor.component';
import { RecetasComponent } from './components/recetas/recetas.component';
import { LoadingComponent } from './components/loading/loading.component';
import { MainComponent } from './components/main/main.component';
import { AsideComponent } from './components/aside/aside.component';
import { CrearRecetaComponent } from './components/recetas/crear-receta/crear-receta.component';
import { RecetasPlatosComponent } from './components/recetas/recetas-platos/recetas-platos.component';
import { CashRegisterListComponent } from './components/caja/cash-register-list/cash-register-list.component';
import { CashRegisterInsertComponent } from './components/caja/cash-register-insert/cash-register-insert.component';
import { OpenCashRegisterComponent } from './components/caja/open-cash-register/open-cash-register.component';
import { CheckOpeningsComponent } from './components/caja/check-openings/check-openings.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { CustomerListComponent } from './components/clientes/customer-list/customer-list.component';
import { AddProductPurchaseComponent } from './components/productos/add-product-purchase/add-product-purchase.component';
import { AddProviderInvoiceComponent } from './components/productos/add-provider-invoice/add-provider-invoice.component';
import { SelectProviderComponent } from './components/shared/select-provider/select-provider.component';
import { SelectCusotmerComponent } from './components/shared/select-cusotmer/select-cusotmer.component';
import { LoaderService } from './services/loader.service';
import { LoaderInterceptor } from './interceptors/loader-interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { ExportFileButtonsComponent } from './comun/components/export-file-buttons/export-file-buttons.component';
import { RegisterComponent } from './components/register/register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProveedoresComponent,
    ProductosComponent,
    InsumosComponent,
    UsuariosComponent,
    RolesComponent,
    PermisosComponent,
    ClientesComponent,
    CategoriasComponent,
    SidebarComponent,
    HomeComponent,
    QuickreportComponent,
    VentasComponent,
    SidenavDirDirective,
    FacturasComponent,
    VendedoresComponent,
    FacturasListComponent,
    PerfilEmpresaComponent,
    SearchFilterPipe,
    ComprasComponent,
    LiquidacionesComponent,
    GastosComponent,
    IngresosComponent,
    RangosDianComponent,
    EmpleadosComponent,
    AdmRestauranteComponent,
    RestauranteComponent,
    ListProductosComponent,
    ResumenVentaComponent,
    CajaComponent,
    InventarioInsumosComponent,
    InventarioProductosComponent,
    IkardexComponent,
    IpkardexComponent,
    CuentasCobroComponent,
    NuevaCompraComponent,
    FacturasProveedorComponent,
    RecetasComponent,
    LoadingComponent,
    MainComponent,
    AsideComponent,
    CrearRecetaComponent,
    RecetasPlatosComponent,
    CashRegisterListComponent,
    CashRegisterInsertComponent,
    OpenCashRegisterComponent,
    CheckOpeningsComponent,
    EarningsComponent,
    CustomerListComponent,
    AddProductPurchaseComponent,
    AddProviderInvoiceComponent,
    SelectProviderComponent,
    SelectCusotmerComponent,
    ExportFileButtonsComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule, 
    ReactiveFormsModule,
    NgxSpinnerModule,
  ],
  providers: [Constantes, appRoutingProviders, LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },],
  bootstrap: [AppComponent],
  entryComponents:
    [
      HomeComponent,
      VentasComponent,
      CategoriasComponent,
      ProductosComponent,
      InsumosComponent,
      ProveedoresComponent,
      ClientesComponent,
      QuickreportComponent
    ]
})



export class AppModule { }
