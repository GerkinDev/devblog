---
title: Scaling up
date: 2020-11-22T04:03:47+01:00
draft: false
weight: 110
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
---

Your setup is running, everything runs smoothly, and suddenly, :bangbang: nothing is responding: your cluster is overloaded.

Well, I hope you'll expand your cluster capacity before it happens. It's always really bad and stressful to do maintenance because of downtime.

Hopefully, here comes the real huge advantage of *kubernetes*: it is meant to scale, up, and down. So, assuming you have followed the full guide so far, let's review together how to add some juice to our cluster :zap:.

## Join the cluster's VPN

In the step [00 Setup the cluster's VPN](<!-- TODO -->), we have set up a VPN so that each of our nodes can communicate safely with each others, on their own virtual network across the internet. This comes with the great power of being able to have servers spread all around the globe.

### From the *OpenVPN server node*

So, log in to the **OpenVPN master server**, and run the following to generate a configuration for your brand new machine:

```sh
# Generate a client
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm -it kylemanna/openvpn:2.3 easyrsa build-client-full {{newNode.name}} nopass
# Set its static IP
echo "ifconfig-push {{newNode.vpnIp}} {{vpn.serverIp}}" | docker run -v {{vpn.volumeName}}:/etc/openvpn -i --rm kylemanna/openvpn:2.3 tee /etc/openvpn/ccd/{{newNode.name}}
# Get its config to your host
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm kylemanna/openvpn:2.3 ovpn_getclient {{newNode.name}} > {{newNode.name}}.ovpn
```

Then, move `{{newNode.name}}.ovpn` to your new node **by a safe mean**.

### From the new node

Install *OpenVPN*:

```sh
dnf install epel-release
dnf install openvpn
```

{{< alert theme="info" >}}
Add the *OpenVPN* server to your `/etc/hosts` file (if not a real *DNS* name).

```sh
echo '{{vpn.publicServerIp}}	vpn.{{cluster.baseHostName}}' >> /etc/hosts
```
{{</ alert >}}

Install the *OpenVPN* configuration you just copied

```sh
# Install the OpenVPN configuration
install -o root -m 400 {{newNode.name}}.ovpn /etc/openvpn/client/{{newNode.name}}.conf
# Enable the OpenVPN client
systemctl enable --now openvpn-client@{{newNode.name}}
```

Finally, check if everything works as expected and you can reach both internet and your neighbor nodes

```sh
# Check internet connection
ping -c 4 8.8.8.8
# Check in-VPN connection
ping -c 4 192.168.255.1
```

## Join the cluster

Since I assume you've initialized your cluster a while ago, and your previous cluster's *join token* is expired, we are going to create a new one and use it.

If you've just created your cluster, you can check out [02 - Kickstart the cluster](../02-cluster/#join-workers)

### From any account or node with cluster admin capabilities

Create a new cluster token:

```sh
kubeadm token create --print-join-command
```

{{< expand "Sample output" >}}
```
kubeadm join 192.168.255.10:6443 --token gmedpt.veqzvuhcazac26gf --discovery-token-ca-cert-hash sha256:cb316693e48403ff18f840d47930f6737744d2ead362838695df3a1e1400cec1
```
{{</ expand >}}

Copy the `kubeadm join ...` command outputted by the command above.

### From the new node

Run the command copied above:

```sh
kubeadm join ...:6443 --token ... --discovery-token-ca-cert-hash sha256:....
```

If everything worked correctly, you should have an output like below:

{{< expand "Sample output" >}}
```
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -oyaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...
^[[B
This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```
{{</ expand >}}