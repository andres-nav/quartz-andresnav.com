publish:
	@echo "Publishing to andresnav/quartz-andresnav.com"
	@npx quartz sync

test:
	@echo "Running test server"
	@npx quartz build --serve
