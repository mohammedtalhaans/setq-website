import { createServer } from "vite";
import { renderToString } from "react-dom/server";
import React from "react";
import fs from "node:fs/promises";

// The marketing content is present in the shipped HTML before JavaScript runs.
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const content = renderToString(React.createElement(App));
  const filename = "dist/index.html";
  let html = await fs.readFile(filename, "utf8");
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`,
  );
  // React renders Suspense fallback explanatory templates for unrendered WebGL modules.
  html = html.replace(/<template\b[\s\S]*?<\/template>/g, "");
  if (process.env.SETQ_PUBLIC_URL) {
    const configured = new URL(process.env.SETQ_PUBLIC_URL);
    const base = configured.href.endsWith("/")
      ? configured.href
      : configured.href + "/";
    html = html.replaceAll("https://setq.com.au/", base);
  }
  await fs.writeFile(filename, html);
  console.log("Prerendered SetQ marketing content into dist/index.html");
} finally {
  await server.close();
}
