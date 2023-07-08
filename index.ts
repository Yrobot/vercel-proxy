import express, { Express, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { ClientRequest } from "http";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT ?? 3003;

app.use(
  cors({
    origin: "*",
  })
);

// target source: 1. headers.proxy 2. urlQuery.proxy
const getTarget = (req: Request): string => {
  const target = req?.headers?.proxy ?? req?.query?.proxy;
  if (!target) throw new Error("No proxy target provided");
  return `${target}`;
};

const BLOCK_HEADER_KEYS: (string | RegExp)[] = [
  // "host",
  "proxy",
  "referer",
  "origin",
  "user-agent",
  /^sec-/g,
];

const removeHeaders = (proxyReq: ClientRequest): void => {
  Object.keys(proxyReq.getHeaders() || {}).forEach((key) => {
    if (
      BLOCK_HEADER_KEYS.find((rule) =>
        typeof rule === "string" ? rule === key : rule.test(key)
      ) !== undefined
    ) {
      proxyReq.removeHeader(key);
    }
  });
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction = () => {}
) => {
  console.error(err.message);
  res.status(400).send(`Error: ${err.message}`);
};

const proxyMiddleware = createProxyMiddleware({
  changeOrigin: true,
  router: async (req) => getTarget(req),
  onProxyReq: (proxyReq, req, res) => {
    removeHeaders(proxyReq);
    // console.log(proxyReq.getHeaders());
  },
  onError: (err, req, res, target = "") => {
    const targetUrl: string =
      typeof target === "object" ? (target?.href as string) : target;
    errorHandler(
      new Error(`Proxy fail: ${err.message} [${targetUrl}]`),
      req,
      res
    );
  },
});

app.use(proxyMiddleware);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
