#!/usr/bin/env node
/**
 * Seeded Fault Mirror Server
 * Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
 *
 * Starts an Express server on port 3001 that proxies http://books.toscrape.com
 * and injects configurable seeded faults into HTML responses.
 *
 * Usage:
 *   node scripts/seed-faults.js                          # pass-through (no faults)
 *   FAULT_01=true node scripts/seed-faults.js            # one fault
 *   FAULT_01=true FAULT_02=true ... node scripts/seed-faults.js
 *
 * Faults:
 *   FAULT-01  Swap the price of the first two books on the homepage
 *   FAULT-02  Change all "In stock" availability text to "Out of stock"
 *   FAULT-03  Remove all star-rating elements (class="star-rating")
 *   FAULT-04  Break the "next" pagination link (set href to "#")
 *   FAULT-05  Change the h1 title of category pages to "ERROR"
 */

'use strict';

const express = require('express');
const http = require('http');
const url = require('url');

const PORT = 3001;
const TARGET_HOST = 'books.toscrape.com';
const TARGET_PORT = 80;

const FAULTS = {
  FAULT_01: process.env.FAULT_01 === 'true',
  FAULT_02: process.env.FAULT_02 === 'true',
  FAULT_03: process.env.FAULT_03 === 'true',
  FAULT_04: process.env.FAULT_04 === 'true',
  FAULT_05: process.env.FAULT_05 === 'true',
};

const FAULT_DESCRIPTIONS = {
  FAULT_01: 'Swap the price of the first two books on the homepage',
  FAULT_02: 'Change all "In stock" text to "Out of stock"',
  FAULT_03: 'Remove all star-rating elements',
  FAULT_04: 'Break the "next" pagination link (href="#")',
  FAULT_05: 'Change category page h1 title to "ERROR"',
};

const activeFaults = Object.entries(FAULTS).filter(([, v]) => v).map(([k]) => k);

console.log('=== Seeded Fault Mirror Server ===');
console.log(`Proxying: http://${TARGET_HOST} → http://localhost:${PORT}`);
if (activeFaults.length === 0) {
  console.log('Active faults: NONE (pass-through mode)');
} else {
  console.log(`Active faults (${activeFaults.length}):`);
  for (const f of activeFaults) {
    console.log(`  [${f}] ${FAULT_DESCRIPTIONS[f]}`);
  }
}
console.log('==================================\n');

/**
 * Apply the active seeded faults to an HTML string.
 * @param {string} html
 * @param {string} pathname  request path (used to scope FAULT-05)
 * @returns {string}
 */
function injectFaults(html, pathname) {
  let out = html;

  // FAULT-01: Swap the price of the first two books on the homepage
  if (FAULTS.FAULT_01) {
    const isHomepage =
      pathname === '/' ||
      pathname === '/index.html' ||
      /^\/catalogue\/page-\d+\.html$/.test(pathname);

    if (isHomepage) {
      const priceRe = /(<p class="price_color">)(£[\d.]+)(<\/p>)/g;
      const found = [];
      let m;
      while ((m = priceRe.exec(out)) !== null) {
        found.push({ start: m.index, end: m.index + m[0].length, price: m[2] });
        if (found.length === 2) break;
      }
      if (found.length === 2) {
        out =
          out.slice(0, found[0].start) +
          `<p class="price_color">${found[1].price}</p>` +
          out.slice(found[0].end, found[1].start) +
          `<p class="price_color">${found[0].price}</p>` +
          out.slice(found[1].end);
      }
    }
  }

  // FAULT-02: Replace "In stock" with "Out of stock"
  if (FAULTS.FAULT_02) {
    out = out.replace(/In stock/g, 'Out of stock');
  }

  // FAULT-03: Remove star-rating <p> elements
  if (FAULTS.FAULT_03) {
    // Handles both self-closing and content variants:
    //   <p class="star-rating Three"></p>
    //   <p class="star-rating Three"/>
    out = out.replace(/<p class="star-rating [^"]*"\s*(?:\/>|>[^<]*<\/p>)/g, '');
  }

  // FAULT-04: Break the "next" pagination link
  if (FAULTS.FAULT_04) {
    out = out.replace(
      /(<li class="next"><a\s+href=")[^"]*(")/g,
      '$1#$2'
    );
  }

  // FAULT-05: Change h1 title on category pages to "ERROR"
  if (FAULTS.FAULT_05) {
    const isCategoryPage = pathname.includes('/catalogue/category/');
    if (isCategoryPage) {
      out = out.replace(/<h1>[^<]*<\/h1>/g, '<h1>ERROR</h1>');
    }
  }

  return out;
}

/**
 * Proxy a request to the target site, optionally manipulating HTML.
 */
function proxyRequest(req, res) {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET_HOST,
      // Prevent gzip so we can read and modify the response body as plain text
      'accept-encoding': 'identity',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const contentType = proxyRes.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      const chunks = [];
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        let body = Buffer.concat(chunks).toString('utf8');
        body = injectFaults(body, req.path || '/');

        const headers = { ...proxyRes.headers };
        delete headers['content-encoding'];
        headers['content-length'] = Buffer.byteLength(body, 'utf8').toString();

        res.writeHead(proxyRes.statusCode, headers);
        res.end(body);
      });
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    console.error(`[proxy error] ${req.url}: ${err.message}`);
    if (!res.headersSent) {
      res.status(502).send(`Proxy error: ${err.message}`);
    } else {
      res.destroy();
    }
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

const app = express();

// Route all requests through the proxy
app.use((req, res) => proxyRequest(req, res));

app.listen(PORT, () => {
  console.log(`Fault mirror server listening at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.\n');
});
