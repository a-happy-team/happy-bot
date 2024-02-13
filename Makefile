run:
	docker run -it --rm -v $(PWD):/app -p 3000:3000 sh -c "bash" discord-bot:latest

dev:
	docker run -it --rm -v .:/app -p 3000:3000 discord-bot:latest bash

run-dev:
	docker run -it --name happy-bot -v .:/app -p 3000:3000 --restart unless-stopped discord-bot:latest bash -c "npm run dev"