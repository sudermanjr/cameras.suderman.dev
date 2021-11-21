const rssPlugin = require('@11ty/eleventy-plugin-rss');

const sortByDisplayOrder = require('./src/utils/sort-by-display-order.js');

// Filters
const dateFilter = require('./src/filters/date-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');

// Transforms
const htmlMinTransform = require('./src/transforms/html-min-transform.js');

// Images Utils
const Image = require('@11ty/eleventy-img');
const imageShortCode = require('./src/utils/images.js');

// Create a helpful production flag
const isProduction = process.env.NODE_ENV === 'production';

module.exports = config => {
  // Only minify HTML if we are in production because it slows builds _right_ down
  if (isProduction) {
    config.addTransform('htmlmin', htmlMinTransform);
  }

  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');

  // Add filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('w3DateFilter', w3DateFilter);

  // Plugins
  config.addPlugin(rssPlugin);

  // Returns cameras items, sorted by display order
  config.addCollection('cameras', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./src/cameras/*.md'));
  });

  // Returns cameras items, sorted by display order then filtered by featured
  config.addCollection('featuredCamera', collection => {
    return sortByDisplayOrder(collection.getFilteredByGlob('./src/cameras/*.md')).filter(
      x => x.data.featured
    );
  });

  // Returns a list of people ordered by filename
  config.addCollection('people', collection => {
    return collection.getFilteredByGlob('./src/people/*.md').sort((a, b) => {
      return Number(a.fileSlug) > Number(b.fileSlug) ? 1 : -1;
    });
  });

  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  config.setUseGitIgnore(false);

  // Images shortcode
  config.addNunjucksAsyncShortcode('image', imageShortCode);

  config.addFilter('log', value => {
      console.log(value)
  })

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist'
    }
  };
};
