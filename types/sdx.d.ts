import type { PrismaClient } from "@prisma/client";
import "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import type {
  DynamicLinksFunction,
  ExternalScriptsFunction,
  StructuredDataFunction,
} from "remix-utils";
import type { Logger } from "winston";

declare global {
  namespace SDX {
    export interface Context {
      db: PrismaClient;
      logger: Logger;
    }

    export type Handle<LoaderData = unknown> = {
      i18n?: string | string[];
      hydrate?: boolean | ((data: LoaderData) => boolean);
      scripts?: ExternalScriptsFunction;
      dynamicLinks?: DynamicLinksFunction<LoaderData>;
      structuredData?: StructuredDataFunction<LoaderData>;
    };
  }
}

declare module "@remix-run/node" {
  export interface LoaderArgs extends DataFunctionArgs {
    context: SDX.Context;
  }

  export interface ActionArgs extends DataFunctionArgs {
    context: SDX.Context;
  }
}
