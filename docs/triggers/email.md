---
title: "Email"
metaTitle: "Actionsflow Email trigger"
metaDescription: "Email trigger is triggered when new mail are detected."
---

Email trigger is triggered when new mail are received, you need to provide a `imap` config.

[View trigger on Github](https://github.com/actionsflow/actionsflow/blob/main/packages/actionsflow/src/triggers/email.ts)

# Usage

```yaml
on:
  email:
    imap:
      host: outlook.office365.com
      user: ${{secrets.EMAIL_USER}}
      password: ${{secrets.EMAIL_PASSWORD}}
```

> Tips: [Common used `imap` host config](https://support.microsoft.com/en-us/office/pop-and-imap-email-settings-for-outlook-8361e398-8af4-4e97-b147-6c6c4ac95353)

## Options

- `imap`, `IMAP` connection config, we use [`imap-simple`](https://github.com/chadxz/imap-simple) for mail connection, learn more about config please see [here](https://github.com/chadxz/imap-simple)

  ```typescript
  interface Config {
    /** Username for plain-text authentication. */
    user: string;
    /** Password for plain-text authentication. */
    password: string;
    /** Base64-encoded OAuth token for OAuth authentication for servers that support it (See Andris Reinman's xoauth.js module to help generate this string). */
    xoauth?: string;
    /** Base64-encoded OAuth2 token for The SASL XOAUTH2 Mechanism for servers that support it (See Andris Reinman's xoauth2 module to help generate this string). */
    xoauth2?: string;
    /** Hostname or IP address of the IMAP server. Default: "localhost" */
    host: string;
    /** Port number of the IMAP server. Default: 143 */
    port?: number;
    /** Perform implicit TLS connection? Default: false */
    tls?: boolean;
    /** Options object to pass to tls.connect() Default: (none) */
    tlsOptions?: Object;
    /** Set to 'always' to always attempt connection upgrades via STARTTLS, 'required' only if upgrading is required, or 'never' to never attempt upgrading. Default: 'never' */
    autotls?: string;
    /** Number of milliseconds to wait for a connection to be established. Default: 10000 */
    connTimeout?: number;
    /** Number of milliseconds to wait to be authenticated after a connection has been established. Default: 5000 */
    authTimeout?: number;
  }
  ```

- `shouldDownloadAttachments`, optional, `boolean`, if need downloading attachments, the default value is `false`.

> You can use [General Config for Actionsflow Trigger](../workflow.md#ontriggerconfig) for more customization.

## Outputs

Actionsflow use [`mailparser`](https://github.com/nodemailer/mailparser) for parse email content, the outputs are same as [mailparser.simpleParser returned mail object](https://nodemailer.com/extras/mailparser/#mail-object)

An outputs example:

```json
{
  "attachments": [
    {
      "mimeType": "text/plain",
      "data": "dGVzdA==",
      "fileName": "test.txt",
      "fileExtension": "txt"
    }
  ],
  "text": "Test body.",
  "textAsHtml": "<p>Test body.</p>",
  "subject": "Test Subject",
  "date": "2020-09-14T23:44:20.000Z",
  "to": {
    "value": [
      {
        "address": "theowenyoung@outlook.com",
        "name": ""
      }
    ],
    "html": "<span class=\"mp_address_group\"><a href=\"mailto:theowenyoung@outlook.com\" class=\"mp_address_email\">theowenyoung@outlook.com</a></span>",
    "text": "theowenyoung@outlook.com"
  },
  "from": {
    "value": [
      {
        "address": "theowenyoung@gmail.com",
        "name": "Owen Young"
      }
    ],
    "html": "<span class=\"mp_address_group\"><span class=\"mp_address_name\">Owen Young</span> &lt;<a href=\"mailto:theowenyoung@gmail.com\" class=\"mp_address_email\">theowenyoung@gmail.com</a>&gt;</span>",
    "text": "Owen Young <theowenyoung@gmail.com>"
  },
  "cc": {
    "value": [
      {
        "address": "owen@owenyoung.com",
        "name": ""
      },
      {
        "address": "test@owenyoung.com",
        "name": ""
      }
    ],
    "html": "<span class=\"mp_address_group\"><a href=\"mailto:owen@owenyoung.com\" class=\"mp_address_email\">owen@owenyoung.com</a></span>, <span class=\"mp_address_group\"><a href=\"mailto:test@owenyoung.com\" class=\"mp_address_email\">test@owenyoung.com</a></span>",
    "text": "owen@owenyoung.com, test@owenyoung.com"
  },
  "messageId": "<098F27FF-0F94-406E-A8B1-933D5B21CB43@gmail.com>",
  "html": false
}
```

You can use the outputs like this:

```yaml
on:
  email:
    imap:
      host: outlook.office365.com
      user: ${{secrets.EMAIL_USER}}
      password: ${{secrets.EMAIL_PASSWORD}}
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          subject: ${{(on.email.outputs.subject)}}
        run: |
          echo subject: $subject
```
