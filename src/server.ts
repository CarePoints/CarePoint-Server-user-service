import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import database from "./config/database/connection";
import router from "./presentation/routes/userRouter";
import passportConfig from "../src/auth/passport";
import passport from "passport";
import session from "express-session";
import runProducer from "./infastructure/kafka/producer";
import { setupRabbitMQ } from "./infastructure/rabitMQ/producer";
import { connectToRabbitMQ } from "./infastructure/rabitMQ/consumer";
import { errorMiddleware } from "../src/middleware/errorMiddleware"; 
import { setupRabbitMQForAppoinment } from "./infastructure/rabitMQ/appoinmentProducer";
import { connectToRabbitMQForAddProudcts } from "./infastructure/rabitMQ/addProductsConsumer";
import { connectToRabbitMQForUserData } from "./infastructure/rabitMQ/fetchingUserDataConsumer";
import { setupRabbitMQForUserId } from "./infastructure/rabitMQ/fetchingUserDataProducer";

database();
passportConfig()
const PORT = process.env.PORT || 4000
const app = express();
app.use(express.json());

app.use(session({
  secret: 'your-secret-key-session',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use("/user-service", router);


app.use(errorMiddleware);


// runProducer().catch(console.error);

setupRabbitMQ((channel) => {
  console.log('RabbitMQ is set up and ready.');
});
setupRabbitMQForAppoinment((channel) => {
  console.log('RabbitMQ is set up and ready.');
});
setupRabbitMQForUserId((channel) => {
  console.log('RabbitMQ is set up and ready.');
});

connectToRabbitMQ('Queue2')
connectToRabbitMQForAddProudcts('Queue2')
// connectToRabbitMQForAddProudcts('productsQueue')
connectToRabbitMQForUserData('userDataQueue')

app.listen(PORT, () => {
  console.log(`server is runnign ${PORT}`);
});
