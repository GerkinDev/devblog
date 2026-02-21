---
title: "Make services reachable from the world"
date: 2020-11-16T02:35:47+01:00
draft: false
weight: 50
categories:
- Kubernetes
tags:
- Kubernetes
- Sysadmin
- DevOps
- Networking
- Web service
---

Now that you have a router installed, you have to pass requests on your server to it. This setup use a single entry point directly binding some ports on the host server.

## 1. Make a static and previsible configuration

As you may have noticed in the step {{<linkToPage "../02-cluster">}}, the *metallb* configuration use only dynamic adresses. But for the reverse proxy to work, we'll need to be sure that our *traefik* router has a constant IP in your VPN. For this, modify your *metallb* configuration using the new {{<linkToIncludedFile "./kubernetes/metallb-configmap.yaml">}} template. This new configuration declares a new address pool named `frontend` with a single IP in it.

{{<includeCodeFile "./kubernetes/metallb-configmap.yaml">}}

```sh
# Update the configuration
kubectl apply -f ./kubernetes/metallb-configmap.yaml
```

## 2. Set the router's IP

{{<expand "References">}}
* <https://metallb.universe.tf/usage/#requesting-specific-ips>
{{</expand>}}

Once the configmap has been changed, force our *traefik* service to use this new address "*pool*". This is done using the *annotation* `metallb.universe.tf/address-pool`. Use the new {{<linkToIncludedFile "./kubernetes/traefik/05-Services.yaml">}} template, and check that its IP is correct.

{{<includeCodeFile "./kubernetes/traefik/05-Services.yaml">}}

```sh
# Update the configuration
kubectl apply -f ./kubernetes/traefik/05-Services.yaml
# Check the IP. It should be the single one in the pool defined by `frontend` in the metallb configuration
kubectl --namespace traefik get svc 
```

## 3. Setup the bare metal proxy

We'll use *nginx* as our bare reverse proxy. It will simply redirect every requests on the specified ports to traefik, that was {{<linkToPage "../03-router" "previously installed in kubernetes">}}. In the case of an SSL connection, it won't be unwrapped.

```sh
# Install nginx
dnf install nginx
# Get our traefik entry point
clusterEntry="$(kubectl --namespace traefik get svc traefik -o json | jq --raw-output '.status.loadBalancer.ingress[].ip')"
# Omit IPv6 if local interface (VM, or anything not being a real interface)
if [[ $pubAddrv6 == fe80:* ]]; then pubAddrv6="::"; fi
# Create the nginx stream configuration for kubernetes
mkdir /etc/nginx/streams.d
cat <<EOF | tee /etc/nginx/streams.d/kubernetes-proxy.conf
stream {
    server {
        listen     443;
        listen     [::]:443;
        proxy_pass $clusterEntry:4443;
    }
    server {
        listen     80;
        listen     [::]:80;
        proxy_pass $clusterEntry:8000;
    }
}
EOF
# Include it in the nginx config
# Check that the base config does not already bind on port 80
echo '\ninclude /etc/nginx/streams.d/*.conf;\n' | tee -a /etc/nginx/nginx.conf
# Start & auto-start nginx
systemctl enable --now nginx.service
```

Now, you should be able to reach your traefik router by requesting directly your entry point server. Test this with the {{<linkToIncludedFile "../03-router/kubernetes/xx-WhoAmI.yaml" "kubernetes/xx-WhoAmI.yaml">}} template.

{{<includeCodeFile "../03-router/kubernetes/xx-WhoAmI.yaml" "./kubernetes/xx-WhoAmI.yaml">}}

```sh
# Deploy it
kubectl apply -f ./kubernetes/xx-WhoAmI.yaml
```

Make sure that `whoami.{{cluster.baseHostName}}` correctly resolves to your entry-point server (either via real DNS records or editing `/etc/hosts`), then try to access to:
* <https://whoami.{{cluster.baseHostName}}/tls>
* <http://whoami.{{cluster.baseHostName}}/notls>

If this works, you're good to go !

```sh
kubectl delete -f ./kubernetes/xx-WhoAmI.yaml
```

{{<commitAdvice>}}
