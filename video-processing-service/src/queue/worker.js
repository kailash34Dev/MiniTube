import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import sqsClient, { QUEUE_URL } from '../config/sqs.js';
import db from '../config/database.js';
import { processVideo } from '../services/videoProcessor.js';

export const startWorkerLoop = async () => {
  console.log('====================================');
  console.log('  VideoHub Worker Service Started  ');
  console.log('  Waiting for SQS messages...      ');
  console.log('====================================');

  while (true) {
    try {
      const receiveCommand = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        WaitTimeSeconds: 20,
        MaxNumberOfMessages: 1,
      });

      const response = await sqsClient.send(receiveCommand);

      if (!response.Messages || response.Messages.length === 0) {
        continue;
      }

      for (const message of response.Messages) {
        console.log(`\n[Worker] Received job: ${message.MessageId}`);
        
        try {
          const body = JSON.parse(message.Body);
          const { videoId } = body;
          
          if (!videoId) {
            console.error('[Worker] Error: Missing videoId in SQS message body.');
            continue; // Skip processing, let it return to queue or fail
          }

          console.log(`[Worker] Fetching video ${videoId} from database...`);
          const video = await db.video.findUnique({
            where: { id: videoId }
          });

          if (!video) {
            console.error(`[Worker] Error: Video ${videoId} not found in database.`);
            // You might want to delete the message here to avoid infinite retries for a non-existent video
            await deleteMessage(message.ReceiptHandle);
            continue;
          }
          
          if (video.status !== 'PROCESSING') {
             console.log(`[Worker] Video ${videoId} is not in PROCESSING state (current state: ${video.status}). Skipping.`);
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
          console.error(`[Worker] Job failed for message ${message.MessageId}:`, jobError.stack || jobError);
          // Do NOT delete the message; let SQS retry mechanism handle it.
        }
      }
    } catch (pollError) {
      console.error('[Worker] Error receiving messages from SQS:', pollError);
      // Wait a bit before polling again to prevent rapid failing loops
      await new Promise(resolve => setTimeout(resolve, 5000));
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
