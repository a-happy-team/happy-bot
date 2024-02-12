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

dotenv.config();

const client = new HappyClient();
const youtube = new YoutubeModule(client);
const queue = new Queue();
const player = new Player(queue);

const commands: Command[] = [
  new P(client, youtube, queue, player),
  new Skip(client, player),
  new Pause(client, player),
  new Resume(client, player),
  new QueueCommand(player, queue)
]

commands.forEach((command) => client.addCommand(command));

client.login();