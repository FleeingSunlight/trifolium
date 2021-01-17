import * as cluster from "./cluster";
import * as deployment from "./deployment";
import { cloudNAT } from "./router";

cloudNAT();
let traefik = deployment.traefik;

export let kubeconfig = cluster.kubeconfig;
