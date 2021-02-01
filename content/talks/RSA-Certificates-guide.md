---
title: "RSA Certificates - A comprehensive guide"
date: 2020-11-18T00:15:42+01:00
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

[*RSA* (*`R`ivest–`S`hamir–`A`dleman*)](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) is an *asymmetric encryption* protocol, widely used in the tech world because of its robustness. It is one of the central pieces of [*TLS* (_`T`ransport `L`ayer `S`ecurity_) and its predecessor, *SSL* (_`S`ecure `S`ocket `L`ayer_)](https://en.wikipedia.org/wiki/Transport_Layer_Security)

What does *asymmetric encryption* means ? It is opposed to the *symmetric encryption*, where the same key can be used to encode and decode data. In *asymmetric encryption*, there are 2 keys, and each of those keys can encrypt messages, and decode messages encrypted by the other key.

*RSA* is also able to give a proof that you are actually talking with the right person, preventing [*Man-In-The-Middle* attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack), if you use it correctly.

While the 2 points above are super great for security and privacy, they come also with some drawbacks: generating, manipulating and using RSA keys can be a bit confusing, and that's why I'm writing this article.

{{< alert theme="info" >}}
See this article like a personal guide I publish in case it can help someone. It is not meant to be precise or exhaustive.
{{</ alert >}}

## File formats

As said above, [*RSA*](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) being an *asymmetric encryption* protocol, it must have 2 different keys. But to support more security methods, like [*Man-In-The-Middle*](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) prevention, there are other file formats, each with its own use. Let's explain the most common of them.

### `.key`: The private `key`

The private key is one of the 2 keys mentioned above, that is meant to be used by the server.

{{< alert theme="danger" >}}
As its name suggests, this file is **super** critical: anyone having this can decode messages that are sent to you, encrypted with your [public key](#pub-the-public-key).

You should **never __ever__** send it to untrusted party. Other people should have the [public key](#pub-the-public-key).
{{</ alert >}}

#### What does it contains ?

A "*simple*" [base64](https://en.wikipedia.org/wiki/Base64) string with a distinguishing header to identify it as a private key. It looks like this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBANM6etMEO+MNxAYEEUZeFqPdfm+ng0MS9HqObHWqMIoUPG4pSYyq
MgTunrhUdYpkF+pWntT4o6OUIQ00XFavNQ8CAwEAAQJAHJDZEXaOHsu6ydF9AJYy
26BVvAXcc5K5q2Vdd6A3hkStZ6LdJvwISKgCl1sUM17v7pO5kYIU46UioxC5mlDR
mQIhAO8md6mejmATo2fEit3D3kWhHRGl....
-----END RSA PRIVATE KEY-----
```

The random stuff in the middle has a length depending on the *modulus* of the key, measured in *bits* (not *bytes*).

#### How to make one ?

```sh
openssl genrsa -out test.key 2048
```

Here, `2048` is the modulus. To be considered safe until 2030, it is recommended to be [at least 2048 *bits*](https://www.javamex.com/tutorials/cryptography/rsa_key_length.shtml) (so 256 *bytes*). But if computation is not a problem, don't hesitate to go for 4096 *bits*. Without misplaced analogy, keep in mind that the larger, the better :grin:.

#### How to inspect ?

```sh
openssl rsa -text -in foo.key
```

{{< expand "Sample output" >}}
```
RSA Private-Key: (512 bit, 2 primes)
modulus:
    00:d3:3a:7a:d3:04:3b:e3:0d:c4:06:04:11:46:5e:
    16:a3:dd:7e:6f:a7:83:43:12:f4:7a:8e:6c:75:aa:
    30:8a:14:3c:6e:29:49:8c:aa:32:04:ee:9e:b8:54:
    75:8a:64:17:ea:56:9e:d4:f8:a3:a3:94:21:0d:34:
    5c:56:af:35:0f
publicExponent: 65537 (0x10001)
privateExponent:
    1c:90:d9:11:76:8e:1e:cb:ba:c9:d1:7d:00:96:32:
    db:a0:55:bc:05:dc:73:92:b9:ad:65:5d:77:a0:37:
    86:44:ad:67:a2:dd:26:fc:08:48:a8:02:97:5b:14:
    33:5e:ef:ee:93:b9:91:82:14:e3:a5:22:a3:10:b9:
    9a:50:d1:99
prime1:
    00:ef:26:77:a9:9e:8e:60:13:a3:67:c4:8a:dd:c3:
    de:45:a1:1d:11:a5:25:0f:69:c9:60:48:1f:4b:ba:
    33:08:15
prime2:
    00:e2:1c:63:87:35:ad:9e:91:12:82:0a:5b:02:24:
    89:5d:8c:e9:04:b3:dd:ad:4e:18:ca:2e:26:fb:8d:
    b6:8d:93
exponent1:
    00:b7:da:1b:de:83:ad:b3:01:05:fb:8d:66:b0:ac:
    96:e1:72:c6:15:3d:9f:ad:24:c9:92:c2:7f:84:c9:
    45:d8:2d
exponent2:
    00:a5:40:2c:39:50:30:c0:97:b4:18:18:2b:65:48:
    80:a0:3f:70:b9:c0:1e:be:1f:3a:9c:e0:d8:1a:b6:
    fa:79:43
coefficient:
    67:92:a7:75:4d:f4:2b:dd:d4:01:91:f1:a2:95:85:
    f9:3e:07:e3:99:59:03:13:5f:49:97:79:86:96:9e:
    a8:c3
```
{{</ expand >}}

There is a lot of maths involved here, so I won't go any further. But if you're curious, go ahead and find out what those are !

### `.pub`: The `pub`lic key

#### What does it contains ?

#### How to make one ?

#### How to inspect ?

### `.crt`: The `c`e`rt`ificate

#### What does it contains ?

#### How to make one ?

#### How to inspect ?

#### How to inspect ?

```sh
openssl x509 -noout -text -in foo.crt
```

### `.pem`: 

[How to create a .pem file for SSL Certificate Installations](https://www.suse.com/support/kb/doc/?id=000018152)
https://en.wikipedia.org/wiki/Privacy-enhanced_Electronic_Mail

#### What does it contains ?

#### How to make one ?

#### How to inspect ?

### `.p12`

<https://en.wikipedia.org/wiki/PKCS_12>

#### What does it contains ?

#### How to make one ?

#### How to inspect ?

### `.csr`: The `C`ertificate `S`igning `R`equest

#### What does it contains ?

#### How to make one ?

#### How to inspect ?

```sh
openssl req -noout -text -in foo.csr
```