import { Empresas } from './empresas';
import { Rol } from './seguridad/rol';

export class Usuario {
    id: number;
    email: string;
    password: string;
    tipo: number;
    rol: string;
    estado: number;
    idEmpresa: number;
    listaRoles: Array<Rol>;

    nombreEmpleado:string;
    idEmpleado: number;

    empresa: Empresas;

    setRol(){
        switch(this.tipo){
            case 1:
            this.rol = 'ADMIN';
            break;
            case 2:
            this.rol = 'VENDEDOR';
            break;
        }
    }
}
