// eslint-disable-next-line @typescript-eslint/no-var-requires
const micromatch = require("micromatch");

module.exports = {
  "*.{js,ts}": [
    "eslint --cache --ext .js,.ts --fix",
    "prettier --write",
    "git add",
  ],
  "*.{md,yaml,yml,json}": ["prettier --write", "git add"],
  // "*.md": ["remark --quiet --frail"],
  "*.md": (files) => {
    // from `files` filter those _NOT_ matching `*test.js`
    const match = micromatch.not(files, "**/CHANGELOG.md");
    if (match.length > 0) {
      return `remark --quiet ${match.join(" ")}`;
    } else {
      return "true";
    }
  },
};
