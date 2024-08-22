import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'user',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

const runProducer = async () => {
    try {
        await producer.connect();
        console.log('Producer connected');

        await producer.send({
            topic: 'userDatas',
            messages: [{ value: 'Hello Kafka' }],
        });
        console.log('Message sent');
    } catch (error) {
        console.error('Error in producer:', error);
    } finally {
        await producer.disconnect();
        console.log('Producer disconnected');
    }
};

export default runProducer;
