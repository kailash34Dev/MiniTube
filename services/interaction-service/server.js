import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const { default: app } = await import("./app.js");
const { db } = await import("@minitube/shared");

const PORT = process.env.INTERACTION_SERVICE_PORT || 5003;

app.listen(PORT, () => {
    console.log(`Interaction service is running on port ${PORT}`);
});
