const path = require("path");
const trello = require("../index");
const {
  getTriggerHelpers,
  getContext,
  getWorkflow,
  formatRequest,
} = require("actionsflow-core");

test("trello with webhook", async () => {
  const trelloBot = new trello({
    options: {},
    helpers: getTriggerHelpers({
      name: "trello",
      workflowRelativePath: "workflow.yml",
    }),
    workflow: await getWorkflow({
      path: path.resolve(__dirname, "fixtures/workflows/workflow.yml"),
      cwd: path.resolve(__dirname, "fixtures"),
      context: getContext(),
    }),
  });

  const requestPayload = formatRequest({
    path: "/",
    body: {
      model: {
        id: "5f4fbbc5250c34138444068d",
        name: "ideas",
        desc: "",
        descData: null,
        closed: false,
        idOrganization: null,
        idEnterprise: null,
        pinned: false,
        url: "https://trello.com/b/iCZf1Oev/ideas",
        shortUrl: "https://trello.com/b/iCZf1Oev",
        prefs: {
          permissionLevel: "private",
          hideVotes: false,
          voting: "disabled",
          comments: "members",
          invitations: "members",
          selfJoin: true,
          cardCovers: true,
          isTemplate: false,
          cardAging: "regular",
          calendarFeedEnabled: false,
          background: "lime",
          backgroundImage: null,
          backgroundImageScaled: null,
          backgroundTile: false,
          backgroundBrightness: "dark",
          backgroundColor: "#4BBF6B",
          backgroundBottomColor: "#4BBF6B",
          backgroundTopColor: "#4BBF6B",
          canBePublic: true,
          canBeEnterprise: true,
          canBeOrg: true,
          canBePrivate: true,
          canInvite: true,
        },
        labelNames: {
          green: "",
          yellow: "",
          orange: "",
          red: "",
          purple: "",
          blue: "",
          sky: "",
          lime: "",
          pink: "",
          black: "",
        },
      },
      action: {
        id: "5f7073311f0aab7e1c3dd44c",
        idMemberCreator: "5f4fbba99b140e21cceebdb1",
        data: {
          card: {
            id: "5f7073311f0aab7e1c3dd44b",
            name: "test item",
            idShort: 2,
            shortLink: "Iy3XGStt",
          },
          list: { id: "5f70732bb7991045f878901e", name: "todos" },
          board: {
            id: "5f4fbbc5250c34138444068d",
            name: "ideas",
            shortLink: "iCZf1Oev",
          },
        },
        type: "createCard",
        date: "2020-09-27T11:10:41.983Z",
        limits: {},
        appCreator: null,
        display: {
          translationKey: "action_create_card",
          entities: {
            card: {
              type: "card",
              id: "5f7073311f0aab7e1c3dd44b",
              shortLink: "Iy3XGStt",
              text: "test item",
            },
            list: {
              type: "list",
              id: "5f70732bb7991045f878901e",
              text: "todos",
            },
            memberCreator: {
              type: "member",
              id: "5f4fbba99b140e21cceebdb1",
              username: "theowenyoung",
              text: "Owen Young",
            },
          },
        },
        memberCreator: {
          id: "5f4fbba99b140e21cceebdb1",
          username: "theowenyoung",
          activityBlocked: false,
          avatarHash: "6f3911adf8ac1a7d23b57329dd2412dc",
          avatarUrl:
            "https://trello-members.s3.amazonaws.com/5f4fbba99b140e21cceebdb1/6f3911adf8ac1a7d23b57329dd2412dc",
          fullName: "Owen Young",
          idMemberReferrer: null,
          initials: "OY",
          nonPublic: {},
          nonPublicAvailable: true,
        },
      },
    },
    method: "POST",
    headers: {},
  });
  const request = {
    ...requestPayload,
    params: {},
  };
  const triggerResults = trelloBot.webhooks[0].handler.bind(trelloBot)(request);
  expect(triggerResults.length).toBe(1);
  expect(triggerResults[0].action.type).toBe("createCard");
});
