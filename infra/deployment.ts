import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as cluster from "./cluster";

export const traefik = new k8s.helm.v3.Chart(
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
    dependsOn: cluster.nodePool,
  }
);
