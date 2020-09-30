import crypto from "crypto";
import objectHash from "node-object-hash";
const hasher = objectHash({
  coerce: false,
  alg: `md5`,
  enc: `hex`,
  sort: {
    map: true,
    object: true,
    array: false,
    set: false,
  },
});

const hashPrimitive = (input: string | number) => {
  let key = "";
  if (typeof input !== "string") {
    key = input.toString();
  } else {
    key = input;
  }
  return crypto.createHash(`md5`).update(key).digest(`hex`);
};

/**
 * Hashes an input using md5 hash of hexadecimal digest.
 *
 * @param input The input to encrypt
 * @return The content digest
 */

export const createContentDigest = (
  input: string | number | unknown
): string => {
  if (typeof input === `object`) {
    return hasher.hash(input);
  }

  return hashPrimitive(input as string);
};
