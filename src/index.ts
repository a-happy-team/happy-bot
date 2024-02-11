import HappyClient from "./client";
import YoutubeModule from "./modules/music/youtube";
import dotenv from "dotenv";

dotenv.config();

const client = new HappyClient();

client.addModule(YoutubeModule);

client.login();