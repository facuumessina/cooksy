// app/api/controller/authController.ts
import type { Request, Response } from 'express';

export function registerStep1(req: Request, res: Response) {
  const { email, alias } = req.body;
  // Validación y lógica de negocio acá
  res.status(200).json({ message: 'Registro paso 1 OK' });
}

export function registerStep2(req: Request, res: Response) {
  const { email, password, nombre } = req.body;
  res.status(201).json({ message: 'Usuario registrado' });
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body;
  res.status(200).json({ token: 'mock-jwt-token' });
}

export function recoverPassword(req: Request, res: Response) {
  const { email } = req.body;
  res.status(200).json({ message: 'Código enviado' });
}

export function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body;
  res.status(200).json({ message: 'Clave actualizada' });
}