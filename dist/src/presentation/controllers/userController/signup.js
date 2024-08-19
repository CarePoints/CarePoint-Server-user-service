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
exports.SignUpController = void 0;
class SignUpController {
    constructor(signUpUser) {
        this.signUpUser = signUpUser;
    }
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { firstName, lastName, email, password, phoneNumber } = req.body;
                yield this.signUpUser.execute(firstName, lastName, email, password, phoneNumber);
                res.status(201).send('User created successfully');
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
}
exports.SignUpController = SignUpController;
