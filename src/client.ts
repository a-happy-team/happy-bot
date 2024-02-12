import { Client, GatewayIntentBits, Interaction, Message } from "discord.js";
import Module from "./modules";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import Command from "./commands";

type EventMap = {
  ready: Function[];
  messageCreate: Array<(message: Message) => void>;
}

type Event = keyof EventMap;

type ModuleConstructor = { new (client: HappyClient): Module };

export default class HappyClient {
  client: Client;

  events: EventMap = {
    ready: [],
    messageCreate: []
  }

  modules: Array<ModuleConstructor> = [];

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
      ]
    });
  }

  on<T extends Event>(event: T, callback: EventMap[T][number]) {
    this.events[event].push(callback as any);
  }

  addModule(module: ModuleConstructor) {
    this.modules.push(module);
  }

  addCommand(command: Command) {
    this.on('messageCreate', (message) => {
      const prefix = message.content.split(' ')[0];

      if (prefix === command.prefix) {
        command.execute(message);
      }
    });
  }

  joinVoiceChannel(params: JoinVoiceChannelParams) {
    return joinVoiceChannel(params);
  }

  login() {
    this.loadModules()

    this.client.on('ready', () => {
      this.events.ready.forEach(callback => callback());

      console.log('Bot is ready');  
    });

    this.client.on('messageCreate', (message) => {
      this.events.messageCreate.forEach(callback => callback(message));
    });

    this.client.login(process.env.BOT_TOKEN);
  }

  private loadModules() {
    this.modules.forEach(module => new module(this).load());
  }
}

type JoinVoiceChannelParams = {
  channelId: string;
  guildId: string;
  adapterCreator: DiscordGatewayAdapterCreator;
}