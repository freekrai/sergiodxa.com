import type { AppLoadContext, ServerBuild } from "@remix-run/cloudflare";

import { createRequestHandler as createRemixRequestHandler } from "@remix-run/cloudflare";

import { measure, measureSync } from "~/utils/measure";

/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action.
 */
export type GetLoadContextFunction<Env = any> = (
	context: EventContext<Env, any, any>
) => AppLoadContext;

export type RequestHandler<Env = any> = PagesFunction<Env>;

export interface createPagesFunctionHandlerParams<Env = any> {
	build: ServerBuild;
	getLoadContext?: GetLoadContextFunction<Env>;
	mode?: string;
}

export function createRequestHandler<Env = any>({
	build,
	getLoadContext,
	mode,
}: createPagesFunctionHandlerParams<Env>): RequestHandler<Env> {
	let handleRequest = createRemixRequestHandler(build, mode);

	return (context) => {
		let loadContext = measureSync("get load context", () =>
			getLoadContext?.(context)
		);

		return measure("handle request with remix", () =>
			handleRequest(context.request, loadContext)
		);
	};
}

declare const process: any;

export function createPagesFunctionHandler<Env = any>({
	build,
	getLoadContext,
	mode,
}: createPagesFunctionHandlerParams<Env>) {
	let handleRequest = createRequestHandler<Env>({
		build,
		getLoadContext,
		mode,
	});

	let handleFetch = async (context: EventContext<Env, any, any>) => {
		let response: Response | undefined;

		// https://github.com/cloudflare/wrangler2/issues/117
		context.request.headers.delete("if-none-match");

		try {
			response = await measure("fetch assets", async () => {
				response = await (context.env as any).ASSETS.fetch(
					context.request.url,
					context.request.clone()
				);
				return response && response.status >= 200 && response.status < 400
					? new Response(response.body, response)
					: undefined;
			});
		} catch {}

		if (!response) {
			console.log("no response from assets");
			response = await measure("run remix loaders", () =>
				handleRequest(context)
			);
		}

		return response;
	};

	return async (context: EventContext<Env, any, any>) => {
		try {
			return await handleFetch(context);
		} catch (error: unknown) {
			if (process.env.NODE_ENV === "development" && error instanceof Error) {
				console.error(error);
				return new Response(error.message || error.toString(), {
					status: 500,
				});
			}

			return new Response("Internal Error", {
				status: 500,
			});
		}
	};
}
