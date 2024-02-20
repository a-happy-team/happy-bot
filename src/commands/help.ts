import path from "path";
import { Message } from "discord.js";
import { glob, globSync } from "glob";
import Command from ".";
import MessagesBank from "../services/message/message-embedder";

export default class Help extends Command {
  prefix = "!help";
  description = "Shows detailed information about a specific command";

  async execute(message: Message) {
    const commandsPath = `${path.resolve(__dirname)}/*.[jt]s`;

    const files = await glob(commandsPath, {
      ignore: ["**/index.[jt]s", "**/help.[jt]s"],
    });

    const commands: Array<Command> = await Promise.all(
      files.map(async (file) => {
        const command = await import(file);

        return new command.default();
      }),
    );

    const search = message.content.replace(/(!help )|(!help)/, "");

    const command = commands.find((command) => command.prefix.replace("!", "") === search.replace("!", ""));

    if (command) {
      const helpMessage = `**${command.prefix}** - ${command.detailedDescription ?? command.description}`;

      return message.channel.send({ embeds: [MessagesBank.simple(helpMessage)] });
    }

    return message.channel.send({
      embeds: [MessagesBank.error("Command not found.\nFor displaying all available commands, use **!commands**.")],
    });
  }

  async validate(message: Message<boolean>): Promise<boolean> {
    const search = message.content.replace(/(!help )|(!help)/, "");

    if (search.length === 0) {
      message.channel.send({
        embeds: [MessagesBank.error("You must provide a command name to get help.")],
      });

      return false;
    }

    const commandsPath = `${path.resolve(__dirname)}/*.[jt]s`;

    const files = globSync(commandsPath, {
      ignore: ["**/index.[jt]s", "**/help.[jt]s"],
    });

    const commands: Array<Command> = await Promise.all(
      files.map(async (file) => {
        const command = await import(file);

        return new command.default();
      }),
    );

    const command = commands.find((command) => command.prefix.replace("!", "") === search.replace("!", ""));

    if (command) {
      return true;
    }

    message.channel.send({
      embeds: [MessagesBank.simple("Command not found.\nFor displaying all available commands, use **!commands**.")],
    });

    return false;
  }
}
