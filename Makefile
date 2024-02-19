run:
	docker run -it --rm -v $(PWD):/app sh -c "bash" discord-bot:latest

dev:
	docker run -it --rm -v .:/app discord-bot:latest bash

run-dev:
	docker run -it --rm -v .:/app discord-bot:latest bash -c "npm run dev"

build:
	docker build -t discord-bot:latest .

start:
	docker run -d --name happy-bot --env-file=.env --restart unless-stopped discord-bot:latest