import "dotenv/config";
import { startWorkerLoop } from "./src/queue/worker.js";

// Start the worker loop
startWorkerLoop().catch((error) => {
    console.error("[Worker] Fatal error starting worker:", error);
    process.exit(1);
});
