import express from 'express';
import { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3004; // Use environment variable or default

app.use(express.json()); // Enable JSON body parsing

app.get('/', (req: Request, res: Response) => {
  console.log(`Target Service: Received request for ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.send(`Hello from Simplified NestJS Target Service! You requested: ${req.originalUrl}`);
});

app.get('/status', (req: Request, res: Response) => {
  console.log(`Target Service: Received status check from ${req.ip}`);
  res.send('Simplified NestJS Target Service is Healthy!');
});

app.listen(port, () => {
  console.log(`Simplified NestJS Target Service listening on HTTP port ${port}.`);
});