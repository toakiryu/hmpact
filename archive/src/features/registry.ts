import { logger } from "@hmpact/logger";
import { Command } from "commander";

import helper from "@/utils/helper";

/**
 * summary: パッケージレジストリの管理コマンドを提供する
 * description: このモジュールは、パッケージレジストリの追加、削除、インポートを行うためのCLIコマンドを定義します。ユーザーはドメイン、ID、URLフォーマットルール、HTTPヘッダーを指定してレジストリを管理できます。
 */

export function createRegistryCommand(): Command {
  const registryCmd = new Command("registry")
    .alias("reg")
    .description("Generate package registry URL based on predefined rules");

  registryCmd
    .command("add")
    .requiredOption("--domain <domain>", "Domain of the registry")
    .option("--id <id>", "ID of the registry")
    .option(
      "--format <format>",
      "URL format rule (use {pkg}, {ver}, {:env.KEY})",
    )
    .option(
      "--header <header>",
      "HTTP header for the registry request (use key:value format)",
    )
    .description("Add a new registry entry")
    .action(async (opts) => {
      const { domain, id, format } = opts;
      await helper.registry.add(domain, id, format).catch((e) => {
        logger.error(
          `Error adding registry: ${e instanceof Error ? e.message : String(e)}`,
        );
      });
    });

  registryCmd
    .command("remove <id>")
    .description("Remove a registry entry")
    .action(async (id: string) => {
      await helper.registry.remove(id).catch((e) => {
        logger.error(
          `Error removing registry: ${e instanceof Error ? e.message : String(e)}`,
        );
      });
    });

  registryCmd
    .command("import <url>")
    .description("Import registry entries from a remote JSONC file")
    .action(async (url: string) => {
      await helper.registry.import(url).catch((e) => {
        logger.error(
          `Error importing registries: ${e instanceof Error ? e.message : String(e)}`,
        );
      });
    });

  return registryCmd;
}
