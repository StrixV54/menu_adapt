import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import dishRoutes from "./routes/dish";
import authMiddleware from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

app.use(cors({
    origin: ["*"],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(authMiddleware);

// Routes
app.get("/", (req, res) => {
    res.send(`Indian Cuisine Explorer API is running.`);
});

app.use("/api", dishRoutes);


server.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}.`);
});
