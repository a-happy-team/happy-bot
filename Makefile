dev:
	docker run -it --rm -v $(PWD):/app -p 3000:3000 sh -c "bash" discord-bot:latest