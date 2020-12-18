import Graghql from "../graphql";
import { getTriggerHelpers, IHelpers } from "actionsflow-core";
import { AxiosStatic } from "axios";
const helpers: IHelpers = getTriggerHelpers({
  name: "graghql",
  workflowRelativePath: "graghql.yml",
});
import { getTriggerConstructorParams } from "./trigger.util";
const resp = {
  data: {
    data: {
      posts: {
        edges: [
          {
            node: {
              id: "277928",
              commentsCount: 41,
              createdAt: "2020-12-17T08:20:16Z",
              description:
                "Like a fitness tracker for your code. Our contribution analytics empower devs with insight. Let the code speak for itself with dashboards & badges focused on self-improvement & career growth. See where you measure up & translate commits into insights.",
              featuredAt: "2020-12-17T08:20:16Z",
              media: [
                {
                  type: "video",
                  url:
                    "https://ph-files.imgix.net/d089d454-9306-4f26-a0d2-86ed0823ef97.jpeg?auto=format&fit=crop",
                  videoUrl:
                    "https://www.youtube.com/watch?v=YGqCjb6NxII&feature=youtu.be",
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/d6752ba2-2afa-422e-8caa-e42b034111d3.jpeg?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/b8547427-877b-44d9-8b52-5210a6c4e017.jpeg?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/e78a8cdd-9587-4c87-8675-b63461858d56.jpeg?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/5522f0f9-cf3c-40bf-9904-d36fbaeea3e7.jpeg?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/a4122cba-ff52-4fa1-a9ba-dec76378e7da.png?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/3dce3771-c7b0-4d53-a891-e92ee7adfeff.jpeg?auto=format&fit=crop",
                  videoUrl: null,
                },
              ],
              name: "Merico Build",
              productLinks: [
                {
                  type: "Website",
                  url:
                    "https://www.producthunt.com/r/f70b0be0a71e94?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
                },
              ],
              reviewsCount: 31,
              reviewsRating: 4.4,
              slug: "merico-build",
              tagline: "Free analytics to level up your code & career",
              url:
                "https://www.producthunt.com/posts/merico-build?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              thumbnail: {
                type: "image",
                url:
                  "https://ph-files.imgix.net/a4122cba-ff52-4fa1-a9ba-dec76378e7da.png?auto=format&fit=crop",
                videoUrl: null,
              },
              votesCount: 902,
              website:
                "https://www.producthunt.com/r/f70b0be0a71e94?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              topics: {
                edges: [
                  {
                    node: {
                      name: "Productivity",
                    },
                  },
                  {
                    node: {
                      name: "Analytics",
                    },
                  },
                  {
                    node: {
                      name: "Developer Tools",
                    },
                  },
                ],
              },
            },
          },
          {
            node: {
              id: "278323",
              commentsCount: 29,
              createdAt: "2020-12-17T08:01:00Z",
              description:
                "Konsey.dev is an application that allows you to manage all your advertising work for different platforms in one place. Currently you can manage your Facebook & Google Ads accounts +TikTok Ads is coming soon!",
              featuredAt: "2020-12-17T08:01:00Z",
              media: [
                {
                  type: "video",
                  url:
                    "https://ph-files.imgix.net/d66b11b2-b4f4-4ea3-a9e9-10adb51de1a7.jpeg?auto=format&fit=crop",
                  videoUrl: "https://www.youtube.com/watch?v=FQxl9UuJOLY",
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/ec3e8e14-77e5-4438-a64f-355f095c3bff.png?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/9e54f224-4a05-45da-ab08-2482508e9c09.png?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/c6cee841-3ae2-40ff-b3e4-7a7dc2655ff2.png?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/c1a18b71-ab3a-475c-8540-e83ad6ea247c.png?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/a0f6647a-d8f9-45bf-8f20-8f24575dcf89.gif?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/34d3a0f6-c19e-4f12-8cc6-1776f4e233d6.png?auto=format&fit=crop",
                  videoUrl: null,
                },
              ],
              name: "Konsey.dev",
              productLinks: [
                {
                  type: "Website",
                  url:
                    "https://www.producthunt.com/r/b33d84fd6b195e?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
                },
              ],
              reviewsCount: 24,
              reviewsRating: 4.0,
              slug: "konsey-dev",
              tagline: "Create & manage all your ads in one place",
              url:
                "https://www.producthunt.com/posts/konsey-dev?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              thumbnail: {
                type: "image",
                url:
                  "https://ph-files.imgix.net/a0f6647a-d8f9-45bf-8f20-8f24575dcf89.gif?auto=format&fit=crop",
                videoUrl: null,
              },
              votesCount: 624,
              website:
                "https://www.producthunt.com/r/b33d84fd6b195e?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              topics: {
                edges: [
                  {
                    node: {
                      name: "Design Tools",
                    },
                  },
                  {
                    node: {
                      name: "Marketing",
                    },
                  },
                  {
                    node: {
                      name: "Advertising",
                    },
                  },
                  {
                    node: {
                      name: "Tech",
                    },
                  },
                ],
              },
            },
          },
          {
            node: {
              id: "278383",
              commentsCount: 36,
              createdAt: "2020-12-17T08:01:00Z",
              description:
                "A members-only club for COVID conscious trip planning and on demand recommendations, curated by our in-the-know community.",
              featuredAt: "2020-12-17T08:01:00Z",
              media: [
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/19dadb8c-0acf-427b-b098-a954fc01aac1.gif?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/b5fecc05-f691-4493-8584-f964214d613a.jpeg?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/2d42ac63-4509-4288-bf53-dbdf05c4c090.gif?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/655966e8-5bde-4ea3-863b-bed8de3dd3cd.gif?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/10347b04-5d40-457e-a177-1717d3c2c7ba.gif?auto=format&fit=crop",
                  videoUrl: null,
                },
              ],
              name: "The Club by Allcall",
              productLinks: [
                {
                  type: "Website",
                  url:
                    "https://www.producthunt.com/r/07e32947aad9ba?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
                },
              ],
              reviewsCount: 21,
              reviewsRating: 5.0,
              slug: "the-club-by-allcall",
              tagline: "COVID conscious trips & on-demand text recs.",
              url:
                "https://www.producthunt.com/posts/the-club-by-allcall?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              thumbnail: {
                type: "image",
                url:
                  "https://ph-files.imgix.net/655966e8-5bde-4ea3-863b-bed8de3dd3cd.gif?auto=format&fit=crop",
                videoUrl: null,
              },
              votesCount: 821,
              website:
                "https://www.producthunt.com/r/07e32947aad9ba?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              topics: {
                edges: [
                  {
                    node: {
                      name: "Nomad Lifestyle",
                    },
                  },
                  {
                    node: {
                      name: "Travel",
                    },
                  },
                  {
                    node: {
                      name: "Tech",
                    },
                  },
                ],
              },
            },
          },
          {
            node: {
              id: "278423",
              commentsCount: 155,
              createdAt: "2020-12-17T08:07:45Z",
              description:
                "EduDo is a mobile learning platform with short user-generated interactive videos to watch on the go",
              featuredAt: "2020-12-17T08:07:45Z",
              media: [
                {
                  type: "video",
                  url:
                    "https://ph-files.imgix.net/48541b7f-cd1a-4f64-b306-8fdd6e0486cc.jpeg?auto=format&fit=crop",
                  videoUrl: "https://www.youtube.com/watch?v=rJbnVxHpG9M",
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/d3f0c76d-3ee0-41ea-8b13-3c86ffcbd348.png?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/b8ee5960-20a9-4200-a7cf-f480b52e5078.gif?auto=format&fit=crop",
                  videoUrl: null,
                },
                {
                  type: "image",
                  url:
                    "https://ph-files.imgix.net/5ae73b06-2ca6-4d40-b479-272874085990.png?auto=format&fit=crop",
                  videoUrl: null,
                },
              ],
              name: "EduDo",
              productLinks: [
                {
                  type: "App Store",
                  url:
                    "https://www.producthunt.com/r/dc88f6ffbb58f7?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
                },
              ],
              reviewsCount: 44,
              reviewsRating: 4.4,
              slug: "edudo",
              tagline: "Social learning platform",
              url:
                "https://www.producthunt.com/posts/edudo?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              thumbnail: {
                type: "image",
                url:
                  "https://ph-files.imgix.net/b8ee5960-20a9-4200-a7cf-f480b52e5078.gif?auto=format&fit=crop",
                videoUrl: null,
              },
              votesCount: 841,
              website:
                "https://www.producthunt.com/r/dc88f6ffbb58f7?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+Buzzing+%28ID%3A+41381%29",
              topics: {
                edges: [
                  {
                    node: {
                      name: "iPhone",
                    },
                  },
                  {
                    node: {
                      name: "Education",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  },
};

test("poll graghql trigger with complex response and deduplicationKey as key", async () => {
  const axios = jest.fn();
  axios.mockImplementation(() => Promise.resolve(resp));
  helpers.axios = (axios as unknown) as AxiosStatic;
  const constructionParams = await getTriggerConstructorParams({
    options: {
      url: "https://jsonplaceholder.typicode.com/posts",
      deduplicationKey: "node.id",
      itemsPath: "data.posts.edges",
      query: "query {id}",
    },
    name: "graphql",
  });
  constructionParams.helpers = helpers;
  const poll = new Graghql(constructionParams);
  const triggerResults = await poll.run();
  expect(triggerResults.length).toBe(4);
  const itemKey = poll.getItemKey(triggerResults[0]);
  expect(itemKey).toBe("https://jsonplaceholder.typicode.com/posts__277928");
});
test("graghql trigger with errros", async () => {
  const resp2 = {
    data: {
      errors: [
        {
          message:
            "Query has complexity of 1382, which exceeds max complexity of 1000",
        },
      ],
    },
  };
  const axios = jest.fn();
  axios.mockImplementation(() => Promise.resolve(resp2));
  helpers.axios = (axios as unknown) as AxiosStatic;
  const constructionParams = await getTriggerConstructorParams({
    options: {
      url: "https://jsonplaceholder.typicode.com/posts",
      query: " query {id}",
    },
    name: "graghql",
  });
  constructionParams.helpers = helpers;
  const poll = new Graghql(constructionParams);

  await expect(poll.run()).rejects.toEqual(new Error("response error"));
});

test("poll trigger without required param", async () => {
  const poll = new Graghql(
    await getTriggerConstructorParams({
      options: {},
      name: "graghql",
    })
  );

  await expect(poll.run()).rejects.toEqual(new Error("Miss param url!"));
});
