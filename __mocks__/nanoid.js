/**
 * Module override for nanoid for two reasons:
 * 1. Makes the IDs generated consistent for testing purposes
 * 2. Resolves a module import error with jsdom
 */
module.exports = {
  nanoid: function () {
    return 'test-nanoid';
  },
};
