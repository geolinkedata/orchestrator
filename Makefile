REPORTER = dot

test:
	@NODE_ENV=test /usr/bin/mocha \
	--reporter $(REPORTER) \
	--ui tdd

test-w:
	@NODE_ENV=test /usr/bin/mocha \
	--reporter $(REPORTER) \
	--growl \
	--ui tdd \
	--watch

.PHONY: test test-w
