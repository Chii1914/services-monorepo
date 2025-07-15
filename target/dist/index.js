"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3004; // Use environment variable or default
app.use(express_1.default.json()); // Enable JSON body parsing
app.get('/', (req, res) => {
    console.log(`Target Service: Received request for ${req.method} ${req.originalUrl} from ${req.ip}`);
    res.send(`Hello from Simplified NestJS Target Service! You requested: ${req.originalUrl}`);
});
app.get('/status', (req, res) => {
    console.log(`Target Service: Received status check from ${req.ip}`);
    res.send('Simplified NestJS Target Service is Healthy!');
});
app.listen(port, () => {
    console.log(`Simplified NestJS Target Service listening on HTTP port ${port}.`);
});
