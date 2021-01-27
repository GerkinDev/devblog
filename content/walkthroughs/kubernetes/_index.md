---
title: "Set up a bare-metal kubernetes cluster from scratch"
date: 2020-11-16T02:35:47+01:00
draft: true
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
---

{{< notice warning >}}
Keep in mind that some things may not work out of the box, and you'll probably require a lot of try & errors. Kubernetes is complex. Also, I'm not a power user of kubernetes, so there may be things that can be done in a better way. Hey, I did all of this by try & error too.
{{</ notice >}}

## What are the goals

This guide will walk you through the process of creating a **self-hosted *kubernetes* cluster** with the following features:
* A **single master node**
* Internal networking through a **VPN**
* A ***traefik* ingress controller** to route HTTP(S) traffic
* Multi-purpose *OpenID* authentication with *keycloak*
* `kubectl` **authentication through *OpenID Connect***
* Various dashboards for HTTP routes, *kubernetes* itself, storages status & management, and logs.

![Complete architecture](./_assets/complete-architecture.svg)

I'll try to use as few 3rd party tools outside of *kubernetes*, except *helm* (to deploy complex apps more easily) and *krew* (to add some features to `kubectl`). But we'll get to that later. The goal is that you use as much *kubernetes* itself as possible so that you can get used to it, understand it, and thus, be able to troubleshoot if you have problems later. If you're a *kubernetes* power-user, **1.** what are you doing here ? and **2.** you might find other guides more applicable to your needs.

{{< alert theme="info" >}}
Other similar guides you might prefer:

* https://blog.alexellis.io/bare-metal-kubernetes-with-k3s/
* https://blog.alexellis.io/kubernetes-in-10-minutes/
{{< /alert >}}

## How to follow this guide

I'll provide you explanations on each steps we are doing together, & give you **:clipboard: templates** that you can use with the bare minimum working configuration.

**:clipboard: templates** contains placeholders for **:bookmark: variables** that you will need to replace. If I didn't broke anything in the meantime, you should be able to fill those vars using the sidebar. **Keep in mind** that those settings are probably **unsafe**, or not totally OK for your particular settings. Thus, I **highly** recommend you to **:books: RTFM** for each of the containers & tools we set up to tweak things.

*Kubernetes* configurations are [meant to be versionned](<!-- TODO -->). So, I recommend you to **init a repository** and **commit** after each steps. For sensible data such as *private keys*, *tokens* or *OpenID client secrets*, <!-- TODO: Uniformize -->.

*Kubernetes* ecosystem & *docker* images evolve pretty fast, so this guide may become obsolete. Check regularly if new *docker* images aren't available, and how their interactions or configurations evolve.

{{< alert theme="warning" >}}
**For security reasons**, I **highly** recommend you to start doing all your stuffs with domain name aliases until your setup is safe enough to be publicly exposed. We are going to setup dashboards & logging tools without authentication in a first time, so this is important that nobody else than you can access them. Because all of those services will run behind a router that routes based on domain name, using a forced DNS resolution instead of a public A record will prevent your router to route things to your apps.

**This is not safe**, I know. But this is temporary. I will tell you when you can change your host names.
{{</ alert >}}

## The author's comment

### To the attention of **beginners**

Kubernetes is huge. Really. And if you have no specialization in system administration, you will have pretty often bad times. Knowing my background as a software engineer, this guide took me more than 6 weeks of searches, experimentations, trial and errors, and frustration. I learned a **huge** lot of things that you will require to learn and understand too if you encounter the same problems than me during your setup.

I don't have special knowing in neither system security nor load management, so I **must** have done critical errors in some places; thus, don't take my words as granted. Take this document series as a global guide to kickstart a setup **you must** adapt and figure out yourself.

Again, if you're not super determined in learning a **lot**, you are putting your systems at risks by trying to use this directly in production.

### To the attention of **everybody**

Please, *please* do comments, post issues, and make pull requests in order to improve this document serie. I will open source as much prod-ready settings as possible (without compromising my own security), and contributing might improve the performance and safety of all futur readers. So, in advance, thank you.

## Prerequisites

I'll assume that:

* [x] you're on CentOS 8.
  On other versions/distros/OS, some things may or will differ from what I did. And you gonna help yourself with that.
  ```sh
  cat /etc/centos-release
  # > CentOS Linux release 8.2.2004 (Core)
  ```
* [x] you are somewhat familiar with *kubernetes CLI*.
  In fact, it is very likely that some parts of this guide won't work directly in your case, and you'll have to tweak things out to make them work properly.
* [x] you have the kubernetes CLI installed (`kubectl`, `kubeadm`) v1.19.3.
  Other versions may have changes. Again, RTFM.
  <!-- TODO: Short -->
  ```sh
  kubectl version
  # > Client Version: version.Info{Major:"1", Minor:"19", GitVersion:"v1.19.3", GitCommit:"1e11e4a2108024935ecfcb2912226cedeafd99df", GitTreeState:"clean", BuildDate:"2020-10-14T12:50:19Z", GoVersion:"go1.15.2", Compiler:"gc", Platform:"linux/amd64"}
  # > Server Version: version.Info{Major:"1", Minor:"19", GitVersion:"v1.19.3", GitCommit:"1e11e4a2108024935ecfcb2912226cedeafd99df", GitTreeState:"clean", BuildDate:"2020-10-14T12:41:49Z", GoVersion:"go1.15.2", Compiler:"gc", Platform:"linux/amd64"}
  kubeadm version
  # > kubeadm version: &version.Info{Major:"1", Minor:"19", GitVersion:"v1.19.3", GitCommit:"1e11e4a2108024935ecfcb2912226cedeafd99df", GitTreeState:"clean", BuildDate:"2020-10-14T12:47:53Z", GoVersion:"go1.15.2", Compiler:"gc", Platform:"linux/amd64"}
  ```
* [x] You have [*Helm* charts](https://helm.sh/) installed. 
  You can find more infos it [here](../../blog/kubernetes-qol/#helm-a-kubernetes-stack-template-repository).
* [x] You have [*krew*](https://krew.sigs.k8s.io/) installed.
  You can find more infos it [here](../../blog/kubernetes-qol/#krew-a-kubectl-plugins-manager).

---

**Ready ?**

[Start here](./00-vpn/)