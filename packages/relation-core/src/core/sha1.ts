import * as crypto from "node:crypto";

export const sha1 = (str) => {
  const sha1hex = crypto
    .createHash("sha1")
    .update(JSON.stringify(str))
    .digest("hex");
  return sha1hex;
};
