import { Message } from "discord.js";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";

export default class Pause extends Command {
  prefix = '!pause';
  description = 'Pause the current song. Usage: !pause';

  constructor(
    public readonly client: HappyClient,
    private readonly player: Player
    ) {
    super();
  }

  async execute (message: Message) {
    if (!message.member) return

    const voiceChannel = message.member.voice.channel;
    const isInDifferentChannel = this.client.connection?.joinConfig.channelId !== voiceChannel?.id;

    if (isInDifferentChannel) {
      return message.reply(
        "You need to be in the same voice channel as me to pause the song."
      );
    }

    this.player.pause();
  }
}