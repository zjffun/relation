import { expect } from "chai";
import path from "path";
import { getKey } from "../src/core/getKey.js";
import RelationServer from "../src/RelationServer.js";
import {
  minimumFromPath,
  minimumToPath,
  relationTestRepoPath,
  resetTestRepo,
  writeTestFile,
} from "./common.js";

describe("RelationServer", () => {
  afterEach(() => {
    resetTestRepo();
  });

  describe("create method", () => {
    it("Should work when using content", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      writeTestFile(
        minimumFromPath,
        "updated one\nupdated two\n updated three\n"
      );
      writeTestFile(minimumToPath, "更新一\n更新二\n更新三\n");

      const relation = await relationServer.create({
        fromAbsolutePath: path.join(relationTestRepoPath, minimumFromPath),
        fromRange: [1, 2],
        toAbsolutePath: path.join(relationTestRepoPath, minimumToPath),
        toRange: [2, 3],
      });

      expect(relation).to.deep.own.include({
        id: relation.id,
        fromRange: [1, 2],
        toRange: [2, 3],
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        fromContentRev: "787167ec5306e2aaa2be40092d01e4942290828b",
        toContentRev: "c18f56f7c0ba1818c5bce5ccef7b30527ac52dc4",
      });
    });

    it("Should work when using git", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const relation = await relationServer.create({
        fromAbsolutePath: path.join(relationTestRepoPath, minimumFromPath),
        fromRange: [1, 2],
        toAbsolutePath: path.join(relationTestRepoPath, minimumToPath),
        toRange: [2, 3],
      });

      expect(relation).to.deep.own.include({
        id: relation.id,
        fromRange: [1, 2],
        toRange: [2, 3],
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        fromGitRev: relation.fromGitRev,
        toGitRev: relation.toGitRev,
        fromGitWorkingDirectory: "",
        toGitWorkingDirectory: "",
      });
    });
  });

  describe("getRelationsWithContentsByKey method", () => {
    it.only("Should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const relation = await relationServer.create({
        fromAbsolutePath: path.join(relationTestRepoPath, minimumFromPath),
        fromRange: [1, 2],
        toAbsolutePath: path.join(relationTestRepoPath, minimumToPath),
        toRange: [2, 3],
      });

      relationServer.write([relation as any]);

      const {
        relationsWithContentInfo,
        contents,
      } = await relationServer.getRelationsWithContentsByKey(
        getKey(relation as any)
      );

      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
    });
  });
});
