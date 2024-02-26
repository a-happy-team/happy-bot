import { injectable } from "@a-happy-team/dependo";
import OpenAISDK from "openai";

@injectable({ singleton: true })
export default class OpenAI {
  client: OpenAISDK;

  constructor() {
    this.client = new OpenAISDK({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async isSameSong(title: string, songInfo?: SongInfo | null) {
    if (!songInfo) {
      return false;
    }

    const chat = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "user",
          content: `Answer only with 0 for NO or 1 for YES with no dots. I'll provide a string containing a music title and an object containing song info. I need you to tell me if both info are referring to the same song or no.
            
            ${title}
            ${songInfo ? JSON.stringify(songInfo, null, 2) : ""}
            `,
        },
      ],
    });

    return !!Number(chat.choices[0].message.content);
  }
}

type SongInfo = {
  title: string;
  artist: string;
};
