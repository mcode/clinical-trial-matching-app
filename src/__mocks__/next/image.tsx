/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @next/next/no-img-element */
import React from 'react';

const NextImage = ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
  <img src={src} alt={alt} width={width} height={height} />
);

export default NextImage;
