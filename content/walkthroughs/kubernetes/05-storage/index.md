---
title: "Make things persistent"
date: 2020-11-16T02:35:47+01:00
draft: true
weight: 50
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
- Storage
---

{{< expand "References" >}}
* [:book: persistent volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
* https://www.youtube.com/watch?v=0swOh5C3OVM
{{< /expand >}}



As you may know, docker (and thus, kubernetes) does not persist anything by default. That means that everytime you restart a pod (container), it is in the exact same state as it was at its first execution, except for the mount points. Those mount points are real hard drive directories injected into your pod. Some apps we'll setup later will require to persist data, and, more generally, when you'll run real applications on your own, they will probably use a database or something.

> Seeing how this part is highly tied with your specific setup, you **should really** do this part by yourself using the references above. But in case you want a basic thing working, I'll guide you through the setup of [CephFS]().
>
> :exclamation: I repeat myself, but you **should really** do this part by yourself. **Do not** use those as-is if you are using your cluster to host real applications. But just like you, I'm doing tests here and I am tired of walking around the whole internet just to experiment a few things.

Now that I've warned you enough (just look above, **again**), let's declare a [:book: persistent volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) !

The persistent volume we are about to initiate here is a *NFS* (*N*etwork *F*ile*S*ystem), that will be hosted on our master. You are totally free to host it on either one of your slave or another device outside your cluster.

https://rook.io/docs/rook/v1.4/ceph-prerequisites.html
https://rook.io/docs/rook/v1.4/k8s-pre-reqs.html
https://rook.io/docs/rook/v1.4/ceph-quickstart.html


```sh
modprobe rbd
# Auto-load them at startup
echo "rbd" > /etc/modules-load.d/cephfs.conf
```


https://rook.io/docs/rook/v1.5/ceph-quickstart.html#tldr

I use version 1.5-beta.0 because it is the oldest supporting kubernetes v1.19.

```sh
git clone --single-branch --branch v1.5.0-beta.0 https://github.com/rook/rook.git
cd rook/cluster/examples/kubernetes/ceph
kubectl create -f common.yaml
kubectl create -f operator.yaml
kubectl create -f cluster.yaml
kubectl apply -f dashboard-external-http.yaml
```





If you made errors and want to purge rook-ceph, remove following patterns **on each nodes** running cephfs (usually, all the worker nodes):

```sh
rm -r /var/lib/rook
rm -r /var/lib/kubelet/plugins/rook*
rm -r /var/lib/kubelet/plugins_registry/rook*
wipefs /dev/sdX # Each of the used disks
```

See https://github.com/rook/rook/issues/4553

## Declare the storage class and the provisionner

{{< expand "References" >}}
* [:book: Persistent Volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
* [:book: Dynamic Volume Provisioning](https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/)
* [:book: Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)
{{< /expand >}}

{{< commitAdvice >}}