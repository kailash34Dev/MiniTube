import { SendMessageCommand } from "@aws-sdk/client-sqs";
import sqsClient, { QUEUE_URL } from "../config/sqs.js";

export const queueVideoForProcessing = async (videoId) => {
    try {
        const sqsPayload = { videoId };
        const sendCommand = new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(sqsPayload),
        });
        await sqsClient.send(sendCommand);
    } catch (error) {
        console.error("Error queuing video processing:", error);
        throw error;
    }
};
