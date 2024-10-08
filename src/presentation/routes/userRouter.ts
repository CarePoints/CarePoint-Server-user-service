import express from "express";
const router = express.Router();

import { UserRepository } from "../../infastructure/repositroy/userRepository";
import { UserUsecase } from "../../application/useCases/userUsecase";
import { UserController } from "../controllers/userController";
import authenticationToken from "../../utils/authMiddleware";
import passport from "passport";
import { uploadSingleFile } from "../../middleware/uploadMiddleware";
import multer from 'multer'
const upload = multer()
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
router.post('/cancelBooking', controller.cancelBooking.bind(controller))
router.post('/appointmentAccepted', controller.appointmentAccepted.bind(controller))
router.post('/appointmentRejected', controller.appointmentRejected.bind(controller))
router.get('/medicines', controller.medicines.bind(controller))
router.post('/add-to-cart', controller.addToCart.bind(controller))
router.post('/getCartProducts', controller.getCartProducts.bind(controller))
router.post('/updateQuantity', controller.updateQuantity.bind(controller))
router.post('/removeItem', controller.removeItem.bind(controller))
router.post('/cartProducts', controller.cartProducts.bind(controller))
router.post('/productsOrders', controller.productsOrders.bind(controller))
router.post('/upload',upload.single('file'), controller.prescription.bind(controller))
router.post('/orderData', controller.orderData.bind(controller))
router.get('/getAdminOrderData', controller.getAdminOrderData.bind(controller))
router.post('/updateStatus', controller.updateStatus.bind(controller))
router.post('/deleteOrder', controller.deleteOrder.bind(controller))
router.post('/orderCancel', controller.orderCancel.bind(controller))


export default router;
