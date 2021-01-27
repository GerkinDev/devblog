---
title: "Kickstart the cluster"
date: 2020-11-16T02:35:47+01:00
draft: true
weight: 30
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
---

## Configure network requirements

Required by [flannel config](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#tabs-pod-install-3).

```sh
if [ "$(cat /proc/sys/net/bridge/bridge-nf-call-iptables)" = "1" ]; then
    echo "OK"
else
    echo "Setting bridged mode"
    sysctl net.bridge.bridge-nf-call-iptables=1
fi
```

## Create the cluster config file

{{< expand "References" >}}
* How to set bind address by config file: <https://stackoverflow.com/a/60391611>
{{< /expand >}}

Following [flannel requirements](https://github.com/coreos/flannel/blob/master/Documentation/kubernetes.md#kubeadm), you need to use `--pod-network-cidr` with address `10.244.0.0./16`. This CLI option is equivalent to `networking.podSubnet` in our :bookmark: `cluster.configFile` file. (See [this issue](https://github.com/kubernetes/kubeadm/issues/1899).)

See the [template cluster config file](../../kubernetes-templates/cluster-config.yaml).

The path of the cluster config file will later be referenced as the **variable** `cluster.configFile`. It **should** be inside `/etc/kubernetes`

## Finally, init the cluster

{{< expand "References" >}}
* [kubeadm API resources](https://godoc.org/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta2)
* [Flannel kubernetes RTFM](https://github.com/coreos/flannel/blob/master/Documentation/kubernetes.md)
{{< /expand >}}

Pay attention to the feedbacks of the `kubeadm` command. It will show warnings about misconfigurations.

```sh
# Init the cluster with our cluster config file
kubeadm init --config {{cluster.configFile}}
# Setup kubectl
mkdir -p $HOME/.kube && cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && chown $(id -u):$(id -g) $HOME/.kube/config
# Deploy flannel
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# If you want to run pods on the master (not recommended), run the following command:
kubectl taint nodes $(hostname) node-role.kubernetes.io/master-
# To undo, run the following
kubectl taint nodes $(hostname) node-role.kubernetes.io/master:NoSchedule
```

## Join workers

At the end of the `kubeadm init...` command, a join command was issued if everything went OK. Execute this command on every workers you want in your cluster. The command is something like below:

```sh
kubeadm join xxx.xxx.xxx.xxx:yyy --token foo.barqux123456 \
    --discovery-token-ca-cert-hash sha256:fed2136f5e41d654f6e6411d4f5e646512fd5
```

If lost, you can create a new one by executing following command on the control pane with:

```sh
kubeadm token create --print-join-command
```

You can check nodes by running following command from the control pane

```sh
kubectl get nodes
```

You may repeat this part of the process during the life of your cluster to add new nodes.

## Initialize metallb

<https://metallb.universe.tf/installation/>

Create a metallb configmap, from the [:clipboard: kubernetes/metallb-configmap.yaml](./kubernetes/metallb-configmap.yaml) template. [See the docs](https://metallb.universe.tf/configuration/) for full reference on this config file & how to adapt it to your network configuration..

{{< includeCodeFile "./kubernetes/metallb-configmap.yaml" >}}

```sh
# Deploy metallb
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
# Create the configmap
kubectl apply -f ./kubernetes/metallb-configmap.yaml
```

---

To check if everything works so far, start a test nginx instance:

```sh
kubectl create namespace nginx-test
kubectl run nginx --image nginx --namespace nginx-test
# This may take some time to fetch the container
kubectl expose pod nginx --port 80 --type LoadBalancer -n nginx-test
nginx_ip="$(kubectl get svc nginx -n nginx-test -o json | jq --raw-output '.status.loadBalancer.ingress[].ip')"
if {{! -z "$nginx_ip"}}; then
    echo "Has public IP $nginx_ip"
    curl http://$nginx_ip
else
    echo "No public IP"
fi
unset nginx_ip
```

This should return `Has public IP` with an IP that should be reachable from the host & the HTML of the default nginx page.

Cleanup the namespace afterwards

```sh
kubectl delete namespace nginx-test
```

---

{{< notice "success" "All set !" >}}
Hey, we've done important things here ! Maybe it's time to commit...
```sh
git add .
git commit -m "Kickstart the cluster"
```
{{< /notice >}}

## Troubleshoot

### Nginx external ip is always `pending`

{{< expand "References" >}}
* <https://stackoverflow.com/a/60151612>
{{ /expand }}

Check that iptables is patched correctly.

```sh
cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
update-alternatives --set iptables /usr/sbin/iptables-legacy
```

Check firewall, SELinux & swap

```sh
getenforce
cat /proc/swaps
```

Make sure your nodes are ready and that the networking plugin is correctly installed.

### Cluster never starts

Move or remove the existing kubeadm config file (if any) in `/etc/systemd/system/kubelet.service.d/10-kubeadm.conf`

Check firewall, getenforce & swap status.

### Network interfaces are not deleted after reseting kubeadm

{{< expand "References" >}}
* https://blog.heptio.com/properly-resetting-your-kubeadm-bootstrapped-cluster-nodes-heptioprotip-473bd0b824aa
* https://stackoverflow.com/a/46438072
{{< /expand >}}

```sh
iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X
ip link delete cni0
ip link delete flannel.1
```

## Usefull commands memo

* Force reinit cluster: 
  ```sh
( sudo kubeadm reset -f && sudo rm -rf /etc/cni/net.d || 1 ) && sudo kubeadm init --config  cluster-config.yaml
```