import path from "path";
import { Message } from "discord.js";
import Command from ".";
import Player from "../modules/music/player";
import Queue from "../modules/music/queue";

export default class Clear extends Command {
  prefix = "!clear";
  description = "Clear the queue.";

  constructor(private readonly player: Player) {
    super();
  }

  async execute(message: Message) {
    this.player.clearQueue();

    message.reply("The queue has been cleared.");
  }
}
