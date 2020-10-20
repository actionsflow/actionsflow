const path = require("path");
const google_form = require("../index");
const {
  formatRequest,
  getTriggerConstructorParams,
} = require("actionsflow-core");

test("google_form with webhook", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "google_form",
    cwd: path.resolve(__dirname, "fixtures"),
    workflowPath: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {},
  });
  const google_formBot = new google_form(triggerConstructorParams);

  const requestPayload = formatRequest({
    path: "/",
    body: {
      event_id:
        "2_ABaOnud0S_zjpIn9oGqBpmY65p_NsuiBSqvdwPlapEig0GM4EPdeStVqalzlAb3AEovoWgA",
      event_type: "form_response",
      form_response: {
        form_id: "118EoaS7eK2qvWv8tQy3xLKa-MGgRAizQvO5PKVArWG4",
        email: "",
        submitted_at: "2020-09-27T07:54:30.661Z",
        definition: {
          title: "test formt",
          fields: [
            {
              id: 440714388,
              title: "question 1",
              type: "MULTIPLE_CHOICE",
              index: 0,
            },
            {
              id: 886865551,
              title: "name",
              type: "TEXT",
              index: 1,
            },
          ],
        },
        answers: [
          {
            response: "Option 2",
            field: {
              id: 440714388,
              title: "question 1",
              type: "MULTIPLE_CHOICE",
              index: 0,
            },
          },
          {
            response: "test",
            field: {
              id: 886865551,
              title: "name",
              type: "TEXT",
              index: 1,
            },
          },
        ],
      },
    },
    method: "POST",
    headers: {},
  });
  const request = {
    ...requestPayload,
    params: {},
  };
  const triggerResults = google_formBot.webhooks[0].handler.bind(
    google_formBot
  )(request);
  expect(triggerResults.length).toBe(1);
  expect(triggerResults[0].answers_map["question 1"]).toBe("Option 2");
});
