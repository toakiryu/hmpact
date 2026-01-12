import { HmpactBanner, logger } from "@hmpact/logger";
import { hpath } from "@hmpact/path";
import { program } from "commander";

import { hmpactrc } from "~/src/config";
import { registerBuildInfoCommand } from "@/features/build-info";
import { createUserConfigCommand } from "@/features/user-config";
import helper from "@/utils/helper";

// バナー表示
await HmpactBanner("> Hmpact", hmpactrc.version);

logger.info({
  user: hpath.homedir.user,
  hmpact: hpath.homedir.hmpact,
  cache: hpath.homedir.cache,
});


// コマンドラインインターフェースの設定
program.name("hmpact").description("").version(hmpactrc.version);

// グローバルオプションの設定
program
  .configureHelp({ showGlobalOptions: true })
  .option("-d, --debug", "enable debug mode")
  .option("--lang <language>", "select language pack");

// test コマンドの定義
program
  .command("test")
  .description("Display the resolved configuration data")
  .action(async () => {
    const configData = await helper.manifest.loadFile();
    console.log("Config file data:", configData);
  });

program.addCommand(registerBuildInfoCommand());
program.addCommand(createUserConfigCommand());

// 引数がない場合はヘルプを表示
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

await program.parseAsync(process.argv);
