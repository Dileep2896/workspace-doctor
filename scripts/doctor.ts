import { runCli } from "../src/lib/cli";

process.exitCode = runCli(process.argv.slice(2), (s) => process.stdout.write(s));
