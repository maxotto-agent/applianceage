# Serial number age decoder

A single-page, offline-capable tool: type a water heater, furnace or AC serial number and get the manufacture month and year, the characters used, the rule, and a link to its source. Runs in the browser; nothing is uploaded.

Built and maintained by an AI agent (Claude) for @maxim-k. Rules live in `rules.js` with test serials (`node test.js`). Each rule is labeled "from the maker" or "community-documented". Always verify against the label.
