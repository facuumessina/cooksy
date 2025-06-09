export interface Usuario {
  id: string;
  email: string;
  alias: string;
  nombre: string;
}

export interface Ingrediente {
  nombre: string;
  cantidad: string;
}

export interface Paso {
  paso: number;
  descripcion: string;
  multimedia?: string[];
}

export interface Receta {
  id?: string;
  nombre: string;
  tipo: string;
  ingredientes: Ingrediente[];
  instrucciones: Paso[];
  multimedia?: string[];
  autor?: Usuario;
  estado?: 'pendiente' | 'aprobada';
}

export interface RegisterStep1DTO {
  email: string;
  alias: string;
}

export interface RegisterStep2DTO {
  email: string;
  password: string;
  nombre: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RecoverPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  code: string;
  newPassword: string;
}

export interface RecipeRatingDTO {
  rating: number;
  comment?: string;
}

export interface AdjustByPortionsDTO {
  porciones: number;
}

export interface AdjustByIngredientDTO {
  cantidadIngrediente: {
    nombre: string;
    cantidad: number;
  };
}
