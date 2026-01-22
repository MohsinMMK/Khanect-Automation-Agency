
import Parser from 'rss-parser';
import { parseArgs } from "util";

// Parse arguments
const { values } = parseArgs({
  args: Bun.argv,
  options: {
    url: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!values.url) {
  console.error("Error: --url is required");
  process.exit(1);
}

const parser = new Parser();

async function run() {
  try {
    const feed = await parser.parseURL(values.url);
    // Add source URL to each item for reference
    const items = feed.items.map(item => ({
        ...item,
        source_feed: values.url
    }));
    console.log(JSON.stringify(items, null, 2));
  } catch (error) {
    console.error(`Error fetching RSS feed: ${error}`);
    process.exit(1);
  }
}

run();
