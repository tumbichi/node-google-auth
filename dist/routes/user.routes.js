"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
router.post("/users", user_controllers_1.createUser);
router.get("/users", authMiddleware_1.default, user_controllers_1.getUsers);
router.put("/users/:id", user_controllers_1.updateUser);
router.delete("/users/:id", user_controllers_1.deleteUser);
router.get("/users/:id", user_controllers_1.getUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map