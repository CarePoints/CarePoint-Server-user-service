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
exports.SignUpUser = void 0;
const User_1 = require("../../../domain/entities/User");
const passwordUtils_1 = require("../../../../utils/passwordUtils");
const generateUniqueIdUtils_1 = require("../../../../utils/generateUniqueIdUtils");
class SignUpUser {
    constructor(userRepoitory) {
        this.userRepoitory = userRepoitory;
    }
    execute(firstName, lastName, email, password, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.userRepoitory.findByEmail(email)) {
                throw new Error("Email already in use");
            }
            const passwordHash = yield (0, passwordUtils_1.hashPassword)(password);
            const user = new User_1.User((0, generateUniqueIdUtils_1.generateUniqueId)(), // _id
            firstName, // firstName
            lastName, // lastName
            email, // email
            false, // isBlocked (default value)
            false, // isVerified (default value)
            phoneNumber, // phoneNumber
            passwordHash, // password
            undefined, // verificationToken (optional)
            [], // roles (default empty array)
            undefined // profilePhoto (optional)
            );
            yield this.userRepoitory.save(user);
        });
    }
}
exports.SignUpUser = SignUpUser;
