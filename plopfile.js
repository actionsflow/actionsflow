module.exports = function (plop) {
  // Add new js trigger
  plop.setGenerator(`js-trigger`, {
    description: `This sets up the basic files for a new package.`,
    prompts: [
      {
        type: `input`,
        name: `name`,
        message: `name of new package`,
      },
      {
        type: `input`,
        name: `author`,
        message: `Your name/email for putting in the package.json of the new package`,
      },
    ],
    actions: (data) => [
      {
        type: `addMany`,
        destination: `packages/actionsflow-trigger-{{snakeCase name}}`,
        templateFiles: "**/*",
        base: `plop-templates/js-trigger`,
      },
    ],
  });
  // Add new js trigger
  plop.setGenerator(`ts-trigger`, {
    description: `This sets up the basic files for a new package.`,
    prompts: [
      {
        type: `input`,
        name: `name`,
        message: `name of new package`,
      },
      {
        type: `input`,
        name: `author`,
        message: `Your name/email for putting in the package.json of the new package`,
      },
    ],
    actions: (data) => [
      {
        type: `addMany`,
        destination: `packages/actionsflow-trigger-{{snakeCase name}}`,
        templateFiles: "**/*",
        base: `plop-templates/ts-trigger`,
      },
    ],
  });
};
