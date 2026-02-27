---
title: "A quick glance at Blazor WebAssembly"
date: 2022-01-15T10:00:00+01:00
description:
# hideToc: true
enableToc: true
# enableTocContent: false
# tocPosition: inner
# tocLevels: ["h2", "h3", "h4"]
authors:
  - GerkinDev
tags:
  - WASM
  - Blazor
  - CSharp
  - AspNetCore
series:
categories:
  - Front-end
image: /assets/images/blazor.png
aliases:
  - /blog/blazor
---

In 2018, _:imp: Microsoft_ released its new framework, _Blazor_, which tease MVVM capabilities through component-oriented _AJAX_ or _WebAssembly_ application builds. 4 years later (and with many improvements & versions), what is the current state of _Blazor_?

In this article, I'll share with you my experiences with _Blazor WebAssembly_, the pros, the cons, the whatnot.

> **TL;DR;** If you're not already a fluent _ASP.NET_ developer, I'm not sure that you want to use it. If you are, then maybe _Blazor_ might be an interesting choice.

<!--more-->

{{<notice "info" "What I'm gonna talk about">}}
This article focuses on _Blazor WebAssembly_ specifics, and not on what I think about C#. But I'm gonna write an article about it.

I won't talk about _Blazor Server_ since I've never used it.

Since _Blazor WebAssembly_ is a front-end MVVM framework, I'll compare it mostly against other pure JavaScript frameworks (like _Vue_ and _Angular_ that I've both used, or _React_).
I don't have enough experience with other non-JavaScript frameworks, like _Flutter_.

Also, keep in mind that I'm an _Angular_ aficionado. Thus, I might have some opinions directly based on my personal preferences, highly based on _Angular_.
{{</notice>}}

