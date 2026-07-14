import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Use dynamic imports to ensure environment variables are loaded first
const { startWorkerLoop } = await import("./src/queue/worker.js");

// Start the worker loop
startWorkerLoop().catch((error) => {
    console.error("[Worker] Fatal error starting worker:", error);
    process.exit(1);
});
