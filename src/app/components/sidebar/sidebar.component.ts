import { Component, OnInit, ViewChild, ComponentFactoryResolver, ComponentFactory, ViewContainerRef, Input } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from '../../services/auth.service';
import { SidenavDirDirective } from 'src/app/directivas/sidenav-dir.directive';
import { Router, NavigationEnd } from '@angular/router';
import { ResetProductosService } from 'src/app/services/reset-productos.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @ViewChild(SidenavDirDirective) adHost: SidenavDirDirective;

  usuario: Usuario;
  datosUsuario: Array<Usuario>;
  viewContainerRef: ViewContainerRef;
  titulo: string;
  activeItem: number;
  ruta: string;
  tipoUsuario: string;

  public idCajaToSet: string = '';

  constructor(private _auth: AuthService, private componentFactoryResolver: ComponentFactoryResolver,
    private userService: AuthService, private router: Router,
    private resetProductos: ResetProductosService) {
    this.usuario = new Usuario();
    router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd){
        this.ruta = router.url;
        this.cambiarTituloContent();
      }
    });
    this.titulo = 'BIENVENIDO A SMARTBILL POS';
   }

  ngOnInit(): void {

    this.userService.defaultUser.subscribe(user => this.usuario = user);

    /*let componentFactory = this.componentFactoryResolver.resolveComponentFactory(HomeComponent);
    this.viewContainerRef = this.adHost.viewContainerRef;
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);*/
    //this.usuario.Nombre = localStorage.getItem('usuario');
    this.usuario.email = localStorage.getItem('correo');
    this.usuario.rol = localStorage.getItem('rol');
  }

  cambiarTituloContent(){

    if(this.ruta == '/home'){
      this.titulo = 'BIENVENIDO A SMARTBILL POS';

    }else if(this.ruta == '/ventas'){
      this.titulo = 'VENTAS';

    }else if(this.ruta == '/categorias'){
      this.titulo = 'CATEGORÍAS';

    }else if(this.ruta == '/productos'){
      this.titulo = 'PRODUCTOS';

    }else if(this.ruta == '/insumos'){
      this.titulo = 'INSUMOS';

    }else if(this.ruta == '/clientes'){
      this.titulo = 'CLIENTES';

    }else if(this.ruta == '/proveedores'){
      this.titulo = 'PROVEEDORES';

    }else if(this.ruta == '/quickreport'){
      this.titulo = 'REPORTES';

    }else if(this.ruta == '/facturas'){
      this.titulo = 'FACTURAS';

    }else if(this.ruta == '/vendedores'){
      this.titulo = 'VENDEDORES';
    }else if(this.ruta == '/roles'){
      this.titulo = 'ROLES';
    }else if(this.ruta == '/permisos'){
      this.titulo = 'PERMISOS';
    }

  }

  cerrarSesion(){
    this.idCajaToSet = localStorage.getItem('idCaja');
    localStorage.clear();
    localStorage.setItem('idCaja', this.idCajaToSet)
    this.router.navigate(['/login']);
  }

  resetProductosLista(){
    this.resetProductos.mostratTodos();
  }

}
