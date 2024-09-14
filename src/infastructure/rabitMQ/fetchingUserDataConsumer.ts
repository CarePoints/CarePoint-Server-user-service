
import {
    connect,
    Connection,
    Channel,
    ConsumeMessage,
  } from "amqplib/callback_api";
  import { UserRepository } from '../repositroy/userRepository';
import { publishMessageForUserId } from "./fetchingUserDataProducer";
  
  const amqpUrl: string = "amqp://localhost";
  const exchangeName: string = "userEmail";
  const routingKey: string = "userEmail";
  
  export const connectToRabbitMQForUserData = (queue: string) => {
    connect(amqpUrl, (err: Error | null, connection: Connection) => {
      if (err) {
        throw err;
      }
      connection.createChannel((err: Error | null, channel: Channel) => {
        if (err) {
          throw err;
        }
  
        // Assert the queue
        channel.assertQueue(queue, { durable: false });
  
        // Bind the queue to the exchange with the routing key
        channel.bindQueue(queue, exchangeName, routingKey);
  
        console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);
  
        // Consume messages from the queue
        channel.consume(queue,async (msg: any | null) => {
          if (msg) {
            const receivedData = JSON.parse(msg.content.toString());
            console.log(`Received message in ${queue}:`, receivedData);
            const repositroy = new UserRepository();
            const {email} = receivedData
             const userData = repositroy.findUserExists(email);
             console.log('user data is',userData)
             userData.then((data)=>{
                console.log('usersdfasdf',data)
                publishMessageForUserId(data)
             })
      
          }
          channel.ack(msg);
        });
      });
    });
  };
