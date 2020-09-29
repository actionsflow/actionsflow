import { fromBuffer } from "file-type";
import { lookup } from "mime-types";
import { IBinaryData } from "../interface";
import { BINARY_ENCODING } from "../constans";
import path from "path";
/**
 * Takes a buffer and converts it into the format actionsflow uses. It encodes the binary data as
 * base64 and adds metadata.
 *
 * @export
 * @param {Buffer} content
 * @param {string} [filePath]
 * @param {string} [mimeType]
 * @returns {Promise<IBinaryData>}
 */
export async function formatBinary(
  content: Buffer,
  filePath?: string,
  mimeType?: string
): Promise<IBinaryData> {
  if (!mimeType) {
    // If no mime type is given figure it out

    if (filePath) {
      // Use file path to guess mime type
      const mimeTypeLookup = lookup(filePath);
      if (mimeTypeLookup) {
        mimeType = mimeTypeLookup;
      }
    }

    if (!mimeType) {
      // Use buffer to guess mime type
      const fileTypeData = await fromBuffer(content);
      if (fileTypeData) {
        mimeType = fileTypeData.mime;
      }
    }

    if (!mimeType) {
      // Fall back to text
      mimeType = "text/plain";
    }
  }

  const returnData: IBinaryData = {
    mimeType,
    // TODO: Should program it in a way that it does not have to converted to base64
    //       It should only convert to and from base64 when saved in database because
    //       of for example an error or when there is a wait node.
    data: content.toString(BINARY_ENCODING),
  };

  if (filePath) {
    if (filePath.includes("?")) {
      // Remove maybe present query parameters
      filePath = filePath.split("?").shift();
    }

    const filePathParts = path.parse(filePath as string);

    returnData.fileName = filePathParts.base;

    // Remove the dot
    const fileExtension = filePathParts.ext.slice(1);
    if (fileExtension) {
      returnData.fileExtension = fileExtension;
    }
  }

  return returnData;
}
