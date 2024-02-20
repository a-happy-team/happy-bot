import { Message } from "discord.js";

export default abstract class Command {
  abstract prefix: string;
  abstract description: string;
  public detailedDescription?: string;

  public abstract execute(message: Message): void;

  public validate(message: Message<boolean>): Promise<boolean> | boolean {
    return true;
  }
}
