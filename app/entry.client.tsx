import { SSRProvider } from "@react-aria/ssr";
import i18next from "i18next";
import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { RemixI18NextProvider } from "remix-i18next";
import { init } from "./services/i18next";

init().then(() => {
  hydrate(
    <SSRProvider>
      <RemixI18NextProvider i18n={i18next}>
        <RemixBrowser />
      </RemixI18NextProvider>
    </SSRProvider>,
    document
  );
});
