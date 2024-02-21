import HappyClient from "./client";
import Command from "./commands";
import Clear from "./commands/clear";
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
import { db } from "./services/database/connection";
import SongRepository from "./services/database/repositories/song.repository";

const main = async () => {
  try {
    const client = new HappyClient();
    const spotify = new SpotifyClient(
      process.env.SPOTIFY_CLIENT_ID as string,
      process.env.SPOTIFY_CLIENT_SECRET as string,
    );
    const songRepository = new SongRepository(db);
    const youtube = new YoutubeSource(songRepository, spotify);

    const connectionManager = ConnectionManager.getInstance(youtube, spotify, db);

    const commands: Command[] = [
      new P(connectionManager),
      new Skip(connectionManager),
      new Pause(connectionManager),
      new Resume(connectionManager),
      new QueueCommand(connectionManager),
      new Help(),
      new Clear(connectionManager),
      new Stop(connectionManager),
    ];

    commands.forEach((command) => client.addCommand(command));

    client.login();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

main();
