import { Ingrediente } from './Ingrediente';
import { Paso } from './Paso';
import { Usuario } from './Usuario';

export interface Receta {
  id: string;
  nombre: string;
  tipo: string;
  ingredientes: Ingrediente[];
  instrucciones: Paso[];
  multimedia: string[];
  autor: Usuario;
  estado: 'pendiente' | 'aprobada';
}