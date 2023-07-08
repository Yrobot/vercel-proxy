import express, { Express, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { ClientRequest } from "http";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();
const port = process.env.PORT ?? 3003;
var corsWhiteList: string[] = process.env?.CORS?.split(",") ?? [];

app.use(
  cors({
    origin: (origin = "", callback) => {
      if (corsWhiteList.length === 0) {
        callback(null, true);
      } else if (corsWhiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin Not allowed by CORS"));
      }
    },
  })
);

// target source: 1. headers.proxy 2. urlQuery.proxy
const getTarget = (req: Request): string => {
  const target = req?.headers?.proxy ?? req?.query?.proxy;
  if (!target) throw new Error("No proxy target provided");
  return `${target}`;
};

app.use(
  morgan(function (tokens, req, res) {
    return [
      `[Log]:`,
      req.headers["origin"], // from
      getTarget(req), // to
      tokens.method(req, res), // method
      tokens.url(req, res), // path
      tokens.status(req, res), // status
      tokens["response-time"](req, res) + "ms", // response time
    ]
      .map((v) => v || "NULL")
      .join(" ");
  })
);

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
  console.error("[Error]: ", err.message);
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
      new Error(`Proxy fail: ${err.message} -> ${targetUrl}`),
      req,
      res
    );
  },
});

app.use(proxyMiddleware);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`[Server]: Proxy Server is running at http://localhost:${port}`);
});

module.exports = app;