import { Request, Response } from 'express';
import { Usuario } from '../model/Usuario';

let users: Usuario[] = [];

export const getUsers = (req: Request, res: Response) => {
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const newUser: Usuario = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
};