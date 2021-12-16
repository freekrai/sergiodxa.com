import Airtable, { FieldSet } from "airtable";
import { requireEnv } from "~/utils/environment";

export type Bookmark = FieldSet & {
  title: string;
  url: string;
  createdAt: Date;
};

export async function getBookmarks(limit = 100): Promise<Bookmark[]> {
  const base = new Airtable({
    apiKey: requireEnv("AIRTABLE_API_KEY"),
  }).base(requireEnv("AIRTABLE_BASE"));

  const table = base<Bookmark>("links");

  const records = await table
    .select({
      maxRecords: limit,
      sort: [{ field: "created_at", direction: "desc" }],
    })
    .firstPage();

  return records.map((record) => ({
    title: record.fields.title,
    url: record.fields.url,
    createdAt: new Date(record._rawJson.createdTime),
  }));
}
