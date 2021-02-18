# `@actionsflow/trigger-instagram`

This is an [instagram](https://www.instagram.com/) trigger of [Actionsflow](https://github.com/actionsflow/actionsflow). Any new action in Instagram will trigger the trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-instagram)

## Usage

Get your instagram posts:

```yaml
on:
  instagram:
    access_token: ${{ secrets.INSTAGRAM_ACCESS_TOKEN }}
```

Get somebody's instagram posts:

```yaml
on:
  instagram:
    user_id: "17841432487737681"
    access_token: ${{ secrets.INSTAGRAM_ACCESS_TOKEN }}
```

Or, multiple users:

```yaml
on:
  instagram:
    user_id:
      - "17841432487737681"
      - "17841432487737682"
    access_token: ${{ secrets.INSTAGRAM_ACCESS_TOKEN }}
```

## Options

- `access_token`, required, instagram API authentication, you should get it from [Facebook Developers App](https://developers.facebook.com/apps/), See also [Official docs](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started), [How to create access_token using User Token Generator](https://github.com/nbcommunication/InstagramBasicDisplayApi#creating-a-facebook-app)
- `user_id`, optional, `string` or `string[]`, you can get it by requesting a `get` request: `https://graph.instagram.com/me?fields=id&access_token={access-token}`, or [see this answer](https://stackoverflow.com/questions/11796349/instagram-how-to-get-my-user-id-from-username)
- `fetchAllResultsAtFirst`, optional, `boolean`, if fetch all results at first run, the default is `false`, if `true`, it will fetch all results of your instagram.
- `maxCount`, optional, `number`, if `fetchAllResultsAtFirst` is `true`, you can use `maxCount` to limit the number of fetched results, such like `1000`.

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

An outputs example:

```json
{
  "caption": "#coronavirus #no so bad",
  "id": "17869684195728842",
  "media_type": "IMAGE",
  "media_url": "https://scontent-lax3-1.cdninstagram.com/v/t51.2885-15/94169052_3071944286203383_250459185632461249_n.jpg?_nc_cat=102&ccb=2&_nc_sid=8ae9d6&_nc_ohc=mrmFbLbLfeIAX8hhBzd&_nc_ht=scontent-lax3-1.cdninstagram.com&oh=ce7c2480b1f0c6765f525718da8f51c5&oe=602F563C",
  "permalink": "https://www.instagram.com/p/B_ZnxcNnfCa/",
  "timestamp": "2020-04-25T10:22:38+0000",
  "username": "iamowenyoung"
}
```

You can use the outputs like this:

```yaml
on:
  instagram:
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          outputs: ${{ toJSON(on.instagram.outputs) }}
        run: |
          echo outputs: $outputs
```
