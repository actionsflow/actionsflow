module.exports = {
  hooks: {
    "pre-commit": "lerna run hooks:pre-commit && lint-staged",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
    "pre-push": "lerna run hooks:pre-push",
  },
};
