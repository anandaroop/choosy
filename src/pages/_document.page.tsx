import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document"
import { ServerStyleSheet } from "styled-components"

/**
 * Collects styled-components' CSS during SSR and injects it into the
 * initial HTML response. Without this, the server and client can generate
 * different class hashes for the same component (styled-components'
 * hashing is sequence-dependent), producing a hydration mismatch — the
 * client keeps the server's stale, unstyled class on the mismatched node
 * rather than replacing it. Mirrors orbit/forque's _document (choosy's
 * scaffolding ancestors), minus their runtime-env-var injection, which
 * choosy doesn't use — it reads process.env.NEXT_PUBLIC_* directly.
 */
export default class ChoosyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
