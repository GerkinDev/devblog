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

Start by creating traefik required resources. You can directly use resources from the [kubernetes/traefik](https://github.com/GerkinDev/devblog/tree/master/content/walkthroughs/kubernetes/03-router/kubernetes/traefik) templates: it does not contain variables. Those are taken from [traefik docs](https://doc.traefik.io/traefik/v2.4/user-guides/crd-acme/#ingressroute-definition$docs) mixed up with [this PR](https://github.com/traefik/traefik-helm-chart/pull/157/files) for kubernetes 1.19 support and schemas.

> Please look forward for [this issue in traefik](https://github.com/traefik/traefik/issues/5473) about official v1.19 support.

{{< codes Namespace Definitions Rbac IngressController Services >}}
    {{< includeCodeFileTab "./kubernetes/traefik/01-Namespace.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/02-CustomResourcesDefinitions.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/03-Rbac.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/04-IngressController.yaml" />}}
    {{< includeCodeFileTab "./kubernetes/traefik/05-Services.yaml" />}}
{{</ codes >}}

```sh
kubectl apply -f ./kubernetes/traefik/01-Namespace.yaml
kubectl apply -f ./kubernetes/traefik/02-CustomResourcesDefinitions.yaml
kubectl apply -f ./kubernetes/traefik/03-Rbac.yaml
kubectl apply -f ./kubernetes/traefik/04-IngressController.yaml
kubectl apply -f ./kubernetes/traefik/05-Services.yaml
```

You can now use the [custom resource kind `IngressRoute`](https://docs.traefik.io/routing/providers/kubernetes-crd/$docs) to map routes using traefik.

To check if everything works so far, you can use a test nginx instance from [kubernetes/xx-WhoAmI.yaml](./kubernetes/xx-WhoAmI.yaml). Once deployed, you should be able to display the nginx default page by reaching `https://test.{{cluster.baseHostName}}` from your host.

{{< includeCodeFile "./kubernetes/xx-WhoAmI.yaml" >}}

```sh
kubectl apply -f ./kubernetes/xx-WhoAmI.yaml
curl -kH 'Host: whoami.{{cluster.baseHostName}}' "https://$(kubectl --namespace traefik get svc traefik -o json | jq --raw-output '.status.loadBalancer.ingress[].ip')"
```

{{< alert theme="info" >}}
```sh
kubectl --namespace whoami auth can-i get service --as=system:serviceaccount:traefik:traefik
```
{{</ alert >}}

Yes ! Our host can access traefik, that redirects the request to `whoami` ! Next step is to let the world access it.

But before that, cleanup your testing mess:

```sh
kubectl delete -f ./kubernetes/xx-WhoAmI.yaml
```

{{< commitAdvice >}}
