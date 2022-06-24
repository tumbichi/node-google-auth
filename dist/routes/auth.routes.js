"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const router = (0, express_1.Router)();
router.post("/login", auth_controllers_1.login);
router.post("/register", auth_controllers_1.register);
router.post("/validate-authentication", auth_controllers_1.validateToken);
router.post("/login-with-google", auth_controllers_1.loginWithGoogle);
router.get("/validateCognitoToken", auth_controllers_1.validateCognitoToken);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map