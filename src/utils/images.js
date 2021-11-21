//https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/
const path = require('path');
const Image = require('@11ty/eleventy-img');
const outdent = require('outdent');

const ImageWidths = {
  ORIGINAL: null,
  PLACEHOLDER: 24,
};

module.exports = async (
  relativeSrc,
  alt,
  className,
  widths = [400, 800, 1280],
  baseFormat = 'png',
  optimizedFormats = ['webp'],
  sizes = '100vw'
) => {

  const { dir: imgDir } = path.parse(relativeSrc);
  const fullSrc = /^https.+/.test(relativeSrc) ? relativeSrc : path.join('src', relativeSrc);

  const imageMetadata = await Image(fullSrc, {
    widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...widths],
    formats: [...optimizedFormats, baseFormat],
    outputDir: path.join('dist', imgDir),
    urlPath: imgDir,
  });

  // Map each unique format (e.g., jpeg, webp) to its smallest and largest images
  const formatSizes = Object.entries(imageMetadata).reduce((formatSizes, [format, images]) => {
    if (!formatSizes[format]) {
      const placeholder = images.find((image) => image.width === ImageWidths.PLACEHOLDER);
      // 11ty sorts the sizes in ascending order under the hood
      const largestVariant = images[images.length - 1];

      formatSizes[format] = {
        placeholder,
        largest: largestVariant,
      };
    }
    return formatSizes;
  }, {});

  const picture = `<picture class="${className}">
  ${Object.values(imageMetadata)
    // Map each format to the source HTML markup
    .map((formatEntries) => {
      // The first entry is representative of all the others since they each have the same shape
      const { format: formatName, sourceType } = formatEntries[0];

      const placeholderSrcset = formatSizes[formatName].placeholder.url;
      const actualSrcset = formatEntries
        // We don't need the placeholder image in the srcset
        .filter((image) => image.width !== ImageWidths.PLACEHOLDER)
        // All non-placeholder images get mapped to their srcset
        .map((image) => image.srcset)
        .join(', ');

      return `<source type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${actualSrcset}" data-sizes="${sizes}">`;
    })
    .join('\n')}
    <img
      src="${formatSizes[baseFormat].placeholder.url}"
      data-src="${formatSizes[baseFormat].largest.url}"
      class="lazy-img"
      loading="lazy">
  </picture>`;

  return outdent`picture`;

};
