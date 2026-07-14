import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const { default: app } = await import("./app.js");
const { db } = await import("@minitube/shared");

const PORT = process.env.USER_SERVICE_PORT || 3003;

app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});
