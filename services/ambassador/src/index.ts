import express from 'express';
import { Request, Response } from 'express';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const app = express();
const port = process.env.PORT || 3003;
const targetServiceUrl = process.env.TARGET_SERVICE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('JWT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

if (!targetServiceUrl) {
  console.error('TARGET_SERVICE_URL is not defined in the environment variables.');
  process.exit(1);
}


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.all('*', async (req: Request, res: Response) => {
  const originalUrl = req.originalUrl;
  const method = req.method;
  const headers = req.headers;
  const body = req.body;

  const proxyTargetUrl = `${targetServiceUrl}${originalUrl}`;

  console.log(`Ambassador: Recibió ${method} request para ${originalUrl} desde ${req.ip}`);
  console.log(`Ambassador: Re enviando a ${proxyTargetUrl}`);

  try {

    const token = jwt.sign(
      { service: 'ambassador', userId: req.ip }, 
      jwtSecret,                                            
      { expiresIn: '1h' }                                   
    );

    const axiosConfig: AxiosRequestConfig = {
      method: method as AxiosRequestConfig['method'],
      url: proxyTargetUrl,
      headers: {
        ...headers,
        'Authorization': `Bearer ${token}` 
      },
      data: body,
      validateStatus: () => true, 
      timeout: 10000,
    };

    if (axiosConfig.headers) {
      delete axiosConfig.headers['host'];
      delete axiosConfig.headers['connection'];
      delete axiosConfig.headers['content-length']; 
    }

    const targetResponse: AxiosResponse = await axios(axiosConfig);

    console.log(`Ambassador: Recibió respuesta del servicio objetivo con estado: ${targetResponse.status}`);

    for (const key in targetResponse.headers) {
      if (targetResponse.headers.hasOwnProperty(key)) {
        if (key.toLowerCase() === 'content-type' && res.headersSent) continue;
        res.setHeader(key, targetResponse.headers[key]);
      }
    }

    res.status(targetResponse.status);

    res.send(targetResponse.data);

  } catch (error: any) {
    console.error(`Ambassador: Error forwarding request: ${error.message}`);
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(502).send('Service unavailable or connection timed out.'); // 502 Bad Gateway
    } else {
      res.status(500).send('Internal ambassador error.'); // 500 Internal Server Error
    }
  }
});

app.listen(port, () => {
  console.log(`JWT-Issuing Ambassador Service listening on HTTP port ${port}.`);
});