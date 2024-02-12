import crypto from "crypto";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";
import Queue from "../modules/music/queue";
import YoutubeModule from "../modules/music/youtube";
import { Message } from "discord.js";

export default class P extends Command {
  prefix = '!p';
  description = 'Add a song to the queue and play it. Usage: !p <song name>';

  constructor(
    public readonly client: HappyClient,
    private readonly youtube: YoutubeModule,
    private readonly queue: Queue,
    private readonly player: Player
    ) {
    super(client);
  }

  async execute(message: Message) {
    if (!message.member) return 

    const voiceChannel = message.member.voice.channel;
    const notInChannel = !voiceChannel;
    const isInDifferentChannel = this.client.connection?.joinConfig.channelId !== voiceChannel?.id;
    

    if (notInChannel || isInDifferentChannel) {
      return message.reply(
        "I'm already playing music in a different voice channel! Please join the same voice channel as me to add a song to the queue."
      );
    }
    
    // !p gossip maneskin
    // ['!p ', 'gossip maneskin']
    const [, songName] = message.content.split("!p ");
  
    const connection = this.client.joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
  
    this.player.connect(connection);
  
    const youtubeSearch = await this.youtube.search(songName);
    
    const song = {
      title: youtubeSearch.title ?? 'Unknown',
      url: youtubeSearch.url,
      requestedBy: message.author.id,
      fileName: crypto.randomUUID()
    }
  
    await this.youtube.download(song);
  
    this.queue.add(song);

    this.player.play();
  }
}