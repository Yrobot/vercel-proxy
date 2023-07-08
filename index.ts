import express, { Express, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app: Express = express();
const port = process.env.PORT ?? 3003;

const errorHandler = (err: Error, res: Response) => {
  console.error(err.message);
  res.status(400).send(`Error: ${err.message}`);
};

// target source: 1. headers.proxy 2. urlQuery.proxy
const getTarget = (req: Request): string => {
  const target = req?.headers?.proxy ?? req?.query?.proxy;
  if (!target) throw new Error("No proxy target provided");
  return `${target}`;
};

app.use(function (req: Request, res: Response, next) {
  try {
    const target = getTarget(req); // dynamic target solution2: https://github.com/chimurai/http-proxy-middleware#router-objectfunction
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // console.log(proxyReq.getHeaders());
      },
      onError: (err, req, res, target) => {
        errorHandler(
          new Error(
            `Proxy ${
              typeof target === "object" ? target?.href : target
            } Fail: ${err.message}`
          ),
          res
        );
      },
    })(req, res, next);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
