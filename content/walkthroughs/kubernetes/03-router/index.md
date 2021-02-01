---
title: "Setup the cluster's internal router"
date: 2020-11-16T02:35:47+01:00
draft: false
weight: 40
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
- Networking
- Web service
---

{{< expand "References" >}}
* https://github.com/traefik/traefik-helm-chart/pull/157/files
{{</ expand >}}

Start by creating traefik required resources. You can directly use resources from the [kubernetes/traefik](https://github.com/GerkinDev/devblog/tree/master/content/walkthroughs/kubernetes/03-router/kubernetes/traefik) templates: it does not contain variables. Those are taken from [:books: traefik docs](https://docs.traefik.io/getting-started/install-traefik/) mixed up with [this PR](https://github.com/traefik/traefik-helm-chart/pull/157/files) for kubernetes 1.19 support and schemas.

> Please look forward for [this issue in traefik](https://github.com/traefik/traefik/issues/5473) about official v1.19 support.

{{< codes Namespace Definitions Rbac IngressController Services >}}
    {{< includeCodeFileTab "./kubernetes/traefik/0-1-Namespace.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/0-2-Definitions.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/0-3-Rbac.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/0-4-IngressController.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/0-5-Services.yaml" />}}
{{</ codes >}}

```sh
kubectl apply -f ./kubernetes/traefik/0-1-Namespace.yaml
kubectl apply -f ./kubernetes/traefik/0-2-Definitions.yaml
kubectl apply -f ./kubernetes/traefik/0-3-Rbac.yaml
kubectl apply -f ./kubernetes/traefik/0-4-IngressController.yaml
kubectl apply -f ./kubernetes/traefik/0-5-Services.yaml
```

You can now use the [:books: custom resource kind `IngressRoute`](https://docs.traefik.io/routing/providers/kubernetes-crd/) to map routes using traefik.

To check if everything works so far, you can use a test nginx instance from [:clipboard: kubernetes/0-x-TestNginx.yaml](./kubernetes/0-x-TestNginx.yaml). Once deployed, you should be able to display the nginx default page by reaching `https://test.{{cluster.baseHostName}}` from your host.

{{< includeCodeFile "./kubernetes/0-x-TestNginx.yaml" >}}

```sh
kubectl apply -f ./kubernetes/xx-TestNginx.yaml
curl -kH 'Host: test.{{cluster.baseHostName}}' "https://$(kubectl get svc traefik -n traefik -o json | jq --raw-output '.status.loadBalancer.ingress[].ip')"
```

Yes ! Our host can access traefik, that redirects the request to nginx ! Now, let the world access it.

But before that, cleanup your testing mess:

```sh
kubectl delete -f xx-TestNginx.yaml
```

{{< commitAdvice >}}
