export function getWorkflowFileNameByPath(path: string): string {
  const regexPageExtension = new RegExp(
    `\\.+(?:${["yml", "yaml"].join("|")})$`
  );
  path = path.replace(regexPageExtension, "");
  return path;
}
export function getTriggerWebhookBasePath(
  workflowRelativePath: string,
  triggerName: string
): string {
  const regexPageExtension = new RegExp(
    `\\.+(?:${["yml", "yaml"].join("|")})$`
  );
  let pageName = "/" + workflowRelativePath.replace(/\\+/g, "/");
  pageName = pageName.replace(regexPageExtension, "");
  pageName = `${pageName}/${triggerName}`;
  return pageName;
}

export function getParamsByWebhookPath(
  path: string
):
  | {
      workflowFileName: string;
      triggerName: string;
      path: string;
    }
  | undefined {
  const regex1 = /^\/(?:([^/]+?))\/(?:([^/]+?))(\/.*)/i;
  const regex2 = /^\/(?:([^/]+?))\/(?:([^/]+?))\/?$/i;
  const regexResult1 = path.match(regex1);
  const regexResult2 = path.match(regex2);
  if (regexResult1) {
    return {
      workflowFileName: regexResult1[1],
      triggerName: regexResult1[2],
      path: regexResult1[3],
    };
  }
  if (regexResult2) {
    return {
      workflowFileName: regexResult2[1],
      triggerName: regexResult2[2],
      path: "/",
    };
  }
  return undefined;
}
