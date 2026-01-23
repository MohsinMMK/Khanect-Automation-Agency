
import Parser from 'rss-parser';
import { parseArgs } from "util";

const parser = new Parser();

export async function fetchRSS(url: string) {
    try {
        const feed = await parser.parseURL(url);
        // Add source URL to each item for reference
        const items = feed.items.map(item => ({
            ...item,
            source_feed: url
        }));
        return items;
    } catch (error) {
        console.error(`Error fetching RSS feed: ${error}`);
        throw error;
    }
}

// CLI execution
if (import.meta.main) {
    const { values } = parseArgs({
        args: Bun.argv,
        options: {
            url: { type: 'string' },
        },
        strict: true,
        allowPositionals: true,
    });

    if (!values.url) {
        console.error("Error: --url is required");
        process.exit(1);
    }

    fetchRSS(values.url)
        .then(items => console.log(JSON.stringify(items, null, 2)))
        .catch(() => process.exit(1));
}
