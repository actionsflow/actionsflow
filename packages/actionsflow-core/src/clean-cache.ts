import { getTriggerCache, getTriggerManageCache } from "./trigger";
import { getWorkflowDoc } from "./workflow";
import path from "path";
import { log } from "./log";
export const cleanCache = async ({
  cwd,
  workflowRelativePath,
  triggerName,
}: {
  cwd?: string;
  workflowRelativePath: string;
  triggerName?: string;
}): Promise<void> => {
  if (triggerName) {
    try {
      const triggerCache = getTriggerCache({
        name: triggerName,
        workflowRelativePath,
      });

      await triggerCache.reset();
      const triggerManageCache = getTriggerManageCache({
        name: triggerName,
        workflowRelativePath,
      });
      await triggerManageCache.reset();
      log.info(
        `Clean trigger [${triggerName}] cache of workflow ${workflowRelativePath} success`
      );
    } catch (error) {
      log.warn("Clean cache failed: ", error);
    }
  } else {
    cwd = cwd || process.cwd();
    // get all triggers of the cache
    const filePath = path.resolve(cwd, "workflows", workflowRelativePath);
    const doc = await getWorkflowDoc({ path: filePath });
    let triggers: string[] = [];
    if (doc && typeof doc === "object" && doc.on) {
      // handle doc on, replace variables
      if (doc.on && typeof doc.on === "object") {
        triggers = Object.keys(doc.on);
      }
    }
    if (triggers.length > 0) {
      for (let i = 0; i < triggers.length; i++) {
        try {
          const triggerCache = getTriggerCache({
            name: triggers[i],
            workflowRelativePath,
          });
          await triggerCache.reset();
          const triggerManageCache = getTriggerManageCache({
            name: triggers[i],
            workflowRelativePath,
          });
          await triggerManageCache.reset();
        } catch (error) {
          log.warn("Clean cache failed: ", error);
        }
      }
    }
    log.info(`Clean workflow ${workflowRelativePath} cache success`);
  }
};
