import { HmpactBuildInfo } from "@hmpact/devtools/build-info";
import { Command } from "commander";

export function registerBuildInfoCommand(): Command {
  const buildInfoCmd = new Command("build-info").description(
    "Display build information",
  );

  buildInfoCmd.action(() => {
    console.log(`> Build info data
Version: ${HmpactBuildInfo.version}
Build ID: ${HmpactBuildInfo.buildId}
Commit: ${HmpactBuildInfo.commit}
Branch: ${HmpactBuildInfo.branch}
Timestamp: ${HmpactBuildInfo.timestamp}\n`);
  });

  return buildInfoCmd;
}
