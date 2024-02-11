import { Client, GatewayIntentBits } from 'discord.js';
import { NoSubscriberBehavior, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import * as YoutubeSR from 'youtube-sr'
import fs from 'fs'

const YoutubeSearch = YoutubeSR.YouTube;

const client = new Client({ intents: [
  Object.keys(GatewayIntentBits)
] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.on('messageCreate', async (message) => {
  console.log('New message:', message.content);
  if (!message.content.startsWith('!p')) return;

  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply('You need to be in a voice channel to play music!');
  }

  // !p gossip maneskin
  // ['!p ', 'gossip maneskin']
  const [, songName] = message.content.split('!p ');

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });

  const search = await YoutubeSearch.searchOne(songName, 'video', true);

  message.reply(`Playing ${search.title}! as requested by ${message.author.username}`);

  // TODO: implement fail logic using fuzzy search

  ytdl(search.url, { filter: 'audioonly', quality: 'highestaudio' })
    .pipe(fs.createWriteStream('./song.mp3'))
    .on('finish', () => {

      const resource = createAudioResource('song.mp3', {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });
      resource.volume.setVolume(0.2);
    
      player.play(resource);
      connection.subscribe(player);
    });

});

client.login(process.env.BOT_TOKEN);