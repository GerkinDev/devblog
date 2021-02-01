---
title: "Quality Of Life improvements to kubernetes"
date: 2020-11-18T00:22:31+01:00
description:
draft: false
# hideToc: true
# enableToc: true
# enableTocContent: false
# tocPosition: inner
# tocLevels: ["h2", "h3", "h4"]
tags:
- kubernetes
series:
-
categories:
-
image:
---

*Kubernetes* is.... Quite a thing, to say the least ! :sweat_smile: Even if their conceptors did a great job at making the *`kubectl` cli* as usable as possible, it can sometimes be a pain to be productive with it, read outputs, or do repetitive tasks. That's why I wrote this small *Quality of life* improvements post: to regroup some install steps you might have missed, give you some useful 3rd party tools or maybe even give you tips a step ahead.

## `kubectl` auto-complete

{{< expand "References" >}}
* [:books: kubectl installation manual](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enable-kubectl-autocompletion)
{{</ expand >}}

Autocomplete is nice, and a real time saver. It avoids typos, and it's quite satisfying to type a complete command in 4 keystrokes and a couple of `tab`s correctly placed. (even if I'm always unsure when relying on my browser's autocomplete for https://**anal**ytics.google.com :expressionless:).

But for this one, I can only say one thing, and you have no excuses:

[![RTFM](https://i.kym-cdn.com/photos/images/original/000/016/809/rtfm.jpg)](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enable-kubectl-autocompletion)

So, short stories short, and depending on your shell, type in:

{{< tabs "zsh" "bash" >}}
{{< tab >}}
```sh
echo 'autoload -Uz compinit
compinit
source <(kubectl completion zsh)' >> ~/.zshrc
source ~/.zshrc
```
{{</ tab >}}
{{< tab >}}

> All the (bad) flavours come from the natural world.

```sh
# Install the bash completion main script (assuming you're on a RHEL/CentOS/Fedora)
dnf install bash-completion
# Reload env
source ~/.bashrc
# Check if bash_completion is properly imported, or add it to your bashrc
if ! type _init_completion; then
    echo 'source /usr/share/bash-completion/bash_completion' >> ~/.bashrc
fi
# Source the completion script
echo 'source <(kubectl completion bash)' >> ~/.bashrc
source ~/.bashrc
```
{{</ tab >}}
{{</ tabs >}}

## `kubecolor`: prettier `kubectl` commands outputs with colors

{{< expand "References" >}}
* [Add ANSI colors to kubectl describe and other outputs](https://github.com/kubernetes/kubectl/issues/524)
* [kubecolor](https://github.com/dty1er/kubecolor)
{{</ expand >}}

```sh
go get -u github.com/dty1er/kubecolor/cmd/kubecolor
# Make sure kubecolor is found
which kubecolor
```

If the command above did not worked, then you may have a problem with your `$GOPATH` or `$GOHOME` environment variables. If none are set, then the package was installed in `~/go/bin`. Either fix your vars or add `~/go/bin` to your `$PATH`.

Finally, you could either use `kubecolor` instead of `kubectl`, or alias `kubectl` as `kubecolor` with the following code sample:

```sh
# Backup original `kubectl` command path. Supports subsequent imports of the file.
echo 'export KUBECTL_ORIG_PATH="${KUBECTL_ORIG_PATH:-"$(which kubectl)"}"' >> {{profileFile}}
# Alias the real `kubectl` as `kubectll`
echo 'alias kubectll="${KUBECTL_ORIG_PATH}"' >> {{profileFile}}
# Alias kubectl to use colors by default
echo 'alias kubectl="kubecolor"' >> {{profileFile}}
# Enable the autocompletion for the alias too (see auto-complete install above)
echo "complete -o default -F __start_kubectl kubecolor" >> {{profileFile}}
source {{profileFile}}
```

{{< alert theme="warning">}}
I noticed some little things does not work well with `kubecolor`. That's why the script above let you use the original `kubectl` command through `kubectll`. For instance, I noticed that some commands prompting user input (so using *stdin*), such as `kubectl login`, don't work.

So, if you try a command that seems to not work as expected, or stay stuck, fall back to `kubectll`.
{{</ alert >}}

## `helm`: a kubernetes stack template repository

[*Helm*](https://helm.sh/) is a convinient way to use or share configurable kubernetes stacks. For example, it may allow to install easily a front-end, with its API and a database, in a single template, in which you can inject your specific configuration (PVC, ports, environment, etc...).

To install *helm*, run the following command:

```sh
# See https://helm.sh/docs/intro/install/
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

## `krew`: a `kubectl` plugins manager

[*krew*](https://krew.sigs.k8s.io/) is a nice small plugin manager for your `kubectl` command. At the time of writing, it has [129 plugins available](https://krew.sigs.k8s.io/plugins/), including some pretty convinient to restart pods, login using OpenId, check the state of your cluster, and more.

To install *krew*, run the following: (taken from [the docs](https://krew.sigs.k8s.io/docs/user-guide/setup/install/))

> Think about replacing `{{profileFile}}` with your actual *zsh* or *bash* profile

```sh
# Install krew
(
  set -x; cd "$(mktemp -d)" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/krew.tar.gz" &&
  tar zxvf krew.tar.gz &&
  KREW=./krew-"$(uname | tr '[:upper:]' '[:lower:]')_$(uname -m | sed -e 's/x86_64/amd64/' -e 's/arm.*$/arm/')" &&
  "$KREW" install krew
)
# Add it to your $PATH and reload config
echo 'export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"' >> {{profileFile}}
source {{profileFile}}
# Check krew works
kubectl krew
```

## *One ring to rule them all*

For this one, I plead guilty of not using it enough, but it contains a lot of useful knowledge and possible solutions of most of your problems.

You guessed it, I'm talking about documentation. (because it would be an insult to tell you that StackOverflow is a thing.)

Read it carefully. Take time to understand it and its underlying concepts. Don't use tools you don't know how they work. Because when things breaks, your knowledge of what and how it broke will help you to solve the problem quickly and without damages. So, read the documentation of your __containers__, your __*helm* charts__, your __*kubernetes* network layer__, and, of course, __*kubernetes*__ and __*docker* themselves__.