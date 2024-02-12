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
  
    if (!voiceChannel) {
      return message.reply(
        "You need to be in a voice channel to play music!"
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