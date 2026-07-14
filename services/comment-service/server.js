import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const { default: app } = await import("./app.js");
const { db } = await import("@minitube/shared");

const PORT = process.env.COMMENT_SERVICE_PORT || 5004;

app.listen(PORT, () => {
    console.log(`Comment service is running on port ${PORT}`);
});
