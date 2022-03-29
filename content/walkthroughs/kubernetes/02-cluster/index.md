---
title: "Kickstart the cluster"
date: 2020-11-16T02:35:47+01:00
draft: false
weight: 30
layout: single
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
---

## Create the cluster config file

{{< expand "References" >}}
* <https://stackoverflow.com/a/60391611>
{{</ expand >}}

We are now going to configure the cluster. For the sake of traceability, this configuration won't be done via CLI flags, but via [a configuration file](<!-- TODO -->). The path of the cluster config file will later be referenced as the {{< var "cluster.configFile" >}}, and **should** be inside `/etc/kubernetes`.

Following [flannel requirements](https://github.com/coreos/flannel/blob/master/Documentation/kubernetes.md#kubeadm), you need to use `--pod-network-cidr` with address `10.244.0.0./16`. This CLI option is equivalent to `networking.podSubnet` in our {{< var "cluster.configFile" >}} file (see [this issue](https://github.com/kubernetes/kubeadm/issues/1899)).

The variable {{< var "cluster.advertiseAddress" >}} must be set to the network address of your master node **through the *VPN***. You can get it like so:

```sh
ip -4 a show tun0 | grep -Po 'inet \K[0-9.]*'
```

The variables {{< var "audit.sourceLogDir" >}} & {{< var "audit.sourceLogFile" >}} were set in {{< linkToPage "../01-audit-log" >}}

{{< includeCodeFile "./kubernetes/cluster-config.yaml" >}}

```sh
mv ./kubernetes/cluster-config.yaml {{cluster.configFile}}
chown root:root {{cluster.configFile}}
chmod 600 {{cluster.configFile}}
```

## Finally, init the cluster

{{< expand "References" >}}
* <https://godoc.org/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta2>
* <https://github.com/coreos/flannel/blob/master/Documentation/kubernetes.md>
* <https://github.com/kubernetes/kubeadm/issues/203#issuecomment-335416377>
* <https://coreos.com/os/docs/latest/using-systemd-drop-in-units.html>
* <https://discuss.kubernetes.io/t/flannel-yaml-file-customization-iface-for-vagrant-linux-cluster/4873>
{{</ expand >}}

Pay attention to the feedbacks of the `kubeadm` command. It will show warnings about misconfigurations.

```sh
# Init the cluster with our cluster config file
kubeadm init --config {{cluster.configFile}}
# Setup kubectl
mkdir -p $HOME/.kube && cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && chown $(id -u):$(id -g) $HOME/.kube/config
```

Now, the kubelet has been configured. Well, mainly. Because, as mentioned [here](https://github.com/kubernetes/kubeadm/issues/203), it assumes that it should work through the default gateway (our public network), but that's not what we want. So, we need to explicitly declare our node's IP.

```sh
sed -i.bak "s/KUBELET_EXTRA_ARGS=/KUBELET_EXTRA_ARGS=--node-ip=$(ip -4 a show tun0 | grep -Po 'inet \K[0-9.]*') /" /etc/sysconfig/kubelet
systemctl restart kubelet.service
# Verify that the `--node-ip` flag is appended to the `/usr/bin/kubelet` process
systemctl status kubelet.service
```

To communicate with each other, pods need a network layer. We'll use *flannel* for this. Following its [installation instruction](https://github.com/coreos/flannel#deploying-flannel-manually), you need to deploy [this file](https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml). But there's a problem: as mentioned in the [configuration documentation](https://github.com/coreos/flannel/blob/master/Documentation/configuration.md#key-command-line-options), *flannel* use the default route (our public network) by default, and we still want to use the VPN fio this. So, I've just added a single line in the [kube-flannel file](https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml) to specify our VPN interface (line 188, `- --iface=tun0`).

{{< includeCodeFile "./kubernetes/flannel.yaml" >}}

```sh
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


```sh
sed -i.bak "s/KUBELET_EXTRA_ARGS=/KUBELET_EXTRA_ARGS=--node-ip=$(ip -4 a show tun0 | grep -Po 'inet \K[0-9.]*') /" /etc/sysconfig/kubelet
systemctl restart kubelet.service
# Verify that the --node-ip flag is appended to the /usr/bin/kubelet process
systemctl status kubelet.service
```

You can check nodes by running following command from the control pane

```sh
kubectl get nodes
# Or watch
kubectl get nodes -w
```

After some time, you should see the new node joining the cluster !

You may repeat this part of the process during the life of your cluster to add new nodes.

## Initialize metallb

{{< expand "References" >}}
* <https://metallb.universe.tf/installation/>
{{</ expand >}}

Create a metallb configmap, from the {{< linkToIncludedFile "./kubernetes/metallb-configmap.yaml" >}} template. [See the docs](https://metallb.universe.tf/configuration/$docs) for full reference on this config file & how to adapt it to your network configuration..

The {{< var "cluster.networkAddress" >}} corresponds to the network part of your {{< var "cluster.advertiseAddress" >}}.

{{< includeCodeFile "./kubernetes/metallb-configmap.yaml" >}}

```sh
# Deploy metallb
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.5/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.5/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
# Create the configmap
kubectl apply -f ./kubernetes/metallb-configmap.yaml
```

---

To check if everything works so far, start a test nginx instance:

```sh
kubectl create namespace nginx-test
kubectl --namespace nginx-test run nginx --image nginx
# This may take some time to fetch the container
kubectl --namespace nginx-test expose pod nginx --port 80 --type LoadBalancer
nginx_ip="$(kubectl --namespace nginx-test get svc nginx --output json | jq --raw-output '.status.loadBalancer.ingress[].ip')"
if [[ ! -z "$nginx_ip" ]]; then
    echo -e "$(tput setaf 2)Has public IP $nginx_ip. Testing connection. If nothing appears bellow, you might have a firewall configuration issue.$(tput sgr0)"
    if ! timeout 5 curl http://$nginx_ip ; then
        echo -e "$(tput setaf 1)nginx unreachable. You might have a firewall configuration issue.$(tput sgr0)"
    fi
else
    echo "No public IP"
fi
unset nginx_ip
```

This should return `Has public IP` with an IP that should be reachable from the host & the HTML of the default nginx page. If not, then you might have additional configuration to do.

Cleanup the namespace afterwards

```sh
kubectl delete namespace nginx-test
```

{{< commitAdvice >}}

## Troubleshoot

### Kubelet is not running

I had to reinstall `kubelet` to clear previous runs configurations.

```sh
dnf reinstall -y kubelet kubeadm kubectl --disableexcludes=kubernetes
```

### Nginx external ip is always `pending`

{{< expand "References" >}}
* <https://stackoverflow.com/a/60151612>
{{< /expand >}}

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
* <https://blog.heptio.com/properly-resetting-your-kubeadm-bootstrapped-cluster-nodes-heptioprotip-473bd0b824aa>
* <https://stackoverflow.com/a/46438072>
* <https://stackoverflow.com/a/46480447/4839162>
{{</ expand >}}

```sh
iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X
ip link delete cni0
ip link delete flannel.1
```

## Usefull commands memo

* Force reinit cluster: 
  ```sh
  ( sudo kubeadm reset -f && sudo rm -rf /etc/cni/net.d || 1 ) && \
    sudo kubeadm init --config cluster-config.yaml
  ```