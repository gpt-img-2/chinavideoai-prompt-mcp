#!/usr/bin/env node

import("../dist/index.js").catch((error) => {
  console.error("China Video AI Prompt MCP failed to start:", error);
  process.exit(1);
});