_Blazor WebAssembly_ fits between the structural simplicity of _React_ and the opinionated architecture of _Angular_ with class-based components with bound properties. Components are actually [_Razor_ components](https://docs.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-6.0) built for in-browser execution.

You can write your code & template in a single `.razor` file or move your _code-behind_ (yeah, legacy terms keep coming) to a `.razor.cs` file, to decouple logic & view, which I personally like.

{{<alert theme="warning">}}
This article was originally written in January 2022, and _Blazor_ being in quick development, some parts might be obsolete already.
{{</alert>}}

# The review

## The MVVM features: :thumbsup:

_Blazor_ relies solely on components. There are no such things as _pipes_ or _directives_ like you would in _Angular_ (and some other MVVM frameworks), and makes the whole view thing quite verbose compared to _Angular_ (which is already verbose). Need a tooltip around this element? Here you go with one more level of nesting.

Since there are no directives, & because _C#_ does not support mixins, composition & reusability are a bit tedious.

Yet, views are easy to write, & being able to write a bit of code in them can be useful.

[Component lifecycle](https://docs.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-6.0) is simple & quite easy to extend & override. You can implement the `IDisposable` interface to do some cleanup code. Inputs/outputs bindings are easy to declare in classes & use in views. Injecting dependencies in components is easy as pie.

```cs
using Microsoft.AspNetCore.Components;
using System;
using System.Threading.Tasks;

namespace Client;

public partial class MyComponent : IDisposable
{
    // ` = default!` removes some warnings depending on your project configuration.
    [Parameter] public string SomeInput { get; set; } = default!;
    // A parameter that shows an error in VisualStudio if it isn't declared
    [Parameter, EditorRequired] public string SomeRequiredInput { get; set; } = default!;
    [Parameter] public EventCallback<string> SomeOutput { get; set; } = default!;
    [Inject] private MyService _MyService { get; set; } = default!;

    protected override Task OnInitializedAsync() // Exists in sync variant: `void OnInitialized()`
    {
        // Ran once `[Inject]` properties are set.
        return base.OnInitializedAsync();
    }

    protected override Task OnParametersSetAsync() // Exists in sync variant: `void OnParametersSet()`
    {
        // Ran once `[Parameter]` properties have been assigned.
        return base.OnParametersSetAsync();
    }

    protected override Task OnAfterRenderAsync(bool firstRender) // Exists in sync variant: `void OnAfterRender()`
    {
        // Ran after each render.
        return base.OnAfterRenderAsync(firstRender);
    }

    public override Task SetParametersAsync(ParameterView parameters)
    {
        // Ran to override component parameter inputs to properties assignation. You usually don't need to override this method.
        return base.SetParametersAsync(parameters);
    }

    private bool _shouldRender = true;
    protected override bool ShouldRender()
    {
        // Custom code to detect if component should be re-rendered. You should override this method if you have performance issues.
        // The most common pattern is to return a boolean you set in `OnParametersSet(Async)` comparing old & new values.
        return _shouldRender;
    }

    public void Dispose()
    {
        // Do some cleanup code on component destruction.
    }
}
```

Unfortunately, `SetParameters(Async)`'s `ParameterView` does not allow access to previous values for manual change detection. You then have to assign your `[Parameter]` to private fields to keep track of previous states, resulting in more boilerplate code.

But all in all, _Blazor_'s _MVVM_ approach is quite good

## CSS Isolation: :thumbsdown:

It was the first thing I ended up rage-quitting my workday. CSS isolation of _Blazor_ is :poop:, like a huge fat ton of :poop: compared to what _Vue_ or _Angular_ can do. And this is **partly** due to some takes from _Blazor_ (other parts are a more general problem with the whole _ASP.NET_ thing).

_Blazor_ does not create a root DOM element for your component, but it renders the content directly. While this reduces a bit the number of HTML nodes:

1. it prevents parent components from styling child's container
2. you **must** add a useless `div` wrapper node at the root of your component if you want to use deep selection bound within your component
3. using inheritance with abstract components might end up with [totally broken selectors not applied **at all** on your component](https://github.com/dotnet/aspnetcore/issues/29493), in which case you have to manually edit your `.csproj` to manually declare style selector attributes.

Combine those drawbacks with unstable _hot-reload_ features that partially work and make regressions every new version, and the assets usual madness & opacity of _ASP.NET_ feat. _Visual Studio_, and you'll end up losing hours wondering why your styles aren't applied and aren't even in your client `.css`. You've been warned.

## Inheriting _ASP.NET_, for (the better and) the worse: :thumbsdown:

### Automagical assets random behavior

{{<alert theme="warning">}}
This section is probably heavily biased by my experience with the JS ecosystem. If you're an expert _ASP.NET_ developer, I bet you'll say I'm just a noob.

Yet, I've seen soooo few _ASP.NET_ applications built correctly for the client side. Like, un-minified & non-concatenated code in production, non-scaled images, no `srcset`, etc. So I also suppose we don't have the same expectations from the build process of a web application
{{</alert>}}

_ASP.NET_ want to look like a full-fledged web framework, with built-in web server (Kestrel), middlewares, user concept, HTML rendering, serialization, etc...; ok fine. But who do web applications without JS/CSS/images ? So why the f\*ck do I have to use 3rd party stuff to do proper assets handling & post-processing ?

Just to be clear: I don't **think** that's the job of _ASP.NET_ nor _Visual Studio_ to do this. But the whole build process configured by declarative XML in `.csproj` is very hard to dig deep in & debug. And I don't mention the magic behind _AOT_ that builds to _WASM_ if tooling is available (but I'll tell you more about it [later](#webassembly-is-just-a-name-not-a-performance-guarantee-)), or just skip without saying anything otherwise.

So, if you plan on having any `.scss` in your project, or want to do some minification/concatenation/compression/optimization, you'll need extra tooling like [Excubo.WebCompiler](https://github.com/excubo-ag/WebCompiler).

{{<expand "Personal note">}}
I :heart: Rollup, Webpack, & similar tools. They are such a great help once you know how to handle them correctly, to heavily customize your process, and go from raw JS to full lazy-loaded application with whatever cool compile-time feature you want.

And, compared to _ASP.NET_, you can really tweak them case-by-case, do heavy logic stuff, & write custom hooks/modules easily.

I really hate those damn `.csproj`.
{{</expand>}}

Well, if you give it a go long enough, you'll experience "funny" behaviors by yourself.

### The legacy hell

If you've already written any serious project with _ASP.NET_, you must have encountered obsolete or incoherent things the _Microsoft_ team won't change, because, you know, _Legacy_. And backward compatibility is good. But who is going to update their old _ASP.NET 3_ application to _Core_ without planing a full rewrite of the app ?

There are a lot of APIs that evolves regularly in the _ASP.NET_ ecosystem, but mostly surfacing ones. More critical/central parts, such as authentication, just don't move. And if you're trying to write, for example, an app with multi-tenant authentication, you'll probably hit your head against the walls (even if there are some [great tutorials](https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/), but if you find one that works, just stop updating anything).

{{<alert theme="info">}}
There is much more to say about this issue. I lost several days on multi-tenant app bug but I can't remember exactly the context nor the resources I used.

Next time I work on a _Blazor_ project, I'll write it down and update this section.
{{</alert>}}

### For god' sake, the **DOCS**

Docs in the _ASP.NET_ ecosystem are.... Very inconsistent.

_Microsoft_'s docs are so abundant for every version that you'll probably have troubles finding what you are looking for, drowning in examples & multiple versions. But at least, there are some

For *NuGet*s, that's another story. A good chunk of the _NuGet_ repository packages just don't even have a readme, nor a public repository attached. I guess that this is in part due to _ASP.NET_ history & target audience: mostly closed-source for a while, and for enterprises that don't really like exposing code for free. So why bother writing docs if nobody will use it ?

## Testing: :thumbsup:

I have not been in a context favorable to testing, I admit, and I did it very poorly for most of it. I just wrote a couple of components tests, & fully tested some blocks. And it was quite cool. I was very afraid that the straightness of C# would not be as easy as Typescript to test.

A couple of *NuGet*s filled the gaps perfectly:

- [xUnit](https://www.nuget.org/packages/xunit/): defines general test utilities, like `Fact` & `Theory`
- [bUnit](https://www.nuget.org/packages/bunit/): create & manage components to manipulate them in tests
- [Moq](https://www.nuget.org/packages/Moq/): create mocks of your classes & services that you can inject in DI. This one is so useful.

Altogether, a test could look like this:

```cs
using Bunit;
using Moq;
using System;
using Xunit;

namespace Client;

public class MyFormComponentTest
{
    [Fact]
    public void ShouldValidateSubject()
    {
        var ctx = new TestContext();

        var valid = false;
        var myServiceMock = new Mock<MyService>(); // You can customize its calls return values, & assert calls.
        myServiceMock.Setup(_ => _.VerifyForm(It.IsAny<Model>())).Returns(() => valid);
        ctx.Services.AddSingleton(myServiceMock.Object);

        compCut = ctx.RenderComponent<MyFormComponent>(); // Render the component
        var input = compCut.FindAll("input")[2];

        input.Change("asd");
        myServiceMock.Verify(_ => _.VerifyForm(It.IsAny<Model>()), Times.Exactly(2));
        Assert.Equal("asd", compCut.Instance.Model.Subject);
        Assert.ThrowsAny<Exception>(() => dialogCut.Find(".mud-input-error"));

        input.Change("");
        Assert.Equal("", compCut.Instance.Model.Subject);
        Assert.Equal("The field \"Subject\" is required", dialogCut.Find(".mud-input-helper-text.mud-input-error").TextContent);

        valid = true;
        input.Change("foo");
        myServiceMock.Verify(_ => _.VerifyForm(It.IsAny<Model>()), Times.Exactly(2));
        Assert.Equal("foo", compCut.Instance.Model.Subject);
        Assert.ThrowsAny<Exception>(() => dialogCut.Find(".mud-input-error"));
    }
}
```

{{<alert theme="info">}}
I'm aware that I'm testing way too many different things from this single test. I usually don't do that, it's just for demo purposes.
{{</alert>}}

## _WebAssembly_ is just a name, not a _performance_ guarantee: :neutral_face:

<!-- https://hacks.mozilla.org/2019/08/webassembly-interface-types/ -->

Well.... _Microsoft_ doesn't talk about _Blazor_'s performance as a selling point. And there's a reason: it's poor. Like, deceiving. But that's not _Blazor_'s only's fault.

DOM manipulation takes an absurd amount of time: currently (as of 01/2022), _WASM_ can't interact with the DOM directly. Thus, every attempt to manipulate it needs to go through the `JSInterop` to run a javascript call from Dotnet. And this is **painfully** slow. For an _MVVM_ framework, being super slow to manipulate your page's elements is disqualifying.

Apart from the real DOM manipulation, the per-components overhead is **so consequent** that I found myself merging several components together to make an all-in-one-joker-fatass-huge-template for performance reasons, because rendering 25 rows with single-responsibility instances was causing significant lag (like 5s delay per redraw). And yet again, this kind of defeats the axiom of [*S*ingle *R*esponsibility *P*rinciple](https://en.wikipedia.org/wiki/Single-responsibility_principle), where components should have one and only one job.

<!-- TODO: Add app screenshot -->

[_Microsoft_'s _Blazor_ performances best practices](https://docs.microsoft.com/en-us/aspnet/core/blazor/performance?view=aspnetcore-6.0#create-lightweight-optimized-components) can't even decide what to recommend: don't do big components with many DOM elements, but don't use many small ones either. In brief, the only way to be blazing fast is not doing anything.

![OK thanks](https://media.giphy.com/media/w77O4Mf1juHPq/giphy.gif)

<!-- {{<img src="https://media.giphy.com/media/w77O4Mf1juHPq/giphy.gif" title="OK Thanks" caption="OK Thanks. This seems logical." alt="OK Thanks" width="200px">}} -->

---

Many benchmarks indicate that WASM is faster for CPU-heavy jobs. But most applications don't need nor have a real advantage to benefit from the performance boost of WASM, knowing WASM modules are **heavy**. And if you do, here is the truth:

{{<alert theme="warning">}}
_Blazor WebAssembly_ does not **build** to _WASM_ by default. Yeah, you read it correctly:

The default configuration builds to [_IL_](https://en.wikipedia.org/wiki/Common_Intermediate_Language) and outputs DLLs. So, all the code you write ends up in `.dll` files, not in `.wasm`. Then, _Blazor_ (the _WASM_ core this time) bootstrap a WASM sandbox to interpret your _IL_ code.

---

You're basically outputting huge DLLs interpreted by a sub-optimized _IL_ runtime in _WASM_, to run an application the _WASM_ interpreter is knowingly shitty at.
{{</alert>}}

I've just said above that "_Blazor WebAssembly_ does not **build** to _WASM_ **by default**", but you can opt in to this feature by [enabling AOT](https://docs.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly?view=aspnetcore-6.0#ahead-of-time-aot-compilation). But beware: AOT takes **very long** (more than 10 min for a small app) and increases yet again the total application size by a lot (it basically copies all your client's DLLs to _WASM_ format which is about the same size as DLLs). If you're using docker, just be ready to push 300Mo+ images quite rapidly, and pay the storage fees that come with them.

But once compiled to _WASM_, performances are decent. Rendering speed is still lower than _Angular_ (which is not that fast either depending on the exact task), but acceptable, and processing that don't use `JSInterop` (like most parts of services) are finally quite fast.

{{<alert theme="info">}}
I should really think about making some serious benchmarks with repositories attached. [Soon<i class="fas fa-trademark"></i>](https://wowwiki-archive.fandom.com/wiki/Soon)
{{</alert>}}

# Conclusion

_Blazor WebAssembly_ is a thing. Definitely. But it is IMO **very** immature by itself, and by the main features it tries to leverage, _WebAssembly_. Yet, it's a nice try.

The dependency on the _ASP.NET_ ecosystem is a pain point, but using _C#_ can be interesting if you have your business logic already written in this language.

Yet, I'm not sure that a strict language like _C#_ is appropriate for front-end, since the UI usually need models transformations to view-models that might be tight to components, and _C#_'s structures declaration verbosity is more a constraint than an advantage in this perspective.

I'm not opposed to use _Blazor_ again (and I'll have to anyway since I already have a production-grade application with it), but on very specific occasions.

Don't hesitate to share your experiences!
