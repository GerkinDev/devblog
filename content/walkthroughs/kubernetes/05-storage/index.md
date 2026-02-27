---
title: "Make things persistent"
date: 2020-11-16T02:35:47+01:00
draft: false
weight: 60
categories:
  - Kubernetes
tags:
  - Kubernetes
  - Sysadmin
  - DevOps
  - Storage
---

{{<expand "References">}}

- <https://kubernetes.io/docs/concepts/storage/persistent-volumes/>
- <https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/>
- <https://kubernetes.io/docs/concepts/storage/storage-classes/>
- <https://www.youtube.com/watch?v=0swOh5C3OVM>

{{</expand>}}

As you may know, _docker_ (and thus, _kubernetes_) does not persist anything by default. That means that everytime you restart a pod (container), it is in the exact same state as it was at its first execution, except for the mount points. Those mount points are real hard drive directories injected into your pod. Some apps we'll setup later will require to persist data, and, more generally, when you'll run real applications on your own, they will probably use a database or something.

> Seeing how this part is highly tied with your specific setup, you **should really** do this part by yourself using the references above. But in case you want a basic thing working, I'll guide you through the setup of [CephFS]().
>
> :exclamation: I repeat myself, but you **should really** do this part by yourself. **Do not** use those as-is if you are using your cluster to host real applications. But just like you, I'm doing tests here and I am tired of walking around the whole internet just to experiment a few things.

Now that I've warned you enough (just look above, **again**), let's declare a [persistent volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) !

## Setup CephFS

### Check prerequisites

{{<expand "References">}}

- [Ceph docs: General prerequisites](https://rook.io/docs/rook/v1.5/ceph-prerequisites.html)
- [Ceph docs: Kubernetes prerequisites](https://rook.io/docs/rook/v1.5/k8s-pre-reqs.html)
- [Ceph docs: Quickstart](https://rook.io/docs/rook/v1.5/ceph-quickstart.html)

{{</expand>}}

<!-- TODO: Mention in intro about free disk -->

```sh
dnf install -y lvm2
```

```sh
modprobe rbd
# Auto-load them at startup
echo "rbd" > /etc/modules-load.d/cephfs.conf
```

Make sure you have at least one unused partition or filesystem.

```sh
lsblk -f
```

Then, create resources for Cepth

```sh
mkdir -p ./kubernetes/rook/storageclass
git clone --single-branch --branch v1.5.6 https://github.com/rook/rook.git ~/rook
cp ~/rook/cluster/examples/kubernetes/ceph/{crds,common,operator,cluster}.yaml ./kubernetes/rook
# The FileSystem configuration
cp ~/rook/cluster/examples/kubernetes/ceph/filesystem.yaml ./kubernetes/rook/filesystem.yaml
# Filesystem storage class base config. See https://rook.io/docs/rook/v1.5/ceph-filesystem.html
cp ~/rook/cluster/examples/kubernetes/ceph/csi/cephfs/storageclass.yaml ./kubernetes/rook/storageclass/filesystem.yaml
# Block storage class base config. See https://rook.io/docs/rook/v1.5/ceph-block.html
cp ~/rook/cluster/examples/kubernetes/ceph/csi/rbd/storageclass.yaml ./kubernetes/rook/storageclass/block.yaml
```

Take some time to RTFM and configure `operator`, `cluster`, `filesystem`, `storageclass/filesystem` & `storageclass/block`.

Want to store on your `master` node ? Update the discover tolerations to be scheduled on the `master` node by modifying `./kubernetes/rook/operator.yaml` like below

```yaml
# ...
kind: CephCluster
metadata:
  name: rook-ceph
spec:
  placement:
    all:
      tolerations:
        - effect: NoSchedule
          key: node-role.kubernetes.io/controlplane
          operator: Exists
        - effect: NoSchedule
          key: node-role.kubernetes.io/master
          operator: Exists
```

```sh
kubectl apply -f ./kubernetes/rook/crds.yaml
kubectl apply -f ./kubernetes/rook/common.yaml
kubectl apply -f ./kubernetes/rook/operator.yaml
kubectl apply -f ./kubernetes/rook/cluster.yaml
kubectl apply -f ./kubernetes/rook/filesystem.yaml
kubectl apply -f ./kubernetes/rook/storageclass/block.yaml
kubectl apply -f ./kubernetes/rook/storageclass/filesystem.yaml
```

### Configure the rook cluster

Open your `./kubernetes/rook/cluster.yaml` file for further customization.

- The default settings save _rook_ data in `/var/lib/rook`. This can be changed by setting `dataDirHostPath`.
- If working with 1 or 2 workers, make sure that `spec.mon.count` is equal to `1` (**only for testing purposes**).
- It is highly advised to explicitly set `spec.storage`

```sh
kubectl apply -f ./kubernetes/rook/cluster.yaml
```

### Create a test PVC

{{<includeCodeFile "./kubernetes/rook/xx-PersistentNginx.yaml">}}

```sh
kubectl apply -f ./kubernetes/rook/xx-PersistentNginx.yaml
kubectl -n persistent-nginx get pvc -w
kubectl -n persistent-nginx exec -it deploy/nginx -- bash -c 'echo "Hello world !" | tee /usr/share/nginx/html/index.html'
```

Going to <http://persistent-nginx.{{cluster.baseHostName}}/index.html> should display `Hello world !`. And if you kill and restart your container, your data will be kept ;).

```sh
kubectl -n persistent-nginx exec -it deploy/nginx -- /bin/sh -c "kill 1"
```

### Dashboard

If you're planning to expose the dashboard from outside of the cluster, you have to disable `spec.dashboard.ssl` to false, since _traefik_ will do the SSL encription. Then, deploy the routing:

{{<includeCodeFile "./kubernetes/rook/dashboard-ingress.yaml">}}

```sh
kubectl apply -f ./kubernetes/rook/dashboard-ingress.yaml
```

After this, you should be able to access to ceph dashboard via <https://ceph.{{cluster.baseHostName}}>

---

- The default **username** is `admin`.
- The default **password** is stored in a secret. To get it, run:
  ```sh
  kubectl -n rook-ceph get secret rook-ceph-dashboard-password -o jsonpath="{['data']['password']}" | base64 --decode && echo
  ```

<!-- This monitor requires a single CRD from CoreOS prometheus

```sh
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/kube-prometheus/master/manifests/setup/prometheus-operator-0servicemonitorCustomResourceDefinition.yaml
``` -->

Having problems ? [RTFM](https://rook.io/docs/rook/v1.5/ceph-toolbox.html)

If you made errors and want to purge rook-ceph, remove following patterns **on each nodes** running cephfs (usually, all the worker nodes):

```sh
rm -r /var/lib/rook
rm -r /var/lib/kubelet/plugins/rook*
rm -r /var/lib/kubelet/plugins_registry/rook*
wipefs --all --force /dev/sdX # Each of the used disks
```

See https://github.com/rook/rook/issues/4553

---

{{<commitAdvice>}}
