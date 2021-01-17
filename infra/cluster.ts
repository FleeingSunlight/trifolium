import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as config from "./config";
import * as vpc from "./vpc";
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

export const cluster = new gcp.container.Cluster(
  "trifolium-cluster",
  {
    initialNodeCount: 1,
    removeDefaultNodePool: true,
    location: 'asia-southeast1-a',
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
    network: vpc.network.selfLink,
    subnetwork: vpc.subnetwork.selfLink,
  },
  {
    dependsOn: vpc.subnetwork,
    parent: vpc.subnetwork,
  }
);

export const nodePool = new gcp.container.NodePool(
  "trifolium-node-pool",
  {
    cluster: cluster.name,
    initialNodeCount: config.nodeCount,
    location: cluster.location,
    nodeConfig: {
      preemptible: true,
      machineType: config.nodeMachineType,
      oauthScopes: [
        "https://www.googleapis.com/auth/compute",
        "https://www.googleapis.com/auth/devstorage.read_only",
        "https://www.googleapis.com/auth/logging.write",
        "https://www.googleapis.com/auth/monitoring",
      ],
    },
    version: config.masterVersion,
    management: {
      autoRepair: true,
    },
  },
  {
    dependsOn: cluster,
    parent: cluster,
  }
);

export const kubeconfig = pulumi
  .all([cluster.name, cluster.endpoint, cluster.masterAuth])
  .apply(([name, endpoint, auth]) => {
    const context = gcp.config.project + "_" + gcp.config.zone + "_" + name;
    return ejs.render(
      fs.readFileSync(path.resolve(__dirname, "gke-template.yaml"), "utf-8"),
      {
        clusterCertificate: auth.clusterCaCertificate,
        server: "https://" + endpoint,
        context: context,
      }
    );
  });

export const provider = new k8s.Provider(
  "trifolium-k8s",
  {
    kubeconfig,
  },
  {
    dependsOn: nodePool,
  }
);
