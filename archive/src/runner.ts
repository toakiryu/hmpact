import { program } from "commander";

import { hmpactrc } from "~/src/config";
import { createRegistryCommand } from "@/features/registry";
import helper from "@/utils/helper";
import { HmpactBanner } from "@hmpact/logger";
import { registerBuildInfoCommand } from "./features/build-info";
import { createUserConfigCommand } from "./features/user-config";

// バナー表示
await HmpactBanner("> Hmpact", hmpactrc.version);

// 言語パックの初期化
await helper.lang.init();
await helper.userConfig.get();

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
program.addCommand(createRegistryCommand());

// 引数がない場合はヘルプを表示
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

await program.parseAsync(process.argv);
