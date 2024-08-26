
import {
  connect,
  Connection,
  Channel,
  ConsumeMessage,
} from "amqplib/callback_api";
import { UserRepository } from '../repositroy/userRepository';

const amqpUrl: string = "amqp://localhost";
const queueName: string = "Queue2"; // Unique name for each consumer's queue
const exchangeName: string = "Users";
const routingKey: string = "Users";

export const connectToRabbitMQ = (queue: string) => {
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
          if (receivedData) {
            const userData = new UserRepository();
            const result = await userData.isBlockDb(
                receivedData.email,
                receivedData.isBlocked
            );
            console.log("blocked succewssullf are", result);
          }
          // Process the message here
        }
        channel.ack(msg);
      });
    });
  });
};
