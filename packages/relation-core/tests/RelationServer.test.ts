import { expect } from "chai";
import * as path from "node:path";
import RelationServer from "../src/RelationServer.js";
import {
  markdownFromPath,
  markdownToPath,
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

  describe("checkIsInit", () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);
      expect(relationServer.checkIsInit()).to.be.true;
    });
  });

  describe("init", () => {
    it("should work", async () => {
      const tempDirPath = path.join(relationTestRepoPath, "temp");
      const relationServer = new RelationServer(tempDirPath);

      expect(relationServer.init()).to.be.true;
    });
  });

  describe("read", () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      expect(relationServer.read()).to.be.an("array");
    });
  });

  describe("write", () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);
      relationServer.write([]);

      expect(relationServer.read()).to.be.eql([]);
    });
  });

  describe("createMarkdownRelations", async () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const relations = await relationServer.createMarkdownRelations({
        fromAbsolutePath: path.join(relationTestRepoPath, markdownFromPath),
        toAbsolutePath: path.join(relationTestRepoPath, markdownToPath),
      });

      expect(relations).to.be.an("array");
    });
  });

  describe("create", () => {
    it("should work when using content", async () => {
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

    it("should work when using git", async () => {
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
        fromGitWorkingDirectory: undefined,
        toGitWorkingDirectory: undefined,
      });
    });
  });

  describe("filter", () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);
      const id = "9c0tjeuc6e";
      const relations = relationServer.filter((relation) => {
        return relation.id === id;
      });

      expect(relations[0]).to.deep.own.include({
        id: id,
        fromPath: "markdown/README.md",
        toPath: "markdown/README.zh-CN.md",
        fromRange: [1, 4],
        toRange: [1, 4],
        fromGitRev: "768b50b1c1d8da264596bc5c06dd1563ebd59dc3",
        toGitRev: "768b50b1c1d8da264596bc5c06dd1563ebd59dc3",
      });
    });
  });

  describe("updateById", () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const id = "9c0tjeuc6e";

      await relationServer.updateById(id, (relation) => {
        relation.fromRange = [5, 5];
        relation.toRange = [6, 6];
        return relation;
      });

      const relations = relationServer.filter((relation) => {
        return relation.id === id;
      });

      expect(relations[0]).to.deep.own.include({
        id: id,
        fromPath: "markdown/README.md",
        toPath: "markdown/README.zh-CN.md",
        fromRange: [5, 5],
        toRange: [6, 6],
        fromGitRev: "768b50b1c1d8da264596bc5c06dd1563ebd59dc3",
        toGitRev: "768b50b1c1d8da264596bc5c06dd1563ebd59dc3",
      });
    });
  });

  describe("getRelationViewerData", () => {
    it("should work", async () => {
      const relationServer = new RelationServer(relationTestRepoPath);

      const relations = relationServer.filter(
        (relation) =>
          relation.fromAbsolutePath ===
            relation.getAbsolutePath(markdownFromPath) &&
          relation.toAbsolutePath === relation.getAbsolutePath(markdownToPath)
      );

      const relationViewerData = await relationServer.getRelationViewerData(
        relations
      );

      expect(relationViewerData?.fromPath).to.be.eq(markdownFromPath);
      expect(relationViewerData?.toPath).to.be.eq(markdownToPath);
      expect(relationViewerData?.fromModifiedContent).to.be.a("string");
      expect(relationViewerData?.toModifiedContent).to.be.a("string");
    });
  });
});
