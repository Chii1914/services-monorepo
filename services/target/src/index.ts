import express from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3004;
const jwtSecret = process.env.JWT_SECRET || 'default'; // Default secret for dev

app.use(express.json()); // Enable JSON body parsing

// Middleware for JWT authentication
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`Target Service: Unauthorized access attempt (no token) from ${req.ip} for ${req.originalUrl}`);
    return res.status(401).send('Unauthorized: No token provided or invalid format.');
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, jwtSecret);
    // Optionally, attach the decoded payload to the request for later use
    (req as any).user = decoded; // Type assertion to add 'user' property
    console.log(`Target Service: JWT verified for user/service: ${(decoded as any).service || 'unknown'}`);
    next(); // Token is valid, proceed to the next handler
  } catch (error: any) {
    console.warn(`Target Service: Unauthorized access attempt (invalid token) from ${req.ip} for ${req.originalUrl}. Error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Unauthorized: Token expired.');
    }
    return res.status(401).send('Unauthorized: Invalid token.');
  }
});

app.get('/', (req: Request, res: Response) => {
  console.log(`Target Service: Received authenticated request for ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.send(`Hello from JWT-Protected Target Service! You requested: ${req.originalUrl}`);
});

app.get('/status', (req: Request, res: Response) => {
  console.log(`Target Service: Received authenticated status check from ${req.ip}`);
  res.send('JWT-Protected Target Service is Healthy!');
});

app.listen(port, () => {
  console.log(`JWT-Protected Target Service listening on HTTP port ${port}.`);
});