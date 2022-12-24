import type {
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/services/i18n.server";

export async function loader({ request, context }: LoaderArgs) {
	void context.services.log.http(request);

	let bookmarks = await context.services.airtable.getBookmarks(100);

	let t = await i18n.getFixedT(request);

	let meta = { title: t("bookmarks.meta.title") };

	return json({ bookmarks, meta });
}

export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as SerializeFrom<typeof loader>;
	return meta;
};

export default function Bookmarks() {
	let { bookmarks } = useLoaderData<typeof loader>();
	let t = useT();

	return (
		<section className="space-y-2">
			<header>
				<h2 className="text-3xl font-bold">{t("bookmarks.title")}</h2>
			</header>

			<main>
				<ul className="space-y-2">
					{bookmarks.map((bookmark) => (
						<li key={bookmark.url} className="list-inside list-disc">
							<a href={bookmark.url} rel="nofollow noreferer">
								{bookmark.title}
							</a>
						</li>
					))}
				</ul>
			</main>
		</section>
	);
}
