import HappyClient from "./client";
import Player from "./modules/music/player";
import Queue from "./modules/music/queue";
import YoutubeModule from "./modules/music/youtube";
import dotenv from "dotenv";
import crypto from 'crypto';
import P from "./commands/p";
import Command from "./commands";
import Skip from "./commands/skip";
import Pause from "./commands/pause";
import Resume from "./commands/resume";
import QueueCommand from "./commands/queue";
import Help from "./commands/help";
import YoutubeSource from "./modules/music/youtube";

dotenv.config();

const client = new HappyClient();
const musicSource = new YoutubeSource();
const queue = new Queue();
const player = new Player(queue);

const commands: Command[] = [
  new P(client, musicSource, queue, player),
  new Skip(client, player),
  new Pause(client, player),
  new Resume(client, player),
  new QueueCommand(player, queue),
  new Help()
]

commands.forEach((command) => client.addCommand(command));

client.login();