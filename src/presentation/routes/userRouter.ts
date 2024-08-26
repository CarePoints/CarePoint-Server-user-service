import express from "express";
const router = express.Router();

import { UserRepository } from "../../infastructure/repositroy/userRepository";
import { UserUsecase } from "../../application/useCases/userUsecase";
import { UserController } from "../controllers/userController";
import authenticationToken from "../../utils/authMiddleware";
import passport from "passport";

const repository = new UserRepository();
const user = new UserUsecase(repository);
const controller = new UserController(user);

router.get("/auth/google", (req, res, next) => {
  console.log("Google OAuth initiated");
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

// Route to handle Google authentication callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  controller.googleCallback.bind(controller)
);

router.post("/signup", controller.registerUser.bind(controller));
router.post("/verify-otp", controller.otpConfirm.bind(controller));
router.post("/login", controller.login.bind(controller));
router.get("/user", authenticationToken, controller.getUserID.bind(controller));
router.post("/refreshToken", controller.refreshToken.bind(controller));
router.post("/checkEmail", controller.checkEmail.bind(controller));
router.post("/forgotPassword", controller.forgotPassword.bind(controller));
router.post("/resetPassword", controller.resetPassword.bind(controller));
router.post('/appoinments', controller.appoinments.bind(controller))
router.post('/payments', controller.razorpayPayments.bind(controller))
router.get('/bookedDoctors', controller.bookedDoctors.bind(controller))



export default router;
