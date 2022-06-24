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
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_1 = require("../google-auth");
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const ticket = yield google_auth_1.client.verifyIdToken({
                idToken: token,
                audience: google_auth_1.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            if (!payload)
                return res.sendStatus(401);
            return next();
        }
        catch (error) {
            console.log("error", error);
            return res.sendStatus(401);
        }
    });
}
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map