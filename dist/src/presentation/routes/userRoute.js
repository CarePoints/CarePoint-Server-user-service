"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpController = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const signupRepository_1 = require("../../infastructure/repositroy/user/signupRepository");
const signup_1 = require("../../application/useCases/user/signup");
const signup_2 = require("../../presentation/controllers/userController/signup");
const userRepository = new signupRepository_1.UserRepositoryImpl();
const signUpUser = new signup_1.SignUpUser(userRepository);
const signUpController = new signup_2.SignUpController(signUpUser);
exports.signUpController = signUpController;
