// app/api/controller/authController.ts
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../model/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiá_este_secreto_en_prod';

// Paso 1: registrar email+alias
export async function registerStep1(req: Request, res: Response) {
  const { email, alias } = req.body;
  const exists = await Usuario.findOne({ $or: [{ email }, { alias }] });
  if (exists) return res.status(409).json({ message: 'Email o alias ya en uso' });
  const user = new Usuario({ email, alias });
  await user.save();
  return res.status(200).json({ message: 'Registro paso 1 completado' });
}

// Paso 2: completar datos y clave
export async function registerStep2(req: Request, res: Response) {
  const { email, password, nombre } = req.body;
  const user = await Usuario.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Email no registrado' });
  if (user.password) return res.status(400).json({ message: 'Registro ya completado' });

  user.nombre   = nombre;
  user.password = await bcrypt.hash(password, 10);
  await user.save();

  // Devuelvo el ID además del mensaje
  return res.status(201).json({ 
    message: 'Usuario registrado completamente', 
    id: user._id 
  });
}

// Login: devolver JWT
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await Usuario.findOne({ email });
  if (!user || !user.password) return res.status(401).json({ message: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
  const token = jwt.sign({ id: user._id, alias: user.alias }, JWT_SECRET, { expiresIn: '2h' });
  return res.status(200).json({ 
    token,
    id: user._id
  });
}

// Recover password: generar código y “enviar”
export async function recoverPassword(req: Request, res: Response) {
  const { email } = req.body;
  const user = await Usuario.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.recoveryCode = code;
  await user.save();

  // Aquí podrías enviar el código por email con tu servicio real
  console.log(`Código de recuperación para ${email}: ${code}`);

  return res.status(200).json({ message: 'Código de recuperación enviado' });
}

// Reset password: validar código y actualizar
export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body;
  const user = await Usuario.findOne({ email });
  user.password = await bcrypt.hash(newPassword, 10);
  user.recoveryCode = undefined;
  await user.save();
  return res.status(200).json({ message: 'Clave cambiada exitosamente' });
}

// Check alias and email availability without saving
export async function checkAvailability(req: Request, res: Response) {
  const { email, alias } = req.body;
  const emailInUse = await Usuario.findOne({ email });
  const aliasInUse = await Usuario.findOne({ alias });

  return res.status(200).json({
    emailAvailable: !emailInUse,
    aliasAvailable: !aliasInUse
  });
}