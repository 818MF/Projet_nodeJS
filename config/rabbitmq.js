const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
	try {
		const connection = await amqp.connect(process.env.RABBITMQ_URL);
		channel = await connection.createChannel();

		// Create queues
		await channel.assertQueue("movie_notifications", {
			durable: true,
		});

		console.log("RabbitMQ connection established");
		return channel;
	} catch (error) {
		console.error("RabbitMQ connection error:", error);
		throw error;
	}
};

const publishMessage = async (queue, message) => {
	try {
		if (!channel) {
			throw new Error("RabbitMQ channel not initialized");
		}

		await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
	} catch (error) {
		console.error("Error publishing message:", error);
		throw error;
	}
};

module.exports = {
	connectRabbitMQ,
	publishMessage,
};
