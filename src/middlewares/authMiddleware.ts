import axios from "axios";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { client, CLIENT_ID } from "../google-auth";

export interface TokenPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("HOLA");
  const { authorization } = req.headers;

  console.log("authorization", authorization);

  if (!authorization) {
    return res.sendStatus(401);
  }
  const token = authorization.replace("Bearer", "").trim();
  console.log("token", token);
  try {
    // const data = jwt.verify(token, "SECRET");
    // const { email } = data as TokenPayload;
    // console.log(email);

    // req.email = email;
    // req.email = email;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    if (!payload) return res.sendStatus(401);

    return next();
  } catch (error) {
    console.log("error", error);
    return res.sendStatus(401);
  }
}
