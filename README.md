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
DATABASE_URL=
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

3. Cloning Supabase db Scheme:
- Ask the SUPABASE database URL
- ``SUPABASE_URL=databaseUrl npm run db:generate:schema``

4. Run docker
- ``docker compose up -d``
- ``docker compose exec db sh -c "psql -U postgres -d happy_bot < /tmp/schema.sql"``

3.1 Accesing the local database
- Get the containerID running on docker: ``docker ps | grep discord-bot | grep db | awk '{print $1}'``
- ``docker exec -it <container_id> psql -U postgres postgres``
- Connect to the bot db: ``\c happy_bot``
- To list all tables run: ``\dt``
- ``SELECT * FROM <table_name>;`` DO NOT FORGET THE ";"