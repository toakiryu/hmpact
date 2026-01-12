import { Command } from "commander";

export function createUserConfigCommand(): Command {
  const userConfigCmd = new Command("user-config")
    .alias("uc")
    .description("Manage user configuration settings");

  return userConfigCmd;
}
