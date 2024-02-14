import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";

export default class Stop extends Command {
  prefix = "!stop";
  description = "Stop the music and remove the bot from the channel.";

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return;

    const notInChannel = !message.member.voice.channel;
    const isInDifferentChannel = !this.connectionManager.isInSameChannel(message);
    const connection = this.connectionManager.getConnection(message);

    if (notInChannel || isInDifferentChannel || !connection) {
      return message.reply("You need to be in the same voice channel as the bot to stop the music!");
    }

    this.connectionManager.disconnect(message.guildId as string);
  }
}
