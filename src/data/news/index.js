import news from "./chunk-0003.json" with { type: "json" };

export const NEWS_HISTORY_LIMIT = 100;

// The production history is a rolling window. Scheduled updates replace this
// file with the newest <=100 records after appending the daily batch.
export default news.slice(-NEWS_HISTORY_LIMIT);
