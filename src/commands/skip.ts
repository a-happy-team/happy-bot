import crypto from "crypto";
import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";

export default class Skip extends Command {
  prefix = "!skip";
  description = "Skip the current song. If there are no songs in the queue, the bot will leave the voice channel.";

  constructor(
    private readonly connectionManager: ConnectionManager
  ) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return;

    const notInChannel = !message.member.voice.channel;
    const isInDifferentChannel = !this.connectionManager.isInSameChannel(message);
    const connection = this.connectionManager.getConnection(message);

    if (notInChannel || isInDifferentChannel || !connection) {
      return message.reply("You need to be in the same voice channel as the bot to skip the song!");
    }

    connection.player.skip();
  }
}
