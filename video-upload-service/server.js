import 'dotenv/config';
import "@minitube/shared";
import app from "./src/app.js";

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
