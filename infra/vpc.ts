import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export const network = new gcp.compute.Network("trifolium-network", {
  autoCreateSubnetworks: false,
});

export const subnetwork = new gcp.compute.Subnetwork("trifolium-subnetwork", {
  ipCidrRange: "10.2.0.0/16",
  region: "asia-southeast1",
  network: network.selfLink,
}, {
  dependsOn: network,
  parent: network
});
