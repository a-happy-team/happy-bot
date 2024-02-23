import path from "path";
import { Message } from "discord.js";
import { glob } from "glob";
import Command from ".";
import MessagesBank from "../services/message/message-embedder";

export default class Commands extends Command {
  name = "!commands";
  description = "Shows all available commands";

  async execute(message: Message) {
    const commandsPath = `${path.resolve(__dirname)}/*.[jt]s`;

    // Read all files except for index and print it's prefix and description
    const files = await glob(commandsPath, {
      ignore: ["**/index.[jt]s", "**/commands.[jt]s"],
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

    return message.channel.send({ embeds: [MessagesBank.simple(helpMessage)] });
  }
}
