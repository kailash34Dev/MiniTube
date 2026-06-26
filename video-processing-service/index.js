import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { startWorkerLoop } from './src/queue/worker.js';

// Calculate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '.env') });
// We'll also allow reading from parent directory in case it's run locally next to root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') }); 

// Start the worker loop
startWorkerLoop().catch((error) => {
  console.error('[Worker] Fatal error starting worker:', error);
  process.exit(1);
});
