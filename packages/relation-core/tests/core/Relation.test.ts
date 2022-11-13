import { expect } from "chai";
import path from "path";
import Relation, { RelationRevType } from "../../src/core/Relation.js";
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
      const relationServer = new Relation({
        fromGitRev: "fromGitRev",
        toGitRev: "toGitRev",
        fromContentRev: "fromContentRev",
        toContentRev: "toContentRev",
      });

      expect(relationServer.fromRevType).to.be.eql(RelationRevType.git);
      expect(relationServer.toRevType).to.be.eql(RelationRevType.git);
    });

    it("content rev should correct", async () => {
      const relationServer = new Relation({
        fromContentRev: "fromContentRev",
        toContentRev: "toContentRev",
      });

      expect(relationServer.fromRevType).to.be.eql(RelationRevType.content);
      expect(relationServer.toRevType).to.be.eql(RelationRevType.content);
    });
  });

  describe("absolute path", () => {
    it("get absolute path should work", async () => {
      const relationServer = new Relation({
        workingDirectory: "workingDirectory",
        fromPath: "fromPath",
        toPath: "toPath",
      });

      expect(relationServer.fromAbsolutePath).to.be.eql(
        path.join("workingDirectory", "fromPath")
      );
      expect(relationServer.toAbsolutePath).to.be.eql(
        path.join("workingDirectory", "toPath")
      );
    });

    it("set absolute path should work", async () => {
      const relationServer = new Relation({
        workingDirectory: "workingDirectory",
        fromPath: "fromPath",
        toPath: "toPath",
        fromGitWorkingDirectory: "fromGitWorkingDirectory",
        toGitWorkingDirectory: "toGitWorkingDirectory",
      });

      relationServer.fromAbsolutePath = "workingDirectory/fromPath2";
      relationServer.toAbsolutePath = "workingDirectory/toPath2";

      expect(relationServer.fromPath).to.be.eql("fromPath2");
      expect(relationServer.toPath).to.be.eql("toPath2");
      expect(relationServer.fromGitWorkingDirectory).to.be.undefined;
      expect(relationServer.toGitWorkingDirectory).to.be.undefined;
    });
  });

  describe("absolute git working directory", () => {
    it("get absolute git working directory should work", async () => {
      const relationServer = new Relation({
        workingDirectory: "workingDirectory",
        fromGitWorkingDirectory: "fromGitWorkingDirectory",
        toGitWorkingDirectory: "toGitWorkingDirectory",
      });

      expect(relationServer.fromAbsoluteGitWorkingDirectory).to.be.eql(
        path.join("workingDirectory", "fromGitWorkingDirectory")
      );
      expect(relationServer.toAbsoluteGitWorkingDirectory).to.be.eql(
        path.join("workingDirectory", "toGitWorkingDirectory")
      );
    });
  });

  describe("relative git path", () => {
    it("get relative git path should work", async () => {
      const relationServer = new Relation({
        workingDirectory: "workingDirectory",
        fromGitWorkingDirectory: "fromGitWorkingDirectory",
        toGitWorkingDirectory: "toGitWorkingDirectory",
        fromPath: "fromGitWorkingDirectory/fromPath",
        toPath: "toGitWorkingDirectory/toPath",
      });

      expect(relationServer.fromRelativeGitPath).to.be.eql("fromPath");
      expect(relationServer.toRelativeGitPath).to.be.eql("toPath");
    });
  });

  describe("current content", () => {
    it("get current content should work", async () => {
      const relationServer = new Relation({
        workingDirectory: relationTestRepoPath,
        fromPath: minimumFromPath,
        toPath: minimumToPath,
      });

      expect(relationServer.fromCurrentContent).to.be.eql(minimumFromContent);
      expect(relationServer.toCurrentContent).to.be.eql(minimumToContent);
    });
  });
});
