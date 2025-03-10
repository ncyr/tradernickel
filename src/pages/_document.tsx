import { Html, Head, Main, NextScript } from 'next/document'
import type { DocumentProps } from 'next/document'

export default function Document(props: DocumentProps) {
  return (
    <Html lang="en">
      <Head />
      <body {...{
        'data-new-gr-c-s-check-loaded': undefined,
        'data-gr-ext-installed': undefined
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 