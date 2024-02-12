import HappyClient from "./client";
import Player from "./modules/music/player";
import Queue from "./modules/music/queue";
import YoutubeModule from "./modules/music/youtube";
import dotenv from "dotenv";
import crypto from 'crypto';

dotenv.config();

const client = new HappyClient();
const youtube = new YoutubeModule(client);
const queue = new Queue();
const player = new Player(queue);

client.on('messageCreate', async (message) => {
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

  const connection = client.joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  player.connect(connection);

  const youtubeSearch = await youtube.search(songName);
  
  const song = {
    title: youtubeSearch.title ?? 'Unknown',
    url: youtubeSearch.url,
    requestedBy: message.author.id,
    fileName: crypto.randomUUID()
  }

  await youtube.download(song);

  queue.add(song);

  console.log('Current song:', queue.currentSong?.title);
  console.table(queue.songs);

  player.play();
})


client.login();