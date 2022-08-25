import emotionCache from '@/emotionCache';
import createEmotionServer from '@emotion/server/create-instance';
import type { DocumentContext, DocumentInitialProps } from 'next/document';
import NextDocument from 'next/document';
import React, { Children } from 'react';

const { extractCriticalToChunks } = createEmotionServer(emotionCache);

export default class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await super.getInitialProps(ctx);
    const { html, styles } = extractCriticalToChunks(initialProps.html);

    return {
      ...initialProps,
      html,
      styles: [
        ...Children.toArray(initialProps.styles),
        ...styles.map(style => (
          <style
            key={style.key}
            data-emotion={`${style.key} ${style.ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: style.css }}
          />
        )),
      ],
    };
  }
}
