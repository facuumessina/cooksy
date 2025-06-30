// app/api/model/Usuario.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUsuario extends Document {
  email: string;
  alias: string;
  nombre?: string;
  password?: string;
  recoveryCode?: string;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    email:        { type: String, required: true, unique: true },
    alias:        { type: String, required: true, unique: true },
    nombre:       { type: String },
    password:     { type: String },
    recoveryCode: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);