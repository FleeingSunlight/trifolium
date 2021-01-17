# https://github.com/bitnami-labs/sealed-secrets/blob/master/docs/GKE.md#master-to-node-firewall
MASTER_IPV4_CIDR=$(gcloud container clusters describe $CLUSTER_NAME \
  | grep "masterIpv4CidrBlock: " \
  | awk '{print $2}')

NETWORK=$(gcloud container clusters describe $CLUSTER_NAME \
  | grep "^network: " \
  | awk '{print $2}')

NETWORK_TARGET_TAG=$(gcloud compute firewall-rules list \
  --filter network=$NETWORK --format json \
  | jq ".[] | select(.name | contains(\"$CLUSTER_NAME\"))" \
  | jq -r '.targetTags[0]' | head -1)

echo $MASTER_IPV4_CIDR $NETWORK $NETWORK_TARGET_TAG

gcloud compute firewall-rules create gke-to-kubeseal-8080 \
  --network "$NETWORK" \
  --allow "tcp:8080" \
  --source-ranges "$MASTER_IPV4_CIDR" \
  --target-tags "$NETWORK_TARGET_TAG" \
  --priority 1000
