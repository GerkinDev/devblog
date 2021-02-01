---
title: "Troubleshooting"
date: 2020-11-16T02:35:47+01:00
draft: true
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
- Troubleshooting
---

## Networking

https://linoxide.com/how-tos/how-to-flush-routing-table-from-cache/

{{< notice "info" "To try" >}}
Flush cached routes

```sh
# Show cache
ip route show cache
# Flush cache
ip route flush cache
```
{{</ notice >}}

{{< notice "danger" "Last resort" >}}
In the worst case, fully reset routing

```sh
ip route flush table main
```
{{</ notice >}}

### Can't reach ClusterIP from node 

https://stackoverflow.com/a/54849731

```sh
iptables --flush
iptables -tnat --flush
systemctl restart docker
```

### Totally reset flannel

https://stackoverflow.com/a/46438072/4839162

```sh
# Delete the flannel daemonset
kubectl -n kube-system delete daemonset kube-flannel-ds
# Purge the flannel network configurations
rm -r /etc/cni/net.d/10-flannel.conflist
# Remove the networks created by flannel
ip link delete cni0
ip link delete flannel.1
# Flush the rules
iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X
```

Then, you may reinstall flannel.

Remember that at this point, changes to iptables are applied **until the machine is shut down**. To persist the changes, because things are now fixed, run:

```sh
iptables-save
```

