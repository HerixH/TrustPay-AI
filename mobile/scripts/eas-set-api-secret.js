/**
 * Push EXPO_PUBLIC_TRUSTPAY_API_URL to EAS for cloud builds.
 * Uses `eas env:create` (current API); legacy `secret:create` needs `--type string` in non-interactive mode.
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

/** Matches default EAS environments so production / preview / dev-client builds all resolve the API. */
const environments = ["production", "preview", "development"];

for (const envName of environments) {
  const args = [
    "eas-cli",
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
  ];
  console.error(`\n==> EAS env:create ${envName}\n`);
  const r = spawnSync("npx", args, {
    stdio: "inherit",
    shell: true,
    cwd: mobileRoot,
  });
  if (r.status !== 0) {
    process.exit(r.status === null ? 1 : r.status);
  }
}

console.error("\nDone. Re-run your EAS build so the new URL is baked into the bundle.\n");
