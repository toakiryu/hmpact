import { Command } from "commander";
import enquirer from "enquirer";

export function createUserConfigCommand(): Command {
  const ucCmd = new Command("user-config")
    .alias("uc")
    .description("Manage user configuration settings");

  ucCmd
    .command("setting")
    .alias("s")
    .action(async () => {
      const select = await enquirer.prompt({
        type: "autocomplete",
        name: "val",
        message: "Select a setting to configure:",
        choices: ["Language"],
      });
      console.log("Your favorite flavor is:", select);
    });

  return ucCmd;
}
