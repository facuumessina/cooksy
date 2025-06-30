// app/api/model/Usuario.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUsuario extends Document {
  email: string;
  alias: string;
  nombre: string;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    email:  { type: String, required: true, unique: true },
    alias:  { type: String, required: true, unique: true },
    nombre: { type: String, required: true }
  },
  { timestamps: true }
);

// El primer parámetro 'Usuario' debe coincidir con el ref en tu RecetaSchema
const UsuarioModel = mongoose.model<IUsuario>('Usuario', UsuarioSchema);

export default UsuarioModel;