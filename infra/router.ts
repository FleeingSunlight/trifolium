import * as gcp from "@pulumi/gcp";
import * as vpc from "./vpc";

export function cloudNAT() {
  const router = new gcp.compute.Router("trifolium-router", {
    region: vpc.subnetwork.region,
    network: vpc.network.id,
    bgp: {
      asn: 64514,
    },
  });
  new gcp.compute.RouterNat("trifolium-router-nat", {
    router: router.name,
    region: router.region,
    natIpAllocateOption: "AUTO_ONLY",
    sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
    logConfig: {
      enable: true,
      filter: "ERRORS_ONLY",
    },
  });
}
