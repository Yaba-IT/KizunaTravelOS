/* Commitlint configuration for KizunaTravelOS
 * Enforces Conventional Commits (https://www.conventionalcommits.org/)
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],

  /*
   * Fine-tune rules if you need stricter control.
   * Docs: https://commitlint.js.org/#/reference-rules
   */
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',       // new feature
        'fix',        // bug fix
        'docs',       // documentation only
        'style',      // formatting, missing semi-colons, etc.
        'refactor',   // code change that neither fixes a bug nor adds a feature
        'perf',       // performance improvement
        'test',       // adding / correcting tests
        'build',      // build system / deps
        'ci',         // CI config
        'chore',      // maintenance
        'revert',     // revert previous commit
      ],
    ],
    // Allow any casing in the subject (e.g. lower-case imperative or sentence-case)
    'subject-case': [0],
  },
};
