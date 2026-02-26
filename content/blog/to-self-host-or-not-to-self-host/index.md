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
- privacy
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

{{<alert theme="info">}}
This article was _reformatted_ using a self-hosted AI model. I wrote the whole article by myself, and only used it to rephrase. <!-- TODO: Link to my stance on the subject -->
{{</alert>}}

I wont go into the details of the tools I ended up using (I may make a dedicated post about that later on), but the overall philosophy, and why I believe it is a move to make.

This post is aimed at people with low to moderate tech knowledge, but if you're someone experienced, maybe I can bring some points on the table; in any case, I would _love_ to read about your thoughts, experiments, achievements, or considerations. 

## The Why

### Why privacy matters

<!--
- Vendor lock-in (google photos) that can force us into subscriptions
- Sovereignty, data at home
- Minimalism and simplicity
-->

I want to be able to **not rely** on big tech companies to safeguard my data. While laws exist to protect user privacy, the reality is that many corporations prioritize monetization over ethical practices. Platforms like Netflix, YouTube, or LinkedIn (despite their surface-level compliance) often use user data for targeted ads, algorithmic training, or other purposes that erode trust. For example, [LinkedIn has been **allegedly using user messages for AI training**](https://www.bbc.com/news/articles/cdxevpzy3yko).  <!-- TODO find more -->

Even for companies I trust, **they remain prime targets** due to the sheer volume of data they handle. A data breach at such a company isn't just a risk to them, but can have potential domino effect, with users like me caught in the fallout. Obviously, building a self-hosted architecture as secure as what Alphabet has is impossible. But by choosing to host my own tools, I need to **be the target** of an attack to be affected, and stop being a collateral casualty (but I'll nuance that [further in the post](<!-- TODO -->)).

Cloud services are **seductive** with their "zero-config" convenience and low cost. But this ease comes at a price: dependency. One day, your favorite streaming service might raise prices, or a messaging app might change its privacy policy to collect more data. When you're used to convenience, switching becomes a burden.

Self-hosting isn't about rejecting all external tools, but about **choosing** the systems you run, with transparency and control. When you install or update some software, **you** decide what features exist, how data is handled, and what changes are acceptable. It's a trade-off: more effort upfront, but long-term freedom. And _this_, is

![Sovereignty](./sovereignty.jpg)

### Digital Sovereignty and Control

