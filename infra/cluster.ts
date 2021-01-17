import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as config from "./config";
import * as vpc from "./vpc";

export const cluster = new gcp.container.Cluster("trifolium", {
  initialNodeCount: 1,
  removeDefaultNodePool: true,
  minMasterVersion: config.masterVersion,
  masterAuth: {
    username: config.username,
    password: config.password,
  },
  privateClusterConfig: {
    enablePrivateEndpoint: true,
    enablePrivateNodes: true,
    masterIpv4CidrBlock: "172.16.0.0/28",
  },
  network: vpc.network,
  subnetwork: vpc.subnetwork,
}, {
  dependsOn: vpc.subnetwork,
  parent: vpc.subnetwork
});
