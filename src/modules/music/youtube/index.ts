import {
  NoSubscriberBehavior,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import Module from "../..";
import HappyClient from "../../../client";
import * as YoutubeSR from "youtube-sr";
import ytdl from "ytdl-core";
import fs from 'fs'

export default class YoutubeModule extends Module {
  youtubeSearch: typeof YoutubeSR.YouTube;

  constructor(client: HappyClient) {
    super(client);

    this.youtubeSearch = YoutubeSR.YouTube;
  }

  load() {
    this.client.on("messageCreate", async (message) => {
      console.log("New message:", message.content);
      if (
        // Message is not a music command
        !message.content.startsWith("!p ") ||
        // Message is from a bot
        message.author.bot ||
        // Message is not from a guild (server)
        !message.guild ||
        // Message is not from a member
        !message.member
      ) {
        return;
      }

      const voiceChannel = message.member.voice.channel;

      if (!voiceChannel) {
        return message.reply(
          "You need to be in a voice channel to play music!"
        );
      }

      // !p gossip maneskin
      // ['!p ', 'gossip maneskin']
      const [, songName] = message.content.split("!p ");

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Stop,
        },
      });

      const search = await this.youtubeSearch.searchOne(
        songName,
        "video",
        true
      );

      message.reply(
        `Playing ${search.title}! as requested by ${message.author.username}`
      );

      ytdl(search.url, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(fs.createWriteStream('./song.mp3'))
      .on('finish', () => {
  
        const resource = createAudioResource('song.mp3', {
          inputType: StreamType.Arbitrary,
          inlineVolume: true
        });
        resource.volume?.setVolume(0.2);
      
        player.play(resource);
        connection.subscribe(player);
      });
    });
  }
}
