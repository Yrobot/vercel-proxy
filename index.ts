import express, { Express, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app: Express = express();
const port = process.env.PORT ?? 3003;

app.use(
  createProxyMiddleware({
    target: "https://ipinfo.io",
    changeOrigin: true,
  })
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
