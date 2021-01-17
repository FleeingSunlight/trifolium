import * as k8s from "@pulumi/kubernetes";
import * as cluster from "./cluster";
import * as gcp from "@pulumi/gcp";
import * as vpc from "./vpc";

const router = new gcp.compute.Router("trifolium-router", {
  region: vpc.subnetwork.region,
  network: vpc.network.id,
  bgp: {
    asn: 64514,
  },
});

const routerNAT = new gcp.compute.RouterNat(
  "trifolium-router-nat",
  {
    router: router.name,
    region: router.region,
    natIpAllocateOption: "AUTO_ONLY",
    sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
    logConfig: {
      enable: true,
      filter: "ERRORS_ONLY",
    },
  },
  {
    dependsOn: router,
  }
);

const traefik = new k8s.helm.v3.Chart(
  "traefik",
  {
    chart: "traefik",
    fetchOpts: {
      repo: "https://helm.traefik.io/traefik",
    },
    values: {
      persistence: {
        enabled: true,
        accessMode: "ReadWriteOnce",
        size: "50Mi",
        path: "/data",
      },
      dashboard: {
        ingressRoute: true,
      },
      ports: {
        traefik: {
          expose: true,
        },
      },
      additionalArguments: [
        "--api.insecure",
        "--accesslog",
        "--entrypoints.web.Address=:8000",
        "--entrypoints.websecure.Address=:4443",
        "--certificatesresolvers.myresolver.acme.tlschallenge",
        "--certificatesresolvers.myresolver.acme.email=acme@fleeingsunlight.dev",
        "--certificatesresolvers.myresolver.acme.storage=/data/acme.json",
        "--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory",
      ],
    },
  },
  {
    provider: cluster.provider,
    dependsOn: routerNAT,
  }
);

export let kubeconfig = cluster.kubeconfig;
