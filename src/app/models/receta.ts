import { Producto } from './producto';
import { Insumo } from './insumo';

export class Receta {

    id: number;
    idProducto: Producto;
    idInsumo: number;
    cantidad: number;

    Insumo: string; //nombre del insumo

}
