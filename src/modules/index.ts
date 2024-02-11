import HappyClient from "../client";

export default abstract class Module {
  protected client: HappyClient;
  constructor(client: HappyClient) {
    this.client = client;
  }

  abstract load(): void;
}