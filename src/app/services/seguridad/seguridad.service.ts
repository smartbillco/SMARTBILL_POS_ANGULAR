import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/comun/constantes';
import { Rol } from 'src/app/models/seguridad/rol';
import { Permiso } from 'src/app/models/seguridad/permiso';
import { PermisoRol } from 'src/app/models/seguridad/permiso-rol';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {

  constructor(private http: HttpClient) { }

  getListaRoles(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_ROLES + Constantes.getIdEmpresa());
  }

  getListaRolesActivos(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_ROLES_ACTIVOS + Constantes.getIdEmpresa());
  }

  nuevoRol(rol: Rol): Observable<any> {
    return this.http.post(Constantes.HOST + Constantes.POST_ROL, rol);
  }

  actualizarRol(rol: Rol): Observable<any> {
    return this.http.put(Constantes.HOST + Constantes.PUT_ROL, rol);
  }

  asignarPermisoRol(permisosRol: Array<PermisoRol>): Observable<any>{
    return this.http.post(Constantes.HOST + Constantes.POST_PERMISO_ROL, permisosRol);

  }

  asignarRolUsuario(idRol:number,idUsuario:number): Observable<any>{
    return this.http.post(Constantes.HOST + Constantes.POST_ROL_USUARIO + String(idRol) +'/'  +String(idUsuario), null);

  }

  eliminarRol(id: number): Observable<any> { 
    return this.http.delete(Constantes.HOST + Constantes.DELETE_ROL + String(id)  );    
  }

  getPermisos(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_PERMISOS + Constantes.getIdEmpresa());
  }

  getPermisosActivos(): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_PERMISOS_ACTIVOS + Constantes.getIdEmpresa());
  }

  getPermisosRol(idRol: number): Observable<any> {
    return this.http.get(Constantes.HOST + Constantes.GET_PERMISOS_ROL + String(idRol));
  }
  
  actualizarPermiso(permiso: Permiso): Observable<any> {
    return this.http.put(Constantes.HOST + Constantes.PUT_PERMISO, permiso);
  }
}
