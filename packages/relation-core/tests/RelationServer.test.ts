import { expect } from "chai";
import path from "path";
import { getKey } from "../src/core/getKey.js";
import RelationServer from "../src/RelationServer.js";
import {
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

      const relation = await relationServer.create({
        fromPath: path.join(
          relationTestRepoPath,
          "RelationServer-create-test1"
        ),
        fromRange: [1, 2],
        toPath: path.join(relationTestRepoPath, "RelationServer-create-test2"),
        toRange: [2, 3],
        fromContent: "fromContent\nfromContent\nfromContent\n",
        toContent: "toContent\ntoContent\ntoContent\n",
      });

      expect(relation).to.be.eql({
        id: relation.id,
        fromRange: [1, 2],
        toRange: [2, 3],
        fromPath: "RelationServer-create-test1",
        toPath: "RelationServer-create-test2",
        fromContentRev: "5bc52a57d603524c5b44d8589a8a0370bbdbb5a1",
        toContentRev: "11d8e7b6d67e8dbc2c0a0b60a30f64a45bdaadc7",
      });
    });

    it("Should work when using git", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const relation = await relationServer.create({
        fromPath: path.join(relationTestRepoPath, "markdown/README.md"),
        fromRange: [1, 2],
        toPath: path.join(relationTestRepoPath, "markdown/README.zh-CN.md"),
        toRange: [2, 3],
        fromGitRev: "HEAD",
        toGitRev: "HEAD",
      });

      expect(relation).to.be.eql({
        id: relation.id,
        fromRange: [1, 2],
        toRange: [2, 3],
        fromPath: "markdown/README.md",
        toPath: "markdown/README.zh-CN.md",
        fromGitRev: relation.fromGitRev,
        toGitRev: relation.toGitRev,
      });
    });
  });

  describe("getRelationsWithContentsByKey method", () => {
    it("Should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const content = "fromContent\nfromContent\nfromContent\n";
      const fullPath = writeTestFile(
        "RelationServer-getRelationsWithContentsByKey-test1",
        content
      );

      const relation = await relationServer.create({
        fromPath: fullPath,
        fromContent: content,
        fromRange: [1, 2],

        toPath: path.join(relationTestRepoPath, "markdown/README.zh-CN.md"),
        toGitRev: "HEAD",
        toRange: [2, 3],
      });

      relationServer.write([relation]);

      const {
        relationsWithContentInfo,
        contents,
      } = await relationServer.getRelationsWithContentsByKey(getKey(relation));

      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;
      expect(relationsWithContentInfo[0]._modifiedFromContentRev).to.be.exist;

      expect(contents["5bc52a57d603524c5b44d8589a8a0370bbdbb5a1"]).to.be.eql(
        content
      );
    });
  });
});
