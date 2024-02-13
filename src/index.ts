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
import ConnectionManager from "./connection-manager";
import Player from "./modules/music/player";
import Queue from "./modules/music/queue";
import SpotifyClient from "./modules/music/spotify";
import YoutubeSource from "./modules/music/youtube";

const main = async () => {
  try {
    dotenv.config();

    const client = new HappyClient();
    const youtube = new YoutubeSource();
    const spotify = new SpotifyClient(process.env.SPOTIFY_CLIENT_ID as string, process.env.SPOTIFY_CLIENT_SECRET as string);
    const queue = new Queue();
    const player = new Player(queue, youtube);
    
    const connectionManager = new ConnectionManager(youtube, spotify);
    
    const commands: Command[] = [
      new P(connectionManager),
      new Skip(connectionManager),
      new Pause(connectionManager),
      new Resume(connectionManager),
      new QueueCommand(connectionManager),
      new Help(),
      new Clear(connectionManager),
    ];
    
    commands.forEach((command) => client.addCommand(command));
    
    client.login();
    
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

main();
