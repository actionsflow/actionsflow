module.exports = class GoogleForm {
  constructor() {
    this.webhooks = [
      {
        method: "post",
        handler: (request) => {
          let items = [];
          if (request.body) {
            const bodyData = request.body;

            if (
              bodyData.form_response === undefined ||
              bodyData.form_response.definition === undefined ||
              bodyData.form_response.answers === undefined
            ) {
              throw new Error("Expected definition/answers data is missing!");
            }

            const answers = bodyData.form_response.answers;
            // Some fields contain lower level fields of which we are only interested of the values
            const definition = bodyData.form_response.definition;

            // Create a dictionary to get the field title by its ID
            const defintitionsById = {};
            for (const field of definition.fields) {
              defintitionsById[field.id] = field.title;
            }

            // Convert the answers to key -> value pair
            const convertedAnswers = {};
            for (const answer of answers) {
              let value = answer.response;
              convertedAnswers[defintitionsById[answer.field.id]] = value;
            }
            request.body.answers_map = convertedAnswers;
            items = [request.body];
          }
          return items;
        },
      },
    ];
  }
};
