import fs from "node:fs";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
fs.mkdirSync("output", { recursive: true });
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const components = await server.ssrLoadModule(
  "/src/components/Illustrations.jsx",
);
const names = [
  "SensorFloorBrief",
  "EquipmentIllustration",
  "OperationsIllustration",
  "PortfolioIllustration",
  "BriefIllustration",
];
const html = renderToStaticMarkup(
  React.createElement(
    "main",
    null,
    names.map((key) =>
      React.createElement(
        "section",
        { key },
        React.createElement("h2", null, key),
        React.createElement(components[key], { animate: false }),
      ),
    ),
  ),
);
fs.writeFileSync(
  "output/illustrations-qa.html",
  `<!doctype html><html><meta charset="UTF-8"><style>body{background:#f5f2eb;margin:25px;font:14px Arial;color:#5a4232}main{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}section{border:1px solid #ddd3c5;padding:15px}section:first-child{grid-column:span 4;width:620px;justify-self:center}h2{font-size:11px;font-weight:normal}${fs.readFileSync("src/styles/illustrations.css", "utf8")}</style>${html}</html>`,
);
await server.close();
