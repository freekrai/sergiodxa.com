import { z } from "zod";

const BASE_URL = new URL("https://collectednotes.com/");

const noteVisibility = z.union([
	z.literal("public"),
	z.literal("private"),
	z.literal("public_unlisted"),
	z.literal("public_site"),
]);

const noteSchema = z.object({
	id: z.number(),
	site_id: z.number(),
	user_id: z.number(),
	body: z.string(),
	path: z.string(),
	headline: z.string(),
	title: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	visibility: noteVisibility.default("public"),
	poster: z.string().nullable(),
	curated: z.boolean(),
	ordering: z.number(),
	url: z.string(),
});

export class CollectedNotesService {
	constructor(
		private email: string,
		private token: string,
		private site: string
	) {}

	async getLatestNotes(page = 1) {
		let url = new URL(`sites/${this.site}/notes`, BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("visibility", "public_site");

		let response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		let result = await response.json();

		return noteSchema
			.array()
			.parse(result)
			.map((note) => ({ title: note.title, path: note.path, id: note.id }));
	}

	async searchNotes(page = 1, term = "") {
		let url = new URL(`sites/${this.site}/notes/search`, BASE_URL);

		url.searchParams.set("page", page.toString());
		url.searchParams.set("term", term);
		url.searchParams.set("visibility", "public_site");

		let response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) return [];

		let result = await response.json();

		return noteSchema
			.array()
			.parse(result)
			.map((note) => ({ title: note.title, path: note.path, id: note.id }));
	}

	async getNotes(page = 1, term = "") {
		if (term) return this.searchNotes(page, term);
		return this.getLatestNotes(page);
	}

	async readNote(path: string) {
		let url = new URL(`${this.site}/${path}.json`, BASE_URL);

		let response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				Authorization: `${this.email} ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		let result = await response.json();

		return noteSchema.parse(result);
	}
}
