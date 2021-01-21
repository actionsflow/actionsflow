import Poll from "./poll";
import Rss from "./rss";
import email from "./email";
import Webhook from "./webhook";
import Script from "./script";
import Graphql from "./graphql";
import GoogleForm from "@actionsflow/trigger-google_form";
import TelegramBot from "@actionsflow/trigger-telegram_bot";
import Twitter from "@actionsflow/trigger-twitter";
import Slack from "@actionsflow/trigger-slack";
import AWSSNS from "@actionsflow/trigger-aws_sns";
import NPM from "@actionsflow/trigger-npm";
import Trello from "@actionsflow/trigger-trello";
import Typeform from "@actionsflow/trigger-typeform";
import Reddit from "@actionsflow/trigger-reddit";
import Youtube from "@actionsflow/trigger-youtube";
import Weather from "@actionsflow/trigger-weather";
import Instagram from "@actionsflow/trigger-instagram";
export default {
  poll: Poll,
  rss: Rss,
  graphql: Graphql,
  webhook: Webhook,
  script: Script,
  telegram_bot: TelegramBot,
  twitter: Twitter,
  slack: Slack,
  email,
  aws_sns: AWSSNS,
  npm: NPM,
  typeform: Typeform,
  reddit: Reddit,
  google_form: GoogleForm,
  trello: Trello,
  youtube: Youtube,
  weather: Weather,
  instagram: Instagram,
};
