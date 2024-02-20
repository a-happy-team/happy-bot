import HappyClient from "./client";
import Command from "./commands";
import Clear from "./commands/clear";
import Commands from "./commands/commands";
import Help from "./commands/help";
import P from "./commands/p";
import Pause from "./commands/pause";
import QueueCommand from "./commands/queue";
import Resume from "./commands/resume";
import Skip from "./commands/skip";
import Stop from "./commands/stop";
import ConnectionManager from "./connection-manager";
import SpotifyClient from "./modules/music/spotify";
import YoutubeSource from "./modules/music/youtube";

const main = async () => {
  try {
    const client = new HappyClient();
    const youtube = new YoutubeSource();
    const spotify = new SpotifyClient(
      process.env.SPOTIFY_CLIENT_ID as string,
      process.env.SPOTIFY_CLIENT_SECRET as string,
    );

    const connectionManager = new ConnectionManager(youtube, spotify);

    const commands: Command[] = [
      new P(connectionManager),
      new Pause(connectionManager),
      new Resume(connectionManager),
      new Skip(connectionManager),
      new QueueCommand(connectionManager),
      new Help(),
      new Clear(connectionManager),
      new Stop(connectionManager),
      new Commands(),
    ];

    commands.sort((a, b) => a.prefix.localeCompare(b.prefix));

    commands.forEach((command) => client.addCommand(command));

    client.login();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

main();
