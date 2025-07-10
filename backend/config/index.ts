import dotenv from "dotenv";
import { db, queryClient } from "./database";

try {
    dotenv.config();
} catch (error) {
    console.error("Error loading environment variables:", error);
    process.exit(1);
}

// Test PostgreSQL connection
async function testDbConnection() {
    try {
        await queryClient`SELECT 1`;
        console.log("Successfully connected to PostgreSQL!!");
    } catch (err) {
        console.log("Error connecting to PostgreSQL!!\n", err);
    }
}

testDbConnection();

export { db };
