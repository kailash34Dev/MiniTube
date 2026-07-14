import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Use dynamic imports to ensure environment variables are loaded first
await import("@minitube/shared");
const { default: app } = await import("./src/app.js");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Video Upload Service is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error(`[Unhandled Rejection]: ${err.message}`);
    console.error(err.stack);
    server.close(() => {
        process.exit(1);
    });
});

process.on("uncaughtException", (err) => {
    console.error(`[Uncaught Exception]: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});
