"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = generateUniqueId;
function generateUniqueId() {
    return Math.random().toString(36).slice(2, 11);
}
