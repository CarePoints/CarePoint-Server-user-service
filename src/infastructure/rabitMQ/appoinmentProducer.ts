

import { connect, Connection, Channel } from 'amqplib/callback_api';
import { IAppointment, IDoctor } from '../database/model/appoinments';

const amqpUrl: string = 'amqp://172.29.64.1';
const exchangeName: string = 'appoinmentDetails';
const routingKey: string = 'appoinment.data';

let channel: Channel;

const setupRabbitMQForAppoinment = (callback: (channel: Channel) => void) => {
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

const publishMessageForAppoinment = (selectedDoctor:IDoctor,Date:string,Time:string,user:IAppointment,appointmentType:string) => {
    if (!channel) {
        console.error('Channel not initialized.gfsdvfsdagdsfgsdfg');
        return;
    }
    let email = selectedDoctor.email;
    const messageString: string = JSON.stringify({email,Date,Time,user,appointmentType});
    channel.publish(exchangeName, routingKey, Buffer.from(messageString));
    console.log(`Message published: ${messageString}`);
};

export { setupRabbitMQForAppoinment, publishMessageForAppoinment };
