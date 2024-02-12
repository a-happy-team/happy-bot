import crypto from "crypto";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";
import Queue from "../modules/music/queue";
import YoutubeModule from "../modules/music/youtube";
import { Message } from "discord.js";

export default class Skip extends Command {
  prefix = '!skip';
  description = 'Skip the current song. If there are no songs in the queue, the bot will leave the voice channel.';

  constructor(
    public readonly client: HappyClient,
    private readonly player: Player
    ) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return 

    const voiceChannel = message.member.voice.channel;
    const notInChannel = !voiceChannel;
    const isInDifferentChannel = this.client.connection?.joinConfig.channelId !== voiceChannel?.id;
    
    console.log({
      voiceChannel,
      connection: this.client.connection?.joinConfig,
    })

    if (notInChannel || isInDifferentChannel) {
      return message.reply(
        "You need to be in the same voice channel as the bot to skip the song!"
      );
    }
    
    this.player.skip();
  }
}