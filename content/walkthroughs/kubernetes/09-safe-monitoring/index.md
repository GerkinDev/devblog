---
title: "Protect monitoring with authentication"
date: 2020-11-16T02:35:47+01:00
draft: false
weight: 100
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
- Web service
- Security
- Authentication
---

Now that we have our authentication service up and running, we can protect our dashboards installed in the step [06 - Monitoring: See what is going on](../06-monitoring) using our *Keycloak* OpenID Connect provider. Here is a diagram on how authorization will be managed:

![Authorization graph](./_assets/schema.svg)

## Traefik dashboard

## Kibana

## Kube dashboard

{{< expand "References" >}}
* https://itnext.io/protect-kubernetes-dashboard-with-openid-connect-104b9e75e39c
{{</ expand >}}

Again, we are going to set up a new instance of [*louketo-proxy*](https://github.com/louketo/louketo-proxy).

{{< includeCodeFile "./kubernetes/kubernetes-dashboard/02-Gatekeeper.yaml" >}}

Finally, modify your ingress route

{{< includeCodeFile "./kubernetes/kubernetes-dashboard/10-IngressRoute.yaml" >}}

{{< commitAdvice >}}
