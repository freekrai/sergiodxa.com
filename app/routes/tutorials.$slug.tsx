import type { DataFunctionArgs, SerializeFrom } from "@remix-run/cloudflare";

import { defer } from "@remix-run/cloudflare";
import { Await, Link, useAsyncValue, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { Suspense } from "react";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";
import { measure } from "~/utils/measure";

type LoaderData = SerializeFrom<typeof loader>;
type RecommendationsList = Awaited<LoaderData["recommendations"]>;

export async function loader(_: DataFunctionArgs) {
	return measure("routes/tutorials.$slug#loader", async () => {
		let { slug } = z.object({ slug: z.string() }).parse(_.params);

		let recommendations = _.context.services.tutorials.recommendations(slug);
		let tutorial = await _.context.services.tutorials.read(slug);

		return defer({ tutorial, recommendations });
	});
}

export default function Component() {
	let { tutorial, recommendations } = useLoaderData<typeof loader>();

	if (!tutorial) return null;

	return (
		<article className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<Versions />

			<div className="prose prose-blue sm:prose-lg">
				<Header />
				<MarkdownView content={tutorial?.content} />
			</div>

			<Suspense fallback={<div>Loading...</div>}>
				<Await resolve={recommendations} errorElement={null}>
					<footer>
						<Recommendations />
					</footer>
				</Await>
			</Suspense>
		</article>
	);
}

function Header() {
	let { tutorial } = useLoaderData<typeof loader>();
	let user = useUser();
	let t = useT("translation", "tutorial.header");

	let editUrl = new URL(
		`https://github.com/sergiodxa/sergiodxa.com/edit/main/content/tutorials/${tutorial.slug}.md`
	);

	return (
		<header className="gap-4 md:flex md:items-start md:justify-between">
			<h1>{tutorial.title}</h1>
			{user ? (
				<div className="flex flex-shrink-0">
					<a
						href={editUrl.toString()}
						className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						{t("edit")}
					</a>

					{/* <button
						type="button"
						className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Publish
					</button> */}
				</div>
			) : null}
		</header>
	);
}

function Versions() {
	let { tutorial } = useLoaderData<typeof loader>();
	let t = useT("translation", "tutorial");

	if (!tutorial || tutorial.tags.length === 0) return null;

	return (
		<section className="not-prose flex flex-wrap items-center gap-1">
			<h2 className="text-xs font-bold">{t("tags")}</h2>

			<ul className="contents">
				{tutorial.tags.map((tag) => {
					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${tag}`);

					let to = `/tutorials?${searchParams.toString()}`;

					return (
						<li key={tag} className="contents">
							<Link
								to={to}
								className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800"
							>
								{tag}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

function Recommendations() {
	let recommendations = useAsyncValue() as RecommendationsList;
	let t = useT("translation", "tutorial.related");

	if (!recommendations || recommendations.length === 0) return null;

	return (
		<section className="not-prose mt-4 space-y-4">
			<header className="border-b border-gray-200 pb-5">
				<h2 className="text-lg font-medium leading-6 text-gray-900">
					{t("title")}
				</h2>
			</header>

			<div
				className={clsx("grid grid-cols-1 gap-4", {
					"md:grid-cols-1": recommendations.length === 1,
					"md:grid-cols-2": recommendations.length === 2,
					"md:grid-cols-3": recommendations.length >= 3,
				})}
			>
				{recommendations.map(({ title, slug, tag }) => {
					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${tag}`);

					let to = `/tutorials?q=${searchParams.toString()}`;

					return (
						<div key={slug}>
							<ul className="flex flex-nowrap items-center gap-1 truncate">
								<li key={tag} className="contents">
									<Link
										to={to}
										className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800"
									>
										{tag}
									</Link>
								</li>
							</ul>

							<Link
								to={`/tutorials/${slug}`}
								className="mt-4 block no-underline"
							>
								<p className="text-xl font-semibold text-gray-900">{title}</p>
							</Link>
						</div>
					);
				})}
			</div>
		</section>
	);
}
