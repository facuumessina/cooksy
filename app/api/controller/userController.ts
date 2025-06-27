import { Request, Response } from 'express';
import { User } from '../models/User';

let users: User[] = [];

export const getUsers = (req: Request, res: Response) => {
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const newUser: User = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
};