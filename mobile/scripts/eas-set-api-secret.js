/**
 * Set EXPO_PUBLIC_TRUSTPAY_API_URL on EAS (production / preview / development).
 * Uses `eas env:create` with visibility `sensitive` (required for EXPO_PUBLIC_* — not `secret`).
 *
 * If a variable already exists as the wrong type, we delete then recreate.
 *
 * Usage (PowerShell):
 *   $env:TRUSTPAY_API_URL="https://api.your-domain.com"
 *   npm run eas:secret:set-api
 */
const { spawnSync } = require("child_process");
const path = require("path");

const url = (process.env.TRUSTPAY_API_URL || "").trim();
if (!url || !/^https:\/\//i.test(url)) {
  console.error(
    "Set TRUSTPAY_API_URL to your public HTTPS API origin (no trailing slash). Example:",
  );
  console.error(
    '  PowerShell:  $env:TRUSTPAY_API_URL="https://your-api.railway.app"; npm run eas:secret:set-api',
  );
  console.error(
    "  bash:        TRUSTPAY_API_URL=https://your-api.example.com npm run eas:secret:set-api",
  );
  process.exit(1);
}

const mobileRoot = path.resolve(__dirname, "..");
const environments = ["production", "preview", "development"];

function runEas(argv) {
  return spawnSync("npx", ["eas-cli", ...argv], {
    stdio: "inherit",
    shell: true,
    cwd: mobileRoot,
  });
}

for (const envName of environments) {
  console.error(`\n==> Remove existing ${envName} (ok if none)\n`);
  runEas([
    "env:delete",
    envName,
    "--variable-name",
    "EXPO_PUBLIC_TRUSTPAY_API_URL",
    "--non-interactive",
  ]);

  console.error(`\n==> EAS env:create ${envName}\n`);
  const r = runEas([
    "env:create",
    envName,
    "--name",
    "EXPO_PUBLIC_TRUSTPAY_API_URL",
    "--value",
    url,
    "--type",
    "string",
    "--visibility",
    "sensitive",
    "--scope",
    "project",
    "--force",
    "--non-interactive",
  ]);
  if (r.status !== 0) {
    process.exit(r.status === null ? 1 : r.status);
  }
}

console.error("\nDone. Start a new EAS build so the URL is embedded.\n");
