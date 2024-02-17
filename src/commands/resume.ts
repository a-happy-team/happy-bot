import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import MessagesBank from "../services/message/message-embedder";

export default class Resume extends Command {
  prefix = "!resume";
  description = "Resume the current song if it's paused.";

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return;

    const notInChannel = !message.member.voice.channel;
    const isInDifferentChannel = !this.connectionManager.isInSameChannel(message);
    const connection = this.connectionManager.getConnection(message);

    if (notInChannel || isInDifferentChannel || !connection) {
      return message.channel.send({
        embeds: [MessagesBank.error("You need to be in the same voice channel as the bot to resume the song!")],
      });
    }

    connection.player.resume();
  }
}
