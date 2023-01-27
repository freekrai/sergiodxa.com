import { describe, test, vi } from "vitest";

import { GithubRepository } from "~/repositories/github";
import { TutorialsService } from "~/services/tutorials";

let repos = {
	tutorials: {
		list: vi.fn(),
	},
	github: new GithubRepository(process.env.GITHUB_TOKEN!),
};

describe(TutorialsService.name, () => {
	let service = new TutorialsService(repos as unknown as SDX.Repos);

	describe(service.list.name, () => {
		test("should return a list of tutorials", async () => {
			repos.tutorials.list.mockResolvedValueOnce([
				{ name: "foo" },
				{ name: "bar" },
			]);

			await expect(service.list()).resolves.toMatchInlineSnapshot(`
				{
				  "items": [],
				  "page": {
				    "current": 1,
				    "first": 1,
				    "last": 0,
				    "next": null,
				    "prev": null,
				    "size": 1000,
				  },
				  "total": 0,
				}
			`);
		});
	});

	describe(service.read.name, () => {
		test("should return a tutorial", async () => {
			await expect(
				service.read("progressively-enhance-the-usefetcher-hook-in-remix")
			).resolves.toEqual({
				title: "Progressively enhance the useFetcher hook in Remix",
				content: expect.any(Object),
				slug: "progressively-enhance-the-usefetcher-hook-in-remix",
				tags: [
					"@remix-run/node@10.0.0",
					"@remix-run/react@10.0.0",
					"remix-utils@6.0.0",
				],
			});
		});
		test.skip("should return null if the tutorial does not exist", async () => {});
		test.skip("should return null if the tutorial is not published", async () => {});
	});

	describe.skip(service.recommendations.name, () => {
		test("should return a list of recommended tutorials", async () => {});
		test("should return an empty list if there are no recommendations", async () => {});
	});

	describe.skip(service.search.name, () => {
		test("should return a list of tutorials matching the query", async () => {});
		test("should return an empty list if there are no matches", async () => {});
		test("should return a paginated list of tutorials", async () => {});
		test("should return an empty list if the page is out of bounds", async () => {});
		test("should search by technology name", async () => {});
		test("should search by technology name and version", async () => {});
	});

	describe.skip(service.create.name, () => {
		test("should create a new tutorial", async () => {});
		test("should throw if the tutorial already exists", async () => {});
	});

	describe.skip(service.save.name, () => {
		test("should save a tutorial", async () => {});
		test("should throw if the tutorial does not exist", async () => {});
	});
});
