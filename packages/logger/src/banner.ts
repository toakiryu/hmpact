import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";

export const HmpactBanner = (label = "> Hmpact", version = "0.0.0") => {
  console.log(
    "\n" +
      gradient(["#26b02b", "#53ed59"]).multiline(
        figlet.textSync(label, {
          font: "ANSI Shadow",
          horizontalLayout: "default",
          verticalLayout: "default",
        }),
      ),
  );
  console.log(chalk.gray(`v${version}\n`));
};
