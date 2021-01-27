---
title: "Make services reachable from the world"
date: 2020-11-16T02:35:47+01:00
draft: true
weight: 60
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

As you may have noticed in the step [02. Init the cluster](../02-cluster/index.md), the *metallb* configuration use only dynamic adresses. But for the reverse proxy to work, we'll need to be sure that our *traefik* router has a constant IP in your VPN. For this, modify your *metallb* configuration using the new [:clipboard: kubernetes/metallb-configmap.yaml](./kubernetes/kubernetes/metallb-configmap.yaml) template. This new configuration declares a new address pool named `frontend` with a single IP in it.

{{< includeCodeFile "./kubernetes/1-0-metallb-configmap.yaml" >}}

```sh
# Update the configuration
kubectl apply -f ./kubernetes/1-0-metallb-configmap.yaml
```

## 2. Set the router's IP

{{< expand "References" >}}
* [Requesting specific IPs from metallb](https://metallb.universe.tf/usage/#requesting-specific-ips)
{{< /expand >}}

Once the configmap has been changed, force our *traefik* service to use this new address "*pool*". This is done using the *annotation* `metallb.universe.tf/address-pool`. Use the new [:clipboard: kubernetes/traefik/22-Services.yaml](./kubernetes/traefik/22-Services.yaml) template, and check that its IP is correct.

{{< includeCodeFile "./kubernetes/traefik/2-1-Services.yaml" >}}

```sh
# Update the configuration
kubectl apply -f ./kubernetes/traefik/2-1-Services.yaml
# Check the IP. It should be the single one in the pool defined by `frontend` in the metallb configuration
kubectl get svc -n traefik
```

## 3. Setup the bare metal proxy

We'll use nginx as our bare reverse proxy. It will simply redirect every requests on the specified ports to traefik, that was [previously installed in kubernetes](./03-router/index.md). In the case of an SSL connection, it won't be unwrapped.

```sh
# Install nginx
dnf install nginx
ports=(80 443) # Fill it beforehand
# Get our traefik entry point
clusterEntry="$(kubectl get svc traefik -n traefik -o json | jq --raw-output '.status.loadBalancer.ingress[].ip')"
# Create the nginx stream configuration for kubernetes
mkdir /etc/nginx/streams.d
portsStr=''
for port in $ports; do
    portsStr="$portsStr
        listen     $port;
        listen     [::]:$port;"
done
cat << EOF > /etc/nginx/streams.d/kubernetes-proxy.conf
stream {
    server {
        $portsStr
        proxy_pass $clusterEntry:\$server_port;
    }
}
EOF
# Include it in the nginx config
echo '\ninclude /etc/nginx/streams.d/*.conf;\n' >> /etc/nginx/nginx.conf
# Start & auto-start nginx
systemctl enable --now nginx.service
```

Now, you should be able to reach your traefik router by requesting directly your entry point server. Test this with the [:clipboard: kubernetes/01-TestNginx.yaml](./kubernetes/01-TestNginx.yaml) template.

{{< includeCodeFile "./kubernetes/01-TestNginx.yaml" >}}

```sh
# Deploy it
kubectl apply -f ./kubernetes/01-TestNginx.yaml
## Here, go to your browser and check that you can in fact reach your test nginx instance
## via `test.{{cluster.baseHostName}}`.
# Then cleanup your own shit.
kubectl delete -f ./kubernetes/01-TestNginx.yaml
```

{{< commitAdvice >}}
