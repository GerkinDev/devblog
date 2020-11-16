# DevBlog

The theme used is [zzo](https://zzo-docs.vercel.app/zzo).

Some config fields are secret and are expected to be loaded from environment. Create a `.env` file and run the following to pass args to hugo:

```sh
export $(cat .env | xargs);
hugo server -DEF
```