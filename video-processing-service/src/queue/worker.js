import {
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs as sqsClient, QUEUE_URL } from "@minitube/shared";
import { processVideo } from "../services/videoProcessor.js";
import {
    fetchVideoDetails,
    updateVideoStatus,
} from "../services/api.service.js";

export const startWorkerLoop = async () => {
    console.log("====================================");
    console.log("  MiniTube Worker Service Started  ");
    console.log("  Waiting for SQS messages...      ");
    console.log("====================================");

    while (true) {
        try {
            const receiveCommand = new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                WaitTimeSeconds: 20,
                MaxNumberOfMessages: 1,
                AttributeNames: ["ApproximateReceiveCount"],
            });

            const response = await sqsClient.send(receiveCommand);

            if (!response.Messages || response.Messages.length === 0) {
                continue;
            }

            for (const message of response.Messages) {
                const receiveCount = parseInt(
                    message.Attributes?.ApproximateReceiveCount || "1",
                    10,
                );
                console.log(
                    `\n[Worker] Received job: ${message.MessageId} (Attempt ${receiveCount})`,
                );

                let videoId;
                try {
                    const body = JSON.parse(message.Body);
                    videoId = body.videoId;

                    if (!videoId) {
                        console.error(
                            "[Worker] Error: Missing videoId in SQS message body.",
                        );
                        await deleteMessage(message.ReceiptHandle);
                        continue;
                    }

                    console.log(
                        `[Worker] Fetching video ${videoId} from upload service...`,
                    );

                    let video;
                    try {
                        video = await fetchVideoDetails(videoId);
                    } catch (fetchError) {
                        console.error(`[Worker] Error: ${fetchError.message}`);

                        if (fetchError.statusCode === 404) {
                            console.error(
                                `[Worker] Video ${videoId} not found in upload service. Deleting message.`,
                            );
                            await deleteMessage(message.ReceiptHandle);
                            continue;
                        }

                        // Throw other errors to let the main retry logic handle it
                        throw fetchError;
                    }

                    if (!video) {
                        console.error(
                            `[Worker] Error: Video ${videoId} not found in database.`,
                        );
                        // Delete the message here to avoid infinite retries for a non-existent video
                        await deleteMessage(message.ReceiptHandle);
                        continue;
                    }

                    if (video.status !== "processing") {
                        console.log(
                            `[Worker] Video ${videoId} is not in processing state (current state: ${video.status}). Skipping.`,
                        );
                        await deleteMessage(message.ReceiptHandle);
                        continue;
                    }

                    // Process the video
                    await processVideo(video);

                    // Delete the message from SQS on successful processing
                    console.log(`[Worker] Deleting SQS message...`);
                    await deleteMessage(message.ReceiptHandle);
                    console.log(`[Worker] Job completed for video ${videoId}`);
                } catch (jobError) {
                    console.error(
                        `[Worker] Job failed for message ${message.MessageId} (Attempt ${receiveCount}):`,
                        jobError.stack || jobError,
                    );

                    if (receiveCount >= 2) {
                        console.log(
                            `[Worker] Max retries (2) reached. Marking as failed.`,
                        );
                        if (videoId) {
                            try {
                                await updateVideoStatus(videoId, {
                                    status: "failed",
                                    error_message:
                                        jobError.message ||
                                        "Unknown processing error",
                                });
                            } catch (apiError) {
                                console.error(
                                    `[Worker] Failed to update API status:`,
                                    apiError,
                                );
                                // Do not delete the message if we couldn't update the DB. Let it retry.
                                continue;
                            }
                        }
                        await deleteMessage(message.ReceiptHandle);
                    }
                }
            }
        } catch (pollError) {
            console.error(
                "[Worker] Error receiving messages from SQS:",
                pollError,
            );
            // Wait a bit before polling again to prevent rapid failing loops
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};

const deleteMessage = async (receiptHandle) => {
    const deleteCommand = new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: receiptHandle,
    });
    await sqsClient.send(deleteCommand);
};
