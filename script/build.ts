import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, cp, writeFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });
  await rm(".vercel/output", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  // Build server for local development (npm start)
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // === Vercel Build Output API v3 ===
  console.log("building Vercel output...");

  // Create output structure
  await mkdir(".vercel/output/static", { recursive: true });
  await mkdir(".vercel/output/functions/api.func", { recursive: true });

  // Copy static files from Vite build
  await cp("dist/public", ".vercel/output/static", { recursive: true });

  // Bundle the Vercel serverless function
  // This bundles src/index.ts with ALL its dependencies into one file
  await esbuild({
    entryPoints: ["src/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: ".vercel/output/functions/api.func/index.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    // Bundle everything - no externals for serverless
    logLevel: "info",
  });

  // Write function runtime config
  await writeFile(
    ".vercel/output/functions/api.func/.vc-config.json",
    JSON.stringify(
      {
        runtime: "nodejs20.x",
        handler: "index.js",
        launcherType: "Nodejs",
      },
      null,
      2
    )
  );

  // Write Vercel output config with routing
  await writeFile(
    ".vercel/output/config.json",
    JSON.stringify(
      {
        version: 3,
        routes: [
          { handle: "filesystem" },
          { src: "/api/(.*)", dest: "/api" },
          { src: "/(.*)", dest: "/index.html" },
        ],
      },
      null,
      2
    )
  );

  console.log("Vercel output ready at .vercel/output/");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
