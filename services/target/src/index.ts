import express from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { meds } from './meds'; // Import mock data
const app = express();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const targetPort = process.env.TARGET_PORT;
const jwtSecret = process.env.JWT_SECRET;

if (!targetPort) {
  console.error('TARGET_PORT no definido, esperando.');
  process.exit(1);
}
if (!jwtSecret) {
  console.error('JWT_SECRET no definido, esperando.');
  process.exit(1);
}

app.use(express.json()); 
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`Target service: unautorizado, sin token desde ${req.ip} para ${req.originalUrl}`);
    return res.status(401).send('Sin token de autorización.');
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).user = decoded; 
    next(); 
  } catch (error: any) {
    console.warn(`Target service: unautorizado ${req.ip} para ${req.originalUrl}. Error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Sin autorización: Token expirado.');
    }
    return res.status(401).send('Sin autorización: Token inválido.');
  }
});

app.get('/', (req: Request, res: Response) => {
  console.log(`Target service: Se recibe método ${req.method} ${req.originalUrl} desde ${req.ip}`);
  res.json({ medicamentos: meds });
});

app.get('/status', (req: Request, res: Response) => {
  console.log(`Target service: Se recibe verificación de estado autenticada desde ${req.ip}`);
  res.send('👍');
});

app.listen(targetPort, () => {
  console.log(`Api pública escuchando al ${targetPort}.`);
});