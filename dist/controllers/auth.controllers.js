"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithGoogle = exports.validateCognitoToken = exports.validateToken = exports.register = exports.login = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwk_to_pem_1 = __importDefault(require("jwk-to-pem"));
const UserEntity_1 = require("../entities/UserEntity");
const google_auth_1 = require("../google-auth");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!(body.email && body.password) && !(body.username && body.password)) {
            return res.status(400).send();
        }
        const user = body.email
            ? yield UserEntity_1.UserEntity.findOne({ where: { email: body.email } })
            : yield UserEntity_1.UserEntity.findOne({ where: { username: body.username } });
        if (user === null) {
            return res
                .status(401)
                .send(`${body.email ? "Email" : "Username"} does not exist`);
        }
        if (!user.isValidPassword(body.password)) {
            return res.status(401).send("Wrong password");
        }
        const { password } = user, restUser = __rest(user, ["password"]);
        return res.status(200).json({ user: restUser, token: user.generateJWT() });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, firstname, lastname } = req.body;
        const userExists = yield UserEntity_1.UserEntity.findOne({ where: { email } });
        if (userExists) {
            return res.sendStatus(409);
        }
        const user = new UserEntity_1.UserEntity();
        user.username = username;
        user.email = email;
        user.firstname = firstname;
        user.lastname = lastname;
        user.password = user.hashPassword(password);
        yield UserEntity_1.UserEntity.save(user);
        return res.status(201).send("User created");
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error", error);
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.register = register;
const validateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        return res.status(400).send();
    }
    try {
        // data = jwt.verify(token, "SECRET");
        const ticket = yield google_auth_1.client.verifyIdToken({
            idToken: token,
            audience: google_auth_1.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const response = yield axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        console.log("response.data", response.data);
        if (!payload || !payload.email)
            return res.sendStatus(401);
        const { email } = payload;
        const user = yield UserEntity_1.UserEntity.findOneBy({ email });
        if (!user)
            return res.status(401).send();
        const { password } = user, restUser = __rest(user, ["password"]);
        return res.status(200).json({ user: restUser, token });
    }
    catch (error) {
        return res.status(401).send();
    }
    // const { id } = data as TokenPayload;
    // const user = await User.findOneBy({ id });
    // if (!user) return res.status(401).send();
    // const { password, ...restUser } = user;
    // return res.status(200).json({ user: restUser, token });
});
exports.validateToken = validateToken;
const validateCognitoToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: jwks } = yield axios_1.default.get("https://cognito-idp.us-east-1.amazonaws.com/us-east-1_cRRYK7Y5T/.well-known/jwks.json");
    const { id_token, access_token } = req.query;
    if (typeof id_token !== "string")
        return res.status(404).send("Tenes que mandar el token id valido");
    const idTokenDecoded = jsonwebtoken_1.default.decode(id_token, { complete: true });
    if (!idTokenDecoded)
        return res.status(404).send("Tenes que mandar el token id valido");
    const { header, payload } = idTokenDecoded;
    const idTokenJWK = jwks.keys.find((jwk) => jwk.kid === header.kid);
    if (!idTokenJWK)
        return res.status(404).send("Tenes que mandar el token id valido");
    const pem = (0, jwk_to_pem_1.default)(idTokenJWK);
    jsonwebtoken_1.default.verify(id_token, pem, { algorithms: ["RS256"] }, function (err, decodedToken) {
        if (err)
            console.log("error", err);
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
});
exports.validateCognitoToken = validateCognitoToken;
function loginWithGoogle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.token)
            return res.status(400).send();
        console.log("req.body.token", req.body.token);
        try {
            const ticket = yield google_auth_1.client.verifyIdToken({
                idToken: req.body.token,
                audience: google_auth_1.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            //   const userid = payload["sub"];
            if (!payload)
                return res.status(401).send();
            const domain = payload["hd"];
            if (domain !== "inventa.shop")
                return res
                    .status(403)
                    .send("You must remain in the inventa.shop to access ");
            console.log("payload", payload);
            const user = yield UserEntity_1.UserEntity.findOneBy({ email: payload.email });
            if (user)
                return res.status(200).json({ user, token: req.body.token });
            const newUser = new UserEntity_1.UserEntity();
            newUser.username = payload.name || (payload.name = "");
            newUser.firstname = payload.given_name || (payload.given_name = "");
            newUser.lastname = payload.family_name || (payload.family_name = "");
            newUser.email = payload.email || (payload.email = "");
            const createdUser = yield UserEntity_1.UserEntity.save(newUser);
            // Delete password atributte before send success created response
            const { password } = createdUser, restCreatedUser = __rest(createdUser, ["password"]);
            return res
                .status(201)
                .json({ user: restCreatedUser, token: req.body.token });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log("error", error);
                return res.status(500).json({ message: error.message });
            }
        }
    });
}
exports.loginWithGoogle = loginWithGoogle;
//# sourceMappingURL=auth.controllers.js.map