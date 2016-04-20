REPORTER = dot

test:
	@NODE_ENV=test mocha \
	--reporter $(REPORTER) \
	--ui tdd

test-w:
	@NODE_ENV=test mocha \
	--reporter $(REPORTER) \
	--growl \
	--ui tdd \
	--watch

.PHONY: test test-w
