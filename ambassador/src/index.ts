import express from 'express';
import { Request, Response } from 'express';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const app = express();
const port = process.env.PORT || 3003; // Use environment variable or default
const targetServiceUrl = process.env.TARGET_SERVICE_URL || 'http://localhost:3004';

app.use(express.json()); // Enable JSON body parsing
app.use(express.urlencoded({ extended: true })); // Enable URL-encoded body parsing

console.log(`Ambassador configured to forward to: ${targetServiceUrl}`);

// Catch-all route to proxy all requests
app.all('*', async (req: Request, res: Response) => {
  const originalUrl = req.originalUrl;
  const method = req.method;
  const headers = req.headers;
  const body = req.body;

  const proxyTargetUrl = `${targetServiceUrl}${originalUrl}`;

  console.log(`Ambassador: Received ${method} request for ${originalUrl} from ${req.ip}`);
  console.log(`Ambassador: Forwarding to ${proxyTargetUrl}`);

  try {
    const axiosConfig: AxiosRequestConfig = {
      method: method as AxiosRequestConfig['method'],
      url: proxyTargetUrl,
      headers: { ...headers }, // Copy all original headers
      data: body, // Pass the original request body
      validateStatus: () => true, // Do not throw on HTTP errors (e.g., 4xx, 5xx)
      timeout: 10000, // 10 seconds timeout for the target service
    };

    // Remove headers that Axios/Node.js will manage or are problematic for proxying
    if (axiosConfig.headers) {
      delete axiosConfig.headers['host'];
      delete axiosConfig.headers['connection'];
      // Content-length might be recalculated by axios, so it's often best to let it handle it
      delete axiosConfig.headers['content-length'];
    }

    const targetResponse: AxiosResponse = await axios(axiosConfig);

    console.log(`Ambassador: Received response from target service with status: ${targetResponse.status}`);

    // Copy headers from the target service response to the client response
    for (const key in targetResponse.headers) {
      if (targetResponse.headers.hasOwnProperty(key)) {
        // Express might set Content-Type automatically, avoid duplicates
        if (key.toLowerCase() === 'content-type' && res.headersSent) continue;
        res.setHeader(key, targetResponse.headers[key]);
      }
    }

    // Set the HTTP status code
    res.status(targetResponse.status);

    // Send the target service's data back to the client
    res.send(targetResponse.data);

  } catch (error: any) { // Use 'any' for error type to access 'code'
    console.error(`Ambassador: Error forwarding request: ${error.message}`);
    // Handle different types of errors (e.g., network error, timeout)
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(502).send('Service unavailable or connection timed out.'); // 502 Bad Gateway
    } else {
      res.status(500).send('Internal ambassador error.'); // 500 Internal Server Error
    }
  }
});

app.listen(port, () => {
  console.log(`Simplified NestJS Ambassador Service listening on HTTP port ${port}.`);
});