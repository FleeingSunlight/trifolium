import * as gcp from "@pulumi/gcp";
import { Config } from "@pulumi/pulumi";
import * as random from "@pulumi/random";

const config = new Config();

export const nodeCount = config.getNumber("nodeCount") || 2;
export const nodeMachineType = config.get("nodeMachineType") || "n1-standard-1";
export const username = config.get("username") || "admin";
export const password = new random.RandomPassword("password", {
  length: 20,
  special: true,
}).result;

const engineVersions = gcp.container.getEngineVersions({
  location: "asia-southeast1-a",
});

export const masterVersion = engineVersions.then(
  (it) => it.latestMasterVersion
);
