# Happy

Happy is a Discord Bot that begin as a spare time project to implement a music bot for Discord for `a happy place` server. It has since evolved to include a variety of features.

## How to run

### Prerequisites
- Docker

### Steps

1. Clone the repository

2. Create a `.env` file in the root of the project with the following content:
```env
BOT_TOKEN=<your bot token>
SPOTIFY_CLIENT_ID=<your spotify client id>
SPOTIFY_CLIENT_SECRET=<your spotify client secret>
```
In case you don't have any of these tokens, you can create a bot and get a token from the [Discord Developer Portal](https://discord.com/developers/applications) and you can get the Spotify tokens from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

The permissions required for the bot are:
- `Send Messages`
- `Connect`
- `Speak`

The intentions required for the bot are:
- `Presence Intent`
- `Server Members Intent`
- `Message Content Intent`

3. Run `make build` to build the docker image (if you're on Windows, you can run open the `Makefile` and run the command in the `build` target in the terminal)

4. Run `make run-dev` to run the docker container (if you're on Windows, you can run open the `Makefile` and run the command in the `run-dev` target in the terminal)
