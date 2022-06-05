import data from "../../checkresult.json";
import { createView } from "./createView";

const record = data[0][1][0];

if (typeof record !== "string") {
  createView(".container", {
    texts: [record.content1old, record.content1new],
    relations: [record.viewRelation],
  });
}
