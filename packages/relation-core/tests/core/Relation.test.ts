import { expect } from "chai";
import * as path from "path";
import Relation, { RelationRevType } from "../../src/core/Relation.js";
import { IRawRelation } from "../../src/types.js";
import {
  minimumFromContent,
  minimumFromPath,
  minimumToContent,
  minimumToPath,
  relationTestRepoPath,
  resetTestRepo,
  writeTestFile,
} from "../common.js";

describe("Relation", () => {
  afterEach(() => {
    resetTestRepo();
  });

  describe("revision type", () => {
    it("git rev should correct", async () => {
      const relation = new Relation({
        fromGitRev: "fromGitRev",
        toGitRev: "toGitRev",
        fromContentRev: "fromContentRev",
        toContentRev: "toContentRev",
      });

      expect(relation.fromRevType).to.be.eql(RelationRevType.git);
      expect(relation.toRevType).to.be.eql(RelationRevType.git);
    });

    it("content rev should correct", async () => {
      const relation = new Relation({
        fromContentRev: "fromContentRev",
        toContentRev: "toContentRev",
      });

      expect(relation.fromRevType).to.be.eql(RelationRevType.content);
      expect(relation.toRevType).to.be.eql(RelationRevType.content);
    });
  });

  describe("absolute path", () => {
    it("get absolute path should work", async () => {
      const relation = new Relation({
        workingDirectory: "workingDirectory",
        fromPath: "fromPath",
        toPath: "toPath",
      });

      expect(relation.fromAbsolutePath).to.be.eql(
        path.join("workingDirectory", "fromPath")
      );
      expect(relation.toAbsolutePath).to.be.eql(
        path.join("workingDirectory", "toPath")
      );
    });

    it("set absolute path should work", async () => {
      const relation = new Relation({
        workingDirectory: "workingDirectory",
        fromPath: "fromPath",
        toPath: "toPath",
        fromGitWorkingDirectory: "fromGitWorkingDirectory",
        toGitWorkingDirectory: "toGitWorkingDirectory",
      });

      relation.fromAbsolutePath = "workingDirectory/fromPath2";
      relation.toAbsolutePath = "workingDirectory/toPath2";

      expect(relation.fromPath).to.be.eql("fromPath2");
      expect(relation.toPath).to.be.eql("toPath2");
      expect(relation.fromGitWorkingDirectory).to.be.undefined;
      expect(relation.toGitWorkingDirectory).to.be.undefined;
    });
  });

  describe("absolute git working directory", () => {
    it("get absolute git working directory should work", async () => {
      const relation = new Relation({
        workingDirectory: "workingDirectory",
        fromGitWorkingDirectory: "fromGitWorkingDirectory",
        toGitWorkingDirectory: "toGitWorkingDirectory",
      });

      expect(relation.fromAbsoluteGitWorkingDirectory).to.be.eql(
        path.join("workingDirectory", "fromGitWorkingDirectory")
      );
      expect(relation.toAbsoluteGitWorkingDirectory).to.be.eql(
        path.join("workingDirectory", "toGitWorkingDirectory")
      );
    });
  });

  describe("relative git path", () => {
    it("get relative git path should work", async () => {
      const relation = new Relation({
        workingDirectory: "workingDirectory",
        fromGitWorkingDirectory: "fromGitWorkingDirectory",
        toGitWorkingDirectory: "toGitWorkingDirectory",
        fromPath: "fromGitWorkingDirectory/fromPath",
        toPath: "toGitWorkingDirectory/toPath",
      });

      expect(relation.fromRelativeGitPath).to.be.eql("fromPath");
      expect(relation.toRelativeGitPath).to.be.eql("toPath");
    });
  });

  describe("current content", () => {
    it("get current content should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
      });

      expect(relation.fromCurrentContent).to.be.eql(minimumFromContent);
      expect(relation.toCurrentContent).to.be.eql(minimumToContent);
    });
  });

  describe("git content", () => {
    it("get git content should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
      });

      expect(await relation.getFromGitContent("@")).to.be.eql(
        minimumFromContent
      );
      expect(await relation.getToGitContent("@")).to.be.eql(minimumToContent);
    });
  });

  describe("original content", () => {
    it("get original content should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        fromGitRev: "768b50b1c1d8da264596bc5c06dd1563ebd59dc3",
        toGitRev: "768b50b1c1d8da264596bc5c06dd1563ebd59dc3",
      });

      expect(await relation.getFromOriginalContent()).to.be.eql(
        minimumFromContent
      );
      expect(await relation.getToOriginalContent()).to.be.eql(minimumToContent);
    });
  });

  describe("set content", () => {
    it("set content should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
      });

      relation.setFromContent("fromContent");
      relation.setToContent("toContent");

      expect(relation.fromContentRev).to.be.eql(
        "8b39b427a99b32a1383bb835fa60960dc4aad6f4"
      );
      expect(relation.toContentRev).to.be.eql(
        "585f2dc679618352e5c8febb98c7b79a9aeabc1c"
      );
    });
  });

  describe("set git info", () => {
    it("set git info should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
      });

      await relation.setFromGitInfo({
        rev: "@",
      });
      await relation.setToGitInfo({
        rev: "@",
      });

      expect(relation.fromGitWorkingDirectory).to.be.undefined;
      expect(relation.fromGitRev).to.be.exist;
      expect(relation.toGitWorkingDirectory).to.be.undefined;
      expect(relation.toGitRev).to.be.exist;
    });
  });

  describe("to object", () => {
    it("to object should work", async () => {
      const obj: IRawRelation = {
        id: "id",
        fromRange: [1, 2],
        toRange: [1, 2],
        fromPath: minimumFromPath,
        toPath: minimumToPath,
      };

      const relation = new Relation({
        ...obj,
        workingDirectory: relationTestRepoPath,
      });

      const relationObj = JSON.parse(JSON.stringify(relation.toJSON()));

      expect(relationObj).to.be.eql(obj);
    });
  });

  describe("autoSetFromRev", () => {
    it("should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        fromRange: [1, 2],
      });

      await relation.autoSetFromRev();

      expect(relation.fromGitRev).to.be.a("string");
    });

    it("content mode should work", async () => {
      writeTestFile(minimumFromPath, "a\nb\nc\n");

      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        fromRange: [1, 2],
      });

      await relation.autoSetFromRev();

      expect(relation.fromGitRev).to.be.undefined;
      expect(relation.fromContentRev).to.be.a("string");
    });
  });

  describe("autoSetToRev", () => {
    it("should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        toRange: [1, 2],
      });

      await relation.autoSetToRev();

      expect(relation.toGitRev).to.be.a("string");
    });

    it("content mode should work", async () => {
      writeTestFile(minimumToPath, "a\nb\nc\n");

      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        toRange: [1, 2],
      });

      await relation.autoSetToRev();

      expect(relation.toGitRev).to.be.undefined;
      expect(relation.toContentRev).to.be.a("string");
    });
  });

  describe("getViewerRelationAndContents", () => {
    it("should work", async () => {
      const relation = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
        fromRange: [1, 2],
        toRange: [1, 2],
      });

      await relation.autoSetFromRev();
      await relation.autoSetToRev();

      const [
        viewerRelation,
        viewerContents,
      ] = await relation.getViewerRelationAndContents();

      expect(viewerRelation.originalFromViewerContentRev).to.be.a("string");
      expect(viewerRelation.originalToViewerContentRev).to.be.a("string");
      expect(Object.keys(viewerContents)).to.be.lengthOf(2);
    });
  });
});
