---
title: To self host, or not to self host
date: 2026-02-21T21:33:54+01:00
description:
draft: true
hideToc: false
enableToc: true
enableTocContent: false
tocFolding: false
enableVarsEditor: false
# tocPosition: inner
tocLevels: ["h2", "h3", "h4"]
tags:
- self-hosting
- sovereignty
series:
-
categories:
-
image:
plan: |
    Why to self host

    - Feeling the impact of our needs
    - Scaling the needs
    - Pricing independence
    - Decentralization and initiative promotion
    - It's fun

    What not to self host

    - need of reliability
    - services interacting with many others
---

I wont go into the details of the tools I ended up using (I may make a dedicated post about that later on), but the overall philosophy, and why I believe it is a move to make.

This post is aimed at people with low to moderate tech knowledge, but if you're someone experienced, maybe I can bring some points on the table; in any case, I would _love_ to read about your thoughts, experiments, achievements, or considerations. 

## The Why

### Freedom and privacy

<!--
- Vendor lock-in (google photos) that can force us into subscriptions
- Sovereignty, data at home
- Minimalism and simplicity
-->

I want to be able **not** to **rely** on big tech companies to safeguard my data. While laws exist to protect user privacy, the reality is that many corporations prioritize monetization over ethical practices. Platforms like Netflix, YouTube, or LinkedIn (despite their surface-level compliance) often use user data for targeted ads, algorithmic training, or other purposes that erode trust. For example, [LinkedIn has been **allegedly using user messages for AI training**](https://www.bbc.com/news/articles/cdxevpzy3yko).  <!-- TODO find more -->

Even for companies I trust, **they remain prime targets** due to the sheer volume of data they handle. A data breach at such a company isn’t just a risk to them—it’s a potential domino effect, with users like me caught in the fallout. Obviously, building a self-hosted architecture as secure as what Alphabet has is impossible. But by choosing to host my own tools, I need to **be the target** of an attack to be affected, and stop being a collateral casualty.

Cloud services are **seductive** with their "zero-config" convenience and low cost. But this ease comes at a price: dependency. One day, your favorite streaming service might raise prices, or a messaging app might change its privacy policy to collect more data. When you’re used to convenience, switching becomes a burden.

Self-hosting isn’t about rejecting all external tools—it’s about **choosing** the systems you run, with transparency and control. When you install or update some software, **you** decide what features exist, how data is handled, and what changes are acceptable. It’s a trade-off: more effort upfront, but long-term freedom. And this, this is

![Sovereignty](./sovereignty.jpg)

**Digital sovereignty** was one of the focus points of the [FOSDEM 2026](https://fosdem.org/2026/) I wrote about on LinkedIn. And yes, despite the accusation a few paragraphes above.

{{< social url="https://www.linkedin.com/embed/feed/update/urn:li:share:7424807469387960321?collapsed=1" height="244" >}}
You seem to not allow iframes. I'm proud of you. But you can still&nbsp;[see the post on LinkedIn](https://www.linkedin.com/posts/alexandrejpgermain_fosdem-fosdem2026-souverainetenumerique-share-7424807469387960321-3qZD/)
{{</ social >}}

I'll dig into this subject in a later post, because there is a lot to say especially recently. <!-- TODO: Article about sovereignty--> But TL;DR:

{{<alert theme="info">}}
Digital sovereignty is about deciding actively what you want to manage, and what to delegate, in order to control the availability of your data and services. Since it is an active choice, it will result in different choices for every people or organization.

It can be as various as
- using a cloud provider of your choice to run your services
- or making them run on machine(s) at home, with the data folder on your own disk
- or also having a private container registry with long lived copies of the services you want to run
- or a full clone of that version's source code and the toolset to rebuild it at any time. (btw there was [a small talk about reproducible builds during FOSDEM 2026](https://fosdem.org/2026/schedule/event/RYM8SF-repro-build/))
- or a deeper control over part or the complete software supply chain
- or even the hardware supply chain, if you have a couple of cents to put in a [Twinscan EXE 5000](https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe-5000). There's a [lego version](https://asmlstore.com/products/twinscan-exe-5000-lego-set) if you're a cheap ass.

{{</alert>}}

So, depending on your specific choice, having sovereignty over your digital services can be quite a rabbit hole. Personally, I'll use the first 3 options in my setup, depending on the use case.

### The customization

What if I could add a [very special kind of ping](https://github.com/buttplugio/awesome-buttplug) when my self-hosted [OpenWebUI](https://github.com/open-webui/open-webui) instance finishes responding to a request ? Self-hosting is more than just running software: it’s a canvas for personalization, where you can inject your own quirks, workflows, and even hardware integrations into the tools you use.

And it is not limited to open-source tools: Even closed-source services (as long as they expose APIs or plugin hooks) can be adapted to your preferences. Think of it as "reverse-engineering your own experience":

- Integrate with IoT devices (e.g., smart lights, speakers, or wearables) for a tailored user experience.
- Automate workflows (e.g., trigger a script, send a notification, or log data) based on specific events.
- Modify UI/UX (e.g., add custom themes, shortcuts, etc).

Self-hosting turns your setup into a personalized ecosystem, where you’re not just a user: you’re the architect of your own digital environment. Whether it’s a silly ping, a productivity hack, or a privacy-focused tweak, the possibilities are limited only by your imagination and technical curiosity.

### Learning is fun

Obviously, customizing stuff from the correct injection point requires that you _know_ how to code there. What if it is written in Cobol? (it won't, and even if, don't miss an opportunity to get rich btw).

And yes, it requires some work, learning new architecture, logical concepts, business logic, frameworks, maybe even language. It isn't necessarily something you feel like you want to invest time into, yet it is something _valuable_ in your technical journey. We need to do this journey when taking a new day job, but the plasticity and ability to learn is something you have to train, continuously. So it can be seen as an investment, in addition to having fun with the possibilities you offered yourself

## The What

Now, let's discuss a few considerations about what services you could self host. And for that, there are a few considerations to weight:
- Do you host stuff on a machine that you shut off, a dedicated home server up 24/7, or some remote server ? 
- What time do you feel ready to invest? 
- How confident are you, and what impacts do you allow if you mess up something? 
- How reliable do you _require_ your services to be?
- Is the service accessible from an uncontrolled network? 

Let's start with the easier ones you probably already have:

### A public file sharing client (like a torrent)

### An LLM chat interface

### A video streaming server

- Plex
- TrucFin

### A photo sharing service

### A file sync service

## 

## The Fuck

{{< alert theme="success" >}}
Yeah, that's a shitty pun related to the previous section's title... Sorry
{{</ alert >}}

So far, that's all and good. Yeah, I would love to self host pretty much everything. However, there are, as you know, caveats. 

<!--
- AI lowered the price of wide spread attacks
- Price of hardware
-->

### The cost

For all I said above in [the Why section](<!-- TODO -->), I would lie saying such project is cheap in terms of time. You'll need quite a lot of it, both to set up your services and to keep it running over time. That is a choice among the prices you have to pay, and to say it boldly, it is either your time and personnal investment, or money (assuming it will bring some sort of guarantee over your data ownership). 

Dep[ending on your choice about sovereignty, it may also require you to invest in hard cash as an investment: investment that may not become economically <!-- forgot the English word --> rentable before the probable expected lifetime of your wardware plus the price of electricity and other dependencies. And still, this is highly probable __if your measurement is in some monetary value_: __your__ privacy has an intrinsic value. 

### The moving landscape, and the landslide of AI

<!-- draft start -->
A few numbers from recent years:
- In 2025, AI made n PRs on Github
- In the same year, it has been suspected to raise n security notices, with n evaluated as serious among them. 
- Some services leverage using Ai reachable from the internet with very serious system access (Hello Clawd)
- This was the first year when OpenAI said there was the first autonomous AI attack 
<!-- draft end -->

Yet, such tools have real capabilities. They tend to be quite oversold, like the announcement of the compiler written by Ai 
<!-- Hardware price: get links about Ai proportion -->


###  





Pegasus? 