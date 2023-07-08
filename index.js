"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
var corsWhiteList = (_d = (_c = (_b = process.env) === null || _b === void 0 ? void 0 : _b.CORS) === null || _c === void 0 ? void 0 : _c.split(",")) !== null && _d !== void 0 ? _d : [];
app.use((0, cors_1.default)({
    origin: (origin = "", callback) => {
        if (corsWhiteList.length === 0) {
            callback(null, true);
        }
        else if (corsWhiteList.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Origin Not allowed by CORS"));
        }
    },
}));
// target source: 1. headers.proxy 2. urlQuery.proxy
const getTarget = (req, onError = () => {
    throw new Error("No proxy target provided");
}) => {
    var _a, _b, _c, _d;
    const target = (_d = (_b = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.proxy) !== null && _b !== void 0 ? _b : (_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.proxy) !== null && _d !== void 0 ? _d : "";
    if (!target)
        onError === null || onError === void 0 ? void 0 : onError();
    return `${target}`;
};
app.use((0, morgan_1.default)(function (tokens, req, res) {
    return [
        `[Log]:`,
        req.headers["origin"],
        getTarget(req, null),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens["response-time"](req, res) + "ms", // response time
    ]
        .map((v) => v || "NULL")
        .join(" ");
}));
app.use((req, res, next) => {
    if (req.method === "GET" && !getTarget(req, null)) {
        res.status(200).send("Hello Vercel-Proxy🚀🚀🚀");
    }
    else {
        next();
    }
});
const BLOCK_HEADER_KEYS = [
    // "host",
    "proxy",
    "referer",
    "origin",
    "user-agent",
    /^sec-/g,
];
const removeHeaders = (proxyReq) => {
    Object.keys(proxyReq.getHeaders() || {}).forEach((key) => {
        if (BLOCK_HEADER_KEYS.find((rule) => typeof rule === "string" ? rule === key : rule.test(key)) !== undefined) {
            proxyReq.removeHeader(key);
        }
    });
};
const errorHandler = (err, req, res, next = () => { }) => {
    console.error("[Error]: ", err.message);
    res.status(400).send(`Error: ${err.message}`);
};
const proxyMiddleware = (0, http_proxy_middleware_1.createProxyMiddleware)({
    changeOrigin: true,
    router: (req) => __awaiter(void 0, void 0, void 0, function* () { return getTarget(req); }),
    onProxyReq: (proxyReq, req, res) => {
        removeHeaders(proxyReq);
        // console.log(proxyReq.getHeaders());
    },
    onError: (err, req, res, target = "") => {
        const targetUrl = typeof target === "object" ? target === null || target === void 0 ? void 0 : target.href : target;
        errorHandler(new Error(`Proxy fail: ${err.message} -> ${targetUrl}`), req, res);
    },
});
app.use(proxyMiddleware);
app.use(errorHandler);
app.listen(port, () => {
    console.log(`[Server]: Proxy Server is running at http://localhost:${port}`);
});
module.exports = app;
