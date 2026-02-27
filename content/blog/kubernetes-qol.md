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
  - Kubernetes
series:
  - categories:
      - Kubernetes
    image:
---

_Kubernetes_ is.... Quite a thing, to say the least ! :sweat_smile: Even if their conceptors did a great job at making the _`kubectl` cli_ as usable as possible, it can sometimes be a pain to be productive with it, read outputs, or do repetitive tasks. That's why I wrote this small _Quality of life_ improvements post: to regroup some install steps you might have missed, give you some useful 3rd party tools or maybe even give you tips a step ahead.

{{<alert theme="info">}}
Code samples are headed with the expected shell. Since I use ZSH, if there is no indication of the shell, you can assume it would work for pretty much any shell.
{{</alert>}}

{{<alert theme="success">}}
Fill out the {{<var "profileFile">}} with your profile file path. Usually, it's `~/.zshrc` for ZSH, and `~/.bashrc` for bash, but feel free to put all this stuff in a separate file you'll include from your main profile.
{{</alert>}}

## `kubectl` auto-complete

{{<expand "References">}}

- [:books: kubectl installation manual](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enable-kubectl-autocompletion)

{{</expand>}}

Autocomplete is nice, and a real time saver. It avoids typos, and it's quite satisfying to type a complete command in 4 keystrokes and a couple of `tab`s correctly placed. (even if I'm always unsure when relying on my browser's autocomplete for https://**anal**ytics.google.com :expressionless:).

But for this one, I can only say one thing, and you have no excuses:

[![RTFM](https://i.kym-cdn.com/photos/images/original/000/016/809/rtfm.jpg)](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enable-kubectl-autocompletion)

So, short stories short, and depending on your shell, type in:

{{<tabs "zsh" "bash">}}
{{<tab>}}

```sh
cat <<EOF | tee -a {{profileFile}}
autoload -Uz compinit
compinit
source <(kubectl completion zsh)
EOF
source {{profileFile}}
```

{{</tab>}}
{{<tab>}}

> All the (bad) flavours come from the natural world.

```sh
# Install the bash completion main script (assuming you're on a RHEL/CentOS/Fedora)
dnf install bash-completion
# Reload env
source ~/.bashrc
# Check if bash_completion is properly imported, or add it to your bashrc
if ! type _init_completion; then
    echo 'source /usr/share/bash-completion/bash_completion' >> {{profileFile}}
fi
# Source the completion script
echo 'source <(kubectl completion bash)' >> {{profileFile}}
source {{profileFile}}
```

{{</tab>}}
{{</tabs>}}

## `kubecolor`: prettier `kubectl` commands outputs with colors

{{<expand "References">}}

- [Add ANSI colors to kubectl describe and other outputs](https://github.com/kubernetes/kubectl/issues/524)
- [kubecolor](https://github.com/dty1er/kubecolor)

{{</expand>}}

```sh
go install github.com/hidetatz/kubecolor/cmd/kubecolor@latest
# Make sure kubecolor is found
which kubecolor
```

{{<alert theme="warning">}}
If the command above did not worked, then you may have a problem with your `$GOPATH` or `$GOHOME` environment variables. If none are set, then the package was installed in `~/go/bin`. Either fix your vars or add `~/go/bin` to your `$PATH`.

```sh
cat <<EOF | tee -a {{profileFile}}
PATH="\$PATH:\$HOME/go/bin"
EOF
source ~/.zshrc
```

{{</alert>}}

Finally, you could either use `kubecolor` instead of `kubectl`, or alias `kubectl` as `kubecolor` with the following code sample:

{{<tabs "zsh">}}
{{<tab>}}

```sh
cat <<EOF | tee -a {{profileFile}}
# Backup original "kubectl" command path. Supports subsequent imports of the file.
export KUBECTL_ORIG_PATH="\${KUBECTL_ORIG_PATH:-"\$(which kubectl)"}"
# Alias the real "kubectl" as "kubectll"
alias kubectll="\${KUBECTL_ORIG_PATH}"
# Alias kubectl to use colors by default
alias kubectl="kubecolor"
# Enable the autocompletion for the alias too (see auto-complete install above)
compdef kubecolor=kubectl
compdef kubectll=kubectl
EOF
source {{profileFile}}
```

{{</tab>}}
{{</tabs>}}

{{<alert theme="warning">}}
I noticed some little things does not work well with `kubecolor`. That's why the script above let you use the original `kubectl` command through `kubectll`. For instance, I noticed that some commands prompting user input (so using _stdin_), such as `kubectl login`, don't work.

So, if you try a command that seems to not work as expected, or stay stuck, fall back to `kubectll`.
{{</alert>}}

## `helm`: a kubernetes stack template repository

[_Helm_](https://helm.sh/) is a convinient way to use or share configurable kubernetes stacks. For example, it may allow to install easily a front-end, with its API and a database, in a single template, in which you can inject your specific configuration (PVC, ports, environment, etc...).

To install _helm_, run the following command:

{{<alert theme="info">}}
Make sure that OpenSSL is installed before proceeding.
{{</alert>}}

```sh
# See https://helm.sh/docs/intro/install/
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

## `krew`: a `kubectl` plugins manager

{{<expand "References">}}

- [Installing krew](https://krew.sigs.k8s.io/docs/user-guide/setup/install/)

{{</expand>}}

[_krew_](https://krew.sigs.k8s.io/) is a nice small plugin manager for your `kubectl` command. At the time of writing, it has [129 plugins available](https://krew.sigs.k8s.io/plugins/), including some pretty convinient to restart pods, login using OpenId, check the state of your cluster, and more.

To install _krew_, run the following: (taken from [the docs](https://krew.sigs.k8s.io/docs/user-guide/setup/install/))

> Think about replacing {{<var "profileFile">}} with your actual _zsh_ or _bash_ profile

```sh
# Install krew
(
  set -x; cd "$(mktemp -d)" &&
  OS="$(uname | tr '[:upper:]' '[:lower:]')" &&
  ARCH="$(uname -m | sed -e 's/x86_64/amd64/' -e 's/\(arm\)\(64\)\?.*/\1\2/' -e 's/aarch64$/arm64/')" &&
  KREW="krew-${OS}_${ARCH}" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/${KREW}.tar.gz" &&
  tar zxvf "${KREW}.tar.gz" &&
  ./"${KREW}" install krew
)
# Add it to your $PATH and reload config
cat <<EOF | tee -a {{profileFile}}
export PATH="\${KREW_ROOT:-\$HOME/.krew}/bin:\$PATH"
EOF
source {{profileFile}}
# Check krew works
kubectl krew
```

## _One ring to rule them all_

For this one, I plead guilty of not using it enough, but it contains a lot of useful knowledge and possible solutions of most of your problems.

You guessed it, I'm talking about documentation. (because it would be an insult to tell you that StackOverflow is a thing.)

Read it carefully. Take time to understand it and its underlying concepts. Don't use tools you don't know how they work. Because when things breaks, your knowledge of what and how it broke will help you to solve the problem quickly and without damages. So, read the documentation of your **containers**, your **_helm_ charts**, your **_kubernetes_ network layer**, and, of course, **_kubernetes_** and **_docker_ themselves**.
