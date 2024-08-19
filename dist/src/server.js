"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const connection_1 = __importDefault(require("./config/database/connection"));
const userRoute_1 = require("./presentation/routes/userRoute");
(0, connection_1.default)();
const port = process.env.PORT || 5001;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post('/signup', (req, res) => {
    console.log('Backend data is get');
    userRoute_1.signUpController.handle(req, res);
});
app.get('/', (req, res) => {
    res.send('Hellow world');
});
app.listen(port, () => {
    console.log(`server is runnign ${port}`);
});