**Digital sovereignty** was one of the focus points of the [FOSDEM 2026](https://fosdem.org/2026/) I wrote about on LinkedIn (despite the accusation to LinkedIn mentioned above. I'm a complicated meatsack).

{{<social url="https://www.linkedin.com/embed/feed/update/urn:li:share:7424807469387960321?collapsed=1" height="244">}}
You seem to not allow iframes. I'm proud of you. But you can still&nbsp;[see the post on LinkedIn](https://www.linkedin.com/posts/alexandrejpgermain_fosdem-fosdem2026-souverainetenumerique-share-7424807469387960321-3qZD/)
{{</social>}}

I'll dig into this subject in a later post, because there is a lot to say especially recently. <!-- TODO: Article about sovereignty--> But TL;DR:

{{<alert theme="info">}}
Digital sovereignty is about deciding actively what you want to manage, and what to delegate, in order to control the availability of your data and services. Since it is an active choice, it will result in different choices for every people or organization.

For the nerds, it can be as various as
- using a cloud provider of your choice to run your services
- or making them run on machine(s) at home, with the data folder on your own disk
- or also having a private container registry with long lived copies of the services you want to run
- or a full clone of that version's source code and the toolset to rebuild it at any time. (btw there was [a small talk about reproducible builds during FOSDEM 2026](https://fosdem.org/2026/schedule/event/RYM8SF-repro-build/))
- or a deeper control over part or the complete software supply chain
- or even the hardware supply chain, if you have a couple of cents to put in a [Twinscan EXE 5000](https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe-5000). There's a [lego version](https://asmlstore.com/products/twinscan-exe-5000-lego-set) if you're a cheap ass.

{{</alert>}}

So, depending on your specific choice, having sovereignty over your digital services can be quite a rabbit hole. Personally, I'll use the first 3 options in my setup, depending on the use case.

### The customization

What if I could add a [very special kind of ping](https://github.com/buttplugio/awesome-buttplug) when my self-hosted [OpenWebUI](https://github.com/open-webui/open-webui) instance finishes responding to a request ? Self-hosting is more than just running software: it's a canvas for personalization, where you can _adapt_ the tools to your need. It can be as simple as installing other's people mods or plugins into the base app, or as extended as coding your own.

Self-hosting turns your setup into a personalized ecosystem, where you're not just a user: you're the architect of your own digital environment. Whether it's a silly ping, a productivity hack, or a privacy-focused tweak, the possibilities are limited only by your imagination and technical curiosity.

Many tools, being open-source or proprietary, expose some kind of plugin system. And even if you don't find existing stuff doing what you want and are not familiar with coding, there are plenty of tools to help you with that. I would not necessarily recommend "vibe-coding" your way around, but I would lie saying it is not an option. In any case, it can be a great opportunity to explore new concepts, familiarize yourself with deeper and deeper concepts, whatever your technical knowledge is.

### Learning is fun

Sure, self-hosting requires learning. A lot. Even if you do not touch the code, you'll need to learn how to configure and use all your new toys. And if you _do_ want to code, it can be a really fun way to write your first lines in a language you've never touched before. What if you want to create a plugin for an app written in Cobol? (it won't, and even if, don't miss an opportunity to get rich btw).

Every time you install or deploy a service, debug a script, or configure a firewall, you're gathering knowledge and experience. And the best part? **You get to choose what you learn**: it's up to you to choose one solution over another, and what you'll learn along the way can be a deciding factor if you want it to be. **Learning can, and should, be a motivation to self host**, and an excuse to experiment.

![Don't forget the glasses](./walter-bug.gif)

> If you're thinking that you don't have the knowledge to do it, be aware that _neither do I_, and that's why we should.

And aside from the fun experience, the general comprehension you can collect, the privacy and proud of accomplishment, this experience is __valuable__ in a professional context.

---

You might be thinking, "_Why go through all this trouble?_" Well, here's the thing: self-hosting isn't for everyone. It's for the people who want to tweak, break, and rebuild things until they fit their weird, wonderful, and occasionally nonsensical ideas. If that's you: welcome to the club.

So, go ahead. Break the rules. Add that silly ping. Mess with your setup until it's you. And if it crashes? That's just the universe reminding you: "You're still learning." And that's okay. In fact, it's kind of the point.

## The What

<!-- #region FIXME: Expand/rephrase -->
Now, let's discuss a few considerations about what services you could self host. And for that, there are a few considerations to weight:
- Do you host stuff on a machine that you shut off, a dedicated home server up 24/7, or some remote server ? 
- What time do you feel ready to invest? 
- How confident are you, and what impacts do you allow when something goes wrong? 
- How reliable do you _require_ your services to be?
- Is the service accessible from an uncontrolled network (the Internet)? 

Let's start with a few ideas of things you can bring at home. Think of this as a "self-hosting menu": pick what fits your appetite for control, and the occasional chaos of lost nights troubleshooting.

|                           | Complexity  | Risks    | Requires constant uptime | Example |
|---------------------------|-------------|----------|--------------------------|---------|
| Torrent client            | Easy        | Low      | No                       | 
| Video streaming server    | Easy        | Low      | No                       | Plex, Jellyfin
| Game server               | Easy/Medium | Low      | Preferred                | Minecraft
| LLM chat interface        | Medium      | Medium   | Preferred                | OpenWebUI
| Photo sharing service     | Hard        | High     | Yes                      | Jellyfin, ...
| Drive storage             | Hard        | High     | Yes                      | Holochain, ...
| Personnal website         | Easy/Medium | Low/High | Yes                      | Hugo, Wordpress
| A bot for a messaging app |             |          | Prefered                 | Discord
| A note keeping service    |             |          | Yes                      | Obsidian
{tableMode=headRowCol #services-ideas}

<!-- TOM:

Sur le self host, il y a aussi le truc du style sunshine (ou apollo) pour accéder à ton pc de n'importe où avec Moonlight par exemple. Je sais pas trop si ça peut rentrer dans ce que tu veux parler
Same pour cockpit qui peut t'aider sur le monitoring de ton self host

-->

<!-- #endregion -->

### A public file sharing client (like a torrent)

<!-- TODO: Step by step guide -->

### A video streaming server

<!-- #region FIXME: Expand/rephrase -->
- Plex
- JellyFin
<!-- #endregion -->

<!-- TODO: Step by step guide -->

### An LLM chat interface

<!-- TODO: Step by step guide -->

### A photo sharing service

<!-- TODO: Step by step guide -->

### A Drive-like storage service

<!-- TODO: Step by step guide -->

### Game server

<!-- #region FIXME: Expand/rephrase -->
Interesting with mods
- Minecraft
- [Eco](https://store.steampowered.com/app/382310/Eco/)
- [Garry's mod](https://store.steampowered.com/app/4000/Garrys_Mod/)
- [Satisfactory](https://store.steampowered.com/app/526870/Satisfactory/)
- [Factorio](https://store.steampowered.com/app/427520/Factorio/)

<!-- #endregion -->

## The Fuck

{{<alert theme="success">}}
Yeah, that's a shitty pun related to the previous section's title... Sorry
{{</alert>}}

So far, that's all and good. Yeah, I would love to self host pretty much everything. However, there are, as you know, caveats. 

<!--
- AI lowered the price of wide spread attacks
- Price of hardware
-->

### The cost

<!-- #region FIXME: Expand/rephrase -->
For all I said above in [the Why section](#the-customization), I would lie saying such project is cheap in terms of time. You'll need quite a lot of it, both to set up your services and to keep it running over time. That is a choice among the prices you have to pay, and to say it boldly, you have to choose between:
{{<picksome count=2 >}}
- [ ] time and personal investment
- [ ] money
- [ ] privacy

Go ahead
![Try](https://media1.tenor.com/m/WhwYR9wv8LgAAAAC/to-be-continued-gun.gif)
{{</picksome>}}

Depending on your choice about sovereignty, it may also require you to invest in hard cash as an investment: investment that may not become economically profitable before the expected lifetime of your hardware, + the price of electricity and other dependencies. And still, this is highly probable __if your measurement is in some monetary value__: __your__ privacy has an intrinsic value.

Price of hardware impacted by AI growth
<!-- #endregion -->

### The moving landscape, and the landslide of AI


<!-- #region FIXME: Expand/rephrase -->
No fearmongering, but a few numbers from recent years:
- [as of November 2025, 14.9% of code contributions had some involvment from AI agents](https://pullflow.com/state-of-ai-code-review-2025). To give hard numbers, for over the 1.4M contributions that were evaluated in that month alone, ~210k of them had AI contributions. Those contributions can be reviews, coding, or any other kind of participation
  > PullFlow Research (2025). State of AI Code Review 2025. https://pullflow.com/state-of-ai-code-review-2025
- In the same year, it has been suspected to raise n security notices, with n evaluated as serious among them. 
- Some services leverage using Ai reachable from the internet with very serious system access (Hello Clawd)
- This was the first year when OpenAI said there was the first autonomous AI attack 

Yet, such tools have real capabilities. They tend to be quite oversold, like the announcement of the compiler written by Ai 
<!-- Hardware price: get links about Ai proportion -->

Talk about lower cost of wide-spread attack, which can put self-hosted infrastructures at risk. Big corps are high value targets with high cost, but AI may make low value target extremely cheap to spam.
<!-- #endregion -->


###  





<!-- Talk about Pegasus? -->
