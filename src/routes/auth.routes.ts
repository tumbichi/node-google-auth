import { Router } from "express";
import {
  login,
  loginWithGoogle,
  register,
  validateCognitoToken,
  validateToken,
} from "../controllers/auth.controllers";
const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/validate-authentication", validateToken);
router.post("/login-with-google", loginWithGoogle);
router.get("/validateCognitoToken", validateCognitoToken)

export default router;
