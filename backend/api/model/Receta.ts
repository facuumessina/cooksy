import mongoose, { Document, Schema } from 'mongoose';

interface Ingrediente {
  nombre: string;
  cantidad: string;
}

interface Paso {
  paso: number;
  descripcion: string;
  multimedia: string[];
}

export interface IReceta extends Document {
  nombre: string;
  tipo: string;
  ingredientes: Ingrediente[];
  instrucciones: Paso[];
  imagen: string;
  porciones: number;
  autor: mongoose.Types.ObjectId;
  estado: 'pendiente' | 'aprobada';
  ratings: {
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
  }[];
  comments: {
    userId: mongoose.Types.ObjectId;
    alias: string;
    comment: string;
  }[];
}

const IngredienteSchema = new Schema<Ingrediente>({
  nombre: { type: String, required: true },
  cantidad: { type: String, required: true },
});

const PasoSchema = new Schema<Paso>({
  paso: { type: Number, required: true },
  descripcion: { type: String, required: true },
  multimedia: { type: [String], default: [] },
});

const RecetaSchema = new Schema<IReceta>(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true },
    ingredientes: { type: [IngredienteSchema], required: true },
    instrucciones: { type: [PasoSchema], required: true },
    imagen: { type: String, required: true },
    porciones: { type: Number, required: true },
    autor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    estado: { type: String, enum: ['pendiente', 'aprobada'], default: 'pendiente' },
    ratings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
        rating: { type: Number, required: true },
        comment: String,
      },
    ],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
        alias: { type: String, required: true },
        comment: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IReceta>('Receta', RecetaSchema);