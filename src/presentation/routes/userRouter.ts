import express from 'express';
const router = express.Router();

import { UserRepository } from '../../infastructure/repositroy/userRepository'; 
import { UserUsecase } from '../../application/useCases/userUsecase';
import { UserController } from '../controllers/userController';
import authenticationToken from '../../utils/authMiddleware';


const repository = new UserRepository();
const user = new UserUsecase(repository);
const controller = new UserController(user);




// router.get(
//     "/google",
//     passport.authenticate("google", { scope: ["profile", "email"] })
//   );
//   //callback google auth with values
//   router.get(
//     "/auth/google/redirect",
//     passport.authenticate("google"),
//     controller.googleCallback.bind(controller)
//   );



router.post('/signup', controller.registerUser.bind(controller));
router.post('/verify-otp', controller.otpConfirm.bind(controller)); 
router.post('/login', controller.login.bind(controller));
router.get('/user', authenticationToken,controller.getUserID.bind(controller));
router.post('/refreshToken', controller.refreshToken.bind(controller));
router.post('/checkEmail', controller.checkEmail.bind(controller));
router.post('/forgotPassword', controller.forgotPassword.bind(controller));
router.post('/isBlock',controller.isBlock.bind(controller))

// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get(
//     "/auth/google/callback",
//     passport.authenticate("google", {
//       failureRedirect: "http://localhost:3000/login",
//     }),
//     controller.handleGooglePassport.bind(controller)
//   );


export default router