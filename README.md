# Vercel-Proxy 🚀🚀🚀

A simple proxy for Vercel to bypass CORS restrictions.

## Usage

for example, you want to access `https://target.com/path`(the origin url which you want to call, $ProxyHost/path ) with proxy `https://proxy.vercel.com`(the url where you serve the Vercel-Proxy, $Host )

### 1. curl $Host/path?proxy=$ProxyHost

`curl https://proxy.vercel.com/path?proxy=https://target.com`

### 2. curl --header "Proxy: $ProxyHost" $Host/path

`curl --header "Proxy: https://target.com" https://proxy.vercel.com/path`

## Dev Example

launch the proxy server locally at `http://localhost:3003`, and try

`curl --header "Proxy: https://ipinfo.io" http://localhost:3003/161.186.160.93/geo`

OR

`curl http://localhost:3003/161.186.160.93/geo\?proxy\=https://ipinfo.io`

if you receive this json data, which means the proxy works.

```json
{
  "ip": "161.186.160.93",
  "city": "Washington",
  "region": "Washington, D.C.",
  "country": "US",
  "loc": "38.8951,-77.0364",
  "postal": "20068",
  "timezone": "America/New_York",
  "readme": "https://ipinfo.io/missingauth"
}
```
