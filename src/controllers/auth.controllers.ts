import axios from "axios";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import jwkToPem, { JWK, RSA } from "jwk-to-pem";
import { UserEntity as User } from "../entities/UserEntity";
import { client, CLIENT_ID } from "../google-auth";
import { TokenPayload } from "../middlewares/authMiddleware";

export interface Jwks {
  keys: JwtKey[];
}

export interface JwtKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    if (!(body.email && body.password) && !(body.username && body.password)) {
      return res.status(400).send();
    }

    const user = body.email
      ? await User.findOne({ where: { email: body.email } })
      : await User.findOne({ where: { username: body.username } });

    if (user === null) {
      return res.status(401).send(`${body.email ? "Email" : "Username"} does not exist`);
    }
    if (!user.isValidPassword(body.password)) {
      return res.status(401).send("Wrong password");
    }
    const { password, ...restUser } = user;

    return res.status(200).json({ user: restUser, token: user.generateJWT() });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstname, lastname } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.sendStatus(409);
    }

    const user = new User();

    user.username = username;
    user.email = email;
    user.firstname = firstname;
    user.lastname = lastname;
    user.password = user.hashPassword(password);

    await User.save(user);
    return res.status(201).send("User created");
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error);
      return res.status(500).json({ message: error.message });
    }
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send();
  }
  try {
    // data = jwt.verify(token, "SECRET");
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    console.log("response.data", response.data);

    if (!payload || !payload.email) return res.sendStatus(401);

    const { email } = payload;

    const user = await User.findOneBy({ email });

    if (!user) return res.status(401).send();

    const { password, ...restUser } = user;

    return res.status(200).json({ user: { ...payload, id: restUser.id }, token });
  } catch (error: any) {
    return res.status(401).send();
  }
  // const { id } = data as TokenPayload;

  // const user = await User.findOneBy({ id });

  // if (!user) return res.status(401).send();

  // const { password, ...restUser } = user;

  // return res.status(200).json({ user: restUser, token });
};

export const validateCognitoToken = async (req: Request, res: Response) => {
  const { data: jwks } = await axios.get<Jwks>(
    "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_cRRYK7Y5T/.well-known/jwks.json"
  );

  const { id_token, access_token } = req.query;

  if (typeof id_token !== "string") return res.status(404).send("Tenes que mandar el token id valido");

  const idTokenDecoded = jwt.decode(id_token, { complete: true });

  if (!idTokenDecoded) return res.status(404).send("Tenes que mandar el token id valido");

  const { header, payload } = idTokenDecoded;

  const idTokenJWK = jwks.keys.find((jwk) => jwk.kid === header.kid);

  if (!idTokenJWK) return res.status(404).send("Tenes que mandar el token id valido");

  const pem = jwkToPem(idTokenJWK as any);

  jwt.verify(id_token, pem, { algorithms: ["RS256"] }, function (err, decodedToken) {
    if (err) console.log("error", err);
    console.log("decodedToken", decodedToken);
  });
  // console.log("idTokenDecoded.header", idTokenDecoded.header);
  // console.log('req', req.query)
  // console.log('typeof jwk', typeof jwk)
  // console.log("pem", pem);
  return res.status(200).json({
    jwks,
    id_token,
    access_token,
    idTokenHeader: header,
    idTokenDecoded: payload,
  });
};

export async function loginWithGoogle(req: Request, res: Response) {
  if (!req.body.token) return res.status(400).send();

  console.log("req.body.token", req.body.token);
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //   const userid = payload["sub"];

    if (!payload) return res.status(401).send();

    const user = await User.findOneBy({ email: payload.email });

    if (user) return res.status(200).json({ user: { id: user.id, ...payload }, token: req.body.token });

    const newUser = new User();

    newUser.username = payload.name ||= "";
    newUser.firstname = payload.given_name ||= "";
    newUser.lastname = payload.family_name ||= "";
    newUser.email = payload.email ||= "";

    const createdUser = await User.save(newUser);
    // Delete password atributte before send success created response
    const { password, ...restCreatedUser } = createdUser;

    return res.status(201).json({
      user: { id: restCreatedUser.id, ...payload },
      token: req.body.token,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error);
      return res.status(500).json({ message: error.message });
    }
  }
}
