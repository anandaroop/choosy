import App, { AppContext, AppInitialProps, AppProps } from "next/app"

import { Layout } from "components/Layout"
import { Boot } from "system/Boot"
import type { AccessResult } from "utils/access"

interface ChoosyAppProps {
  accessResult: AccessResult
}

export default function ChoosyApp({
  Component,
  pageProps,
  accessResult,
}: AppProps & ChoosyAppProps) {
  return (
    <Boot>
      <Layout accessResult={accessResult}>
        <Component {...pageProps} />
      </Layout>
    </Boot>
  )
}

ChoosyApp.getInitialProps = async (
  context: AppContext
): Promise<AppInitialProps & ChoosyAppProps> => {
  const ctx = await App.getInitialProps(context)
  const { req } = context.ctx

  // _app.page.tsx is compiled for both server and client, so it must never
  // import utils/access (it transitively pulls in unleash-client, a
  // Node-only SDK that breaks the browser bundle) — access is always
  // resolved via the /api/access route instead. On the initial server
  // render, req/res are the real request: build an absolute same-origin URL
  // and forward the cookie header so the session is available server-side.
  // On client-side route transitions, req/res are absent and a same-origin
  // relative fetch carries cookies automatically — either way, access is
  // never gated on client-side useFlag or a value cached across navigations.
  const accessResult = await fetchAccessResult(req)

  return { ...ctx, accessResult }
}

async function fetchAccessResult(
  req: AppContext["ctx"]["req"]
): Promise<AccessResult> {
  const url = req ? `http://${req.headers.host}/api/access` : "/api/access"

  const response = await fetch(url, {
    headers: req?.headers.cookie ? { cookie: req.headers.cookie } : undefined,
  })
  return response.json()
}
