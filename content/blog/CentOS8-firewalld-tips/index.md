---
title: "CentOS8 Firewalld Tips"
date: 2021-02-02T00:16:48+01:00
description: Tracking down requests denied by firewalld is an important plus to be both strict and precise about what to allow. This small copy-pasta might help you.
draft: false
hideToc: false
enableToc: true
enableTocContent: false
tocPosition: outer
tocLevels: ["h2", "h3", "h4"]
tags:
- Firewall
- Security
- Sysadmin
- Troubleshooting
series:
-
categories:
-
image:
---

When configuring firewall rules to be as strict as required, you may have some troubles understanding why something you thought was allowed is, actually, not. And to track down this kind of issues, some logs might help. Here is a small copy-pasta to enable `firewalld` logging.

## Enable "*Access Denied*"

{{< expand "References" >}}
 * [How to enable firewalld logging for denied packets on Linux](https://www.cyberciti.biz/faq/enable-firewalld-logging-for-denied-packets-on-linux/)
{{</ expand >}}

`firewalld` can log events to `rsyslog`, the events journal in most linux distribution. This can be enable either at runtime (that won't persist across service restarts) or by configuration to keep it enabled for longer periods.

```sh
# Either reconfigure the runtime (cleared on next reload)
sudo firewall-cmd --set-log-denied=all
# Or change a config file (persistent)
sudo sed -i.bak -E 's/#?LogDenied=off/LogDenied=all/' /etc/firewalld/firewalld.conf && \
	sudo firewall-cmd --reload # Reload the service to enable `LogDenied` option
# Then, check
sudo firewall-cmd --get-log-denied
```

Then, we'll put rejection logs in {{< var "logFileName" >}}.

```sh
cat <<EOF | sudo tee /etc/rsyslog.d/{{logFileName}}.conf
:msg,contains,"_DROP" /var/log/{{logFileName}}.log
:msg,contains,"_REJECT" /var/log/{{logFileName}}.log
& stop
EOF
sudo systemctl restart rsyslog.service
sudo tail -f /var/log/{{logFileName}}.log
```

Yay ! Now, your can look at `/var/log/{{logFileName}}.log` to see denied messages info !
