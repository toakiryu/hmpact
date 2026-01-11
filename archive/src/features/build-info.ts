import helper from "@/utils/helper";
import { Command } from "commander";

export function registerBuildInfoCommand(): Command {
  const buildInfoCmd = new Command("build-info").description(
    "Display build information",
  );

  buildInfoCmd.action(async () => {
    const data = await helper.buildInfo.load();
    if (!data) {
      console.log("No build info available.");
      return;
    }
    console.log(`> Build info data
Name: ${data.name}
Version: ${data.version}
Build ID: ${data.buildId}
Commit: ${data.commit}
Branch: ${data.branch}
Timestamp: ${data.timestamp}\n`);
  });

  return buildInfoCmd;
}
