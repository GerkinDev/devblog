# DevBlog

The theme used is [zzo](https://zzo-docs.vercel.app/zzo).

Some config fields are secret and are expected to be loaded from environment. Create a `.env` file and run the following to pass args to hugo:

```sh
export $(cat .env | xargs);
hugo server -DEF
```

Tested on

```
$ hugo version  
hugo v0.156.0-9d914726dee87b0e8e3d7890d660221bde372eec+extended linux/amd64 BuildDate=2026-02-18T16:39:55Z VendorInfo=snap:0.156.0
```

## Third party

- [**GitHub corners**](https://github.com/tholman/github-corners): MIT
- [**findAndReplaceDOMText**](https://github.com/padolsey/findAndReplaceDOMText): unlicense

## Continuous Deployment

CI is here: https://app.circleci.com/pipelines/github/GerkinDev/devblog
