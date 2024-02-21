import { Message } from "discord.js";

export default abstract class Command {
  abstract prefix: string;
  abstract description?: string;

  public abstract execute(message: Message): void;

  public validate(message: Message<boolean>): boolean {
    return true;
  }
}
