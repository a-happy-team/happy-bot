run:
	docker run -it --rm -v $(PWD):/app -p 3000:3000 sh -c "bash" discord-bot:latest

dev:
	docker run -it --rm -v .:/app -p 3000:3000 discord-bot:latest bash

run-dev:
	docker run -it --rm -v .:/app -p 3000:3000 discord-bot:latest bash -c "npm run dev"

build:
	docker build -t discord-bot:latest .

start:
	docker run -d --name happy-bot --env-file=.env --restart unless-stopped discord-bot:latest