"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(_id, firstName, lastName, email, isBlocked = false, isVerified = false, phoneNumber, password, verificationToken, roles = [], profilePhoto) {
        this._id = _id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isBlocked = isBlocked;
        this.isVerified = isVerified;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.verificationToken = verificationToken;
        this.roles = roles;
        this.profilePhoto = profilePhoto;
    }
}
exports.User = User;
