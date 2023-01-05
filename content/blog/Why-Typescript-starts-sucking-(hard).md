---
title: "Why Typescript starts sucking (hard)"
date: 2022-05-22T00:15:42+01:00
description:
draft: true
# hideToc: false
# enableToc: true
# enableTocContent: false
# tocPosition: inner
# tocLevels: ["h2", "h3", "h4"]
tags:
- Security
series:
-
categories:
-
image:
---

{{< notice info "Disclaimer" >}}
I *am* a Typescript evangelist. But I've stumbled on quite a few cases where it seems to be a not so ideal language. Here is why…
{{< /notice >}}

The year is 2012 A.C. The Javascript ecosystem is entirely ruled by untyped unsafe hard to read code, pushed forward by the recent release of Node.JS (2009). Well not entirely ! A newcomer, Typescript, promises standing against such code, by extending the language with type declarations.

When I started working with Typescript (in 2015 if I remember correctly), I quickly became addicted to it. As features were added to the language, I started to think that TS was a language of one of its kind. *Mapped* & *conditional types* allows super in-depth dynamic definitions of the manipulated data, that no other language I know allows. I was almost literaly in love with it.

But, as the time passed, a few problems started to appear...

## ESM javascript output: because why bother building valid JS ?

