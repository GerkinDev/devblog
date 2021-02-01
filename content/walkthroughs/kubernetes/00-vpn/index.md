---
title: "Setup the cluster's VPN"
date: 2020-11-16T02:35:47+01:00
draft: false
weight: 10
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
- Networking
---

{{< expand "References" >}}
* [How To Run OpenVPN in a Docker Container on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-run-openvpn-in-a-docker-container-on-ubuntu-14-04)
* [Running Docker Containers with Systemd](https://blog.container-solutions.com/running-docker-containers-with-systemd)
{{</ expand >}}

Because we are installing our cluster bare metal on servers exposed on the Internet, we'll need a way to secure all of our network traffic around the critical parts of *kubernetes*. To do so, we'll use OpenVPN to create a virtual secured network where all of our nodes will work. Moreover, this network will also contains *MetalLB* services when {{< linkToPage "/walkthroughs/kubernetes/02-cluster#initialize-metallb" "configuring our bare metal load balancer" >}}.

{{< alert theme="info" >}}
You **may** need to edit your `/etc/hosts` files to associate `vpn.{{cluster.baseHostName}}` to your future *OpenVPN* server on **each of the devices that will join the cluster** (if `vpn.{{cluster.baseHostName}}` is not a real *DNS* name).

```sh
echo '{{vpn.publicServerIp}}	vpn.{{cluster.baseHostName}}' >> /etc/hosts
```
{{</ alert >}}

See the [docs of kylemanna/openvpn](https://github.com/kylemanna/docker-openvpn$docs) (our *OpenVPN* server).

## *OpenVPN* server initial setup


On the **OpenVPN server**, create a volume for OpenVPN so that it can store files, and generate configuration.
```sh
# Create the volume
docker volume create --name {{vpn.volumeName}}
# Init OpenVPN configuration & certificates
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm kylemanna/openvpn:2.3 ovpn_genconfig -Nd -u udp://vpn.{{cluster.baseHostName}}:1194
# Generate the EasyRSA PKI certificate authority. This will prompt a password, that you should keep safe. It will be used to generate new client certificates & configs
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm -it kylemanna/openvpn:2.3 ovpn_initpki
# Start the server
docker run -v {{vpn.volumeName}}:/etc/openvpn -d -p 1194:1194/udp --cap-add=NET_ADMIN kylemanna/openvpn:2.3
```

> Note on the `-Nd` flags of the line 4: see [this RTFM page](https://github.com/kylemanna/docker-openvpn/blob/master/docs/faqs.md#how-do-i-set-up-a-split-tunnel) for split tunnel (partial traffic tunnel)

Once the last command is executed, your *OpenVPN* server should start. If it started properly, just kill it. We will set it up as a systemd service for our host.

## Make a *systemd* service for *OpenVPN* through *docker*

{{< alert theme="info" >}}
If you're not using systemd, see [how to use init.d](https://www.digitalocean.com/community/tutorials/how-to-run-openvpn-in-a-docker-container-on-ubuntu-14-04#step-3-%E2%80%94-launch-the-openvpn-server), and skip this section.
{{</ alert >}}

Install the [systemd/kubernetes-vpn.service](./systemd/kubernetes-vpn.service) template into `/usr/lib/systemd/system`, then enable this service. It will run our *OpenVPN* server container.

{{< includeCodeFile "./systemd/kubernetes-vpn.service" >}}

```sh
mv ./systemd/kubernetes-vpn.service /usr/lib/systemd/system
# Reload available services to take into account our new `kubernetes-vpn`
systemctl daemon-reload
# Start & auto start it
systemctl enable --now kubernetes-vpn.service
```

You can check our docker container with `docker container inspect kubernetes-vpn.service` & get our *OpenVPN* logs with `journalctl -u kubernetes-vpn.service`.

Now, get the value of the variable {{< var "vpn.serverIp" >}} with this command:

```sh
# Show interface informations
docker exec -it kubernetes-vpn.service ifconfig tun0
# Or, fancy buggy variant to show only interface IP
docker exec -it kubernetes-vpn.service ifconfig tun0 `# Get the "tun0" interface infos` \
  | grep 'inet addr' `# Get only IPv4 related line` \
  | cut -d: -f2 | awk '{print $1}' `# Get only the IP`
```

> See [**Static IP Addresses** documentation for *docker-openvpn*](https://github.com/kylemanna/docker-openvpn/blob/master/docs/static-ips.md)

## Setup clients

This section is meant to be repeated for each of your cluster's nodes. For every node, replace the {{< var "node.ip" >}} & {{< var "node.name" >}} variables.

{{< alert theme="warning" >}}
**Important**: `node.ip` ({{node.ip}}) **must** be on the same network than `vpn.serverIp` ({{vpn.serverIp}}) (usually, `192.168.255.XXX`)
{{</ alert >}}

### Generate credentials

For each of our clients, we'll need to generate credentials so that they can connect to the vpn server. Those clients may use static IPs. The master(s) **must** have a static IP since it must be reachable via a constant address for `kubectl`.

On your *OpenVPN*'server host:

```sh
# Generate a client
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm -it kylemanna/openvpn:2.3 easyrsa build-client-full {{node.name}} nopass
# Set its static IP
echo "ifconfig-push {{node.ip}} {{vpn.serverIp}}" | docker run -v {{vpn.volumeName}}:/etc/openvpn -i --rm kylemanna/openvpn:2.3 tee /etc/openvpn/ccd/{{node.name}}
# Get its config to your host
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm kylemanna/openvpn:2.3 ovpn_getclient {{node.name}} > {{node.name}}.ovpn
```

Move this `{{node.name}}.ovpn` file to the {{node.name}} node **by a safe mean**. Those files are super critical, so be very careful to not put it anywhere usafe.

Next operations have to be run on clients.

### Install *OpenVPN* client

{{< expand "References" >}}
* <https://www.vpsserver.com/community/tutorials/4035/install-openvpn-on-centos-8/>
{{< /expand >}}

```sh
dnf install epel-release git
dnf update
dnf install openvpn
```

### Install certificates

Install the certificate previously copied with:

```sh
# Install the OpenVPN configuration
install -o root -m 400 {{node.name}}.ovpn /etc/openvpn/client/{{node.name}}.conf
# Enable the OpenVPN client
systemctl enable --now openvpn-client@{{node.name}}
```

Repeat those steps for each of our nodes, then make sure that you can reach each of your nodes from each other and you can still access the Internet.

```sh
# Check internet connection by pinging Google
ping -c 4 8.8.8.8
# Check in-VPN connection
ping -c 4 {{vpn.serverIp}}
# Eventually, check connection to other nodes
```

If you're having troubles pinging `8.8.8.8` or another's node IP, please refer to [this troubleshooting section](#no-internet-connection-on-nodes-or-no-connection-between-nodes)

---

You should be good to go :fire:

## Troubleshoot

{{< expand "References" >}}
* https://stackoverflow.com/a/63624477/4839162
{{</ expand >}}

### No internet connection on nodes, or no connection between nodes

{{< expand "References" >}}
* <https://github.com/kylemanna/docker-openvpn#openvpn-details>
* <https://github.com/kylemanna/docker-openvpn/issues/381#issuecomment-386269991>
* <https://github.com/kylemanna/docker-openvpn/issues/381#issuecomment-616009737>
{{</ expand >}}

{{< alert theme="warning" >}}
Check in case-by-case.
{{</ alert >}}

I had to add a route push in my server configuration to make it work. See <https://openvpn.net/community-resources/how-to/#expanding-the-scope-of-the-vpn-to-include-additional-machines-on-either-the-client-or-server-subnet>

```sh
docker exec -it kubernetes-vpn.service bash -c "echo 'push \"route 192.168.255.0 255.255.255.0\"' >> /etc/openvpn/openvpn.conf"
systemctl restart kubernetes-vpn.service
```

In another setup, I had to comment out `push "block-outside-dns"` from the server config file (see [this comment](https://github.com/kylemanna/docker-openvpn/issues/381#issuecomment-616009737)).

## Usefull commands demo

### Flush all routes

```sh
sudo iptables -t filter -F
sudo iptables -t filter -X
```

### Remove a client

I bet there's a better way to do this, but I noted this for myself.

```sh
# Remove your node from this file
vim /var/lib/containers/storage/volumes/{{vpn.volumeName}}/_data/pki/index.txt
docker exec -it kubernetes-vpn.service rm /etc/openvpn/pki/issued/kube-master.crt
docker exec -it kubernetes-vpn.service rm /etc/openvpn/pki/private/kube-master.key
docker exec -it kubernetes-vpn.service rm /etc/openvpn/pki/reqs/kube-master.req
```

### Regenerate client configs & copy them

```sh
OVPN_DATA=ovpn-data-cluster
clients=kube-master-1 kube-worker-1
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm kylemanna/openvpn:2.3 ovpn_genconfig -u udp://vpn.bar.com:1194
docker run -v {{vpn.volumeName}}:/etc/openvpn --rm -it kylemanna/openvpn:2.3 ovpn_initpki
sudo systemctl restart kubernetes-vpn
for client in $clients; do
    docker run -v {{vpn.volumeName}}:/etc/openvpn --rm -it kylemanna/openvpn:2.3 easyrsa build-client-full $client nopass
    docker run -v {{vpn.volumeName}}:/etc/openvpn --rm kylemanna/openvpn:2.3 ovpn_getclient $client > $client.ovpn
done
sudo install -o root -m 400 $(hostname).ovpn /etc/openvpn/client/$(hostname).conf
sudo systemctl restart openvpn-client@$(hostname)
scp kube-worker-1.ovpn gerkin@192.168.1.26:~
```