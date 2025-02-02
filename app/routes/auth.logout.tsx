import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { Form } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { measure } from "~/utils/measure";

export async function action({ request, context }: DataFunctionArgs) {
	return measure("routes/login#action", async () => {
		return await context.services.auth.authenticator.logout(request, {
			redirectTo: "/",
		});
	});
}

export default function Component() {
	let t = useT();
	return (
		<Form method="post" className="flex flex-col items-center gap-10">
			<header className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
					{t("logout.title")}
				</h2>
			</header>

			<button
				type="submit"
				className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				{t("logout.cta")}
			</button>
		</Form>
	);
}
