import chalk from "chalk";
import { program } from "commander";
import figlet from "figlet";
import gradient from "gradient-string";

import { hmpactrc } from "~/src/config";
import { createRegistryCommand } from "@/features/registry";
import helper from "@/utils/helper";

// バナー表示
console.log(
  "\n" +
    gradient(["#26b02b", "#53ed59"]).multiline(
      figlet.textSync("> hmpact", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
        verticalLayout: "default",
      }),
    ),
);
console.log(chalk.gray(`v${hmpactrc.version}\n`));

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

// build-info コマンドの定義
program
  .command("build-info")
  .description("Display build information")
  .action(async () => {
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

// test コマンドの定義
program
  .command("test")
  .description("Display the resolved configuration data")
  .action(async () => {
    const configData = await helper.manifest.loadFile();
    console.log("Config file data:", configData);
  });

program.addCommand(createRegistryCommand());

// 引数がない場合はヘルプを表示
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

await program.parseAsync(process.argv);
