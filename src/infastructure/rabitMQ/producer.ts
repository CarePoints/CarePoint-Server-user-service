

import { connect, Connection, Channel } from 'amqplib/callback_api';

const amqpUrl: string = 'amqp://172.29.64.1';
const exchangeName: string = 'RegisterDatas';
const routingKey: string = 'user.data';

let channel: Channel;

const setupRabbitMQ = (callback: (channel: Channel) => void) => {
    connect(amqpUrl, (err: Error | null, connection: Connection) => {
        if (err) {
            console.error('Connection error:', err);
            return;
        }

        connection.createChannel((err: Error | null, ch: Channel) => {
            if (err) {
                console.error('Channel creation error:', err);
                return;
            }

            channel = ch;
            channel.assertExchange(exchangeName, 'direct', { durable: true });
            callback(channel);
        });
    });
};

const publishMessage = (message: any) => {
    if (!channel) {
        console.error('Channel not initialized.');
        return;
    }

    const messageString: string = JSON.stringify(message);
    channel.publish(exchangeName, routingKey, Buffer.from(messageString));
    console.log(`Message published: ${messageString}`);
};

export { setupRabbitMQ, publishMessage };
