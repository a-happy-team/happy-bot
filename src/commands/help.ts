import path from "path";
import { EmbedBuilder, Message } from "discord.js";
import { glob } from "glob";
import Command from ".";

export default class Help extends Command {
  prefix = "!help";
  description = "Shows the help message";

  async execute(message: Message) {
    const commandsPath = `${path.resolve(__dirname)}/*.[jt]s`;

    // Read all files except for index and print it's prefix and description
    const files = await glob(commandsPath, {
      ignore: ["**/index.[jt]s", "**/help.[jt]s"],
    });

    const commands = await Promise.all(
      files.map(async (file) => {
        const command = await import(file);

        return new command.default();
      }),
    );

    let helpMessage = "Here are the available commands:\n\n";

    commands.forEach((command) => {
      helpMessage += `\`${command.prefix}\` - ${command.description}\n\n`;
    });

    const embed = new EmbedBuilder().setDescription(helpMessage).setColor("DarkRed");

    return message.channel.send({ embeds: [embed] });
  }
}
