import crypto from "crypto";
import dotenv from "dotenv";
import HappyClient from "./client";
import Command from "./commands";
import Clear from "./commands/clear";
import Help from "./commands/help";
import P from "./commands/p";
import Pause from "./commands/pause";
import QueueCommand from "./commands/queue";
import Resume from "./commands/resume";
import Skip from "./commands/skip";
import Player from "./modules/music/player";
import Queue from "./modules/music/queue";
import SpotifyClient from "./modules/music/spotify";
import YoutubeModule from "./modules/music/youtube";
import YoutubeSource from "./modules/music/youtube";

dotenv.config();

const client = new HappyClient();
const musicSource = new YoutubeSource();
const spotify = new SpotifyClient(process.env.SPOTIFY_CLIENT_ID as string, process.env.SPOTIFY_CLIENT_SECRET as string);
const queue = new Queue();
const player = new Player(queue, musicSource);

const commands: Command[] = [
  new P(client, musicSource, queue, player, spotify),
  new Skip(client, player),
  new Pause(client, player),
  new Resume(client, player),
  new QueueCommand(player, queue),
  new Help(),
  new Clear(player),
];

commands.forEach((command) => client.addCommand(command));

client.login();
