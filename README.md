# pdoom.org

This is the repository of the pdoom.org website. It is a fork of [distillpub/template](https://github.com/distillpub/template).

### Local Development

First, run `npm install` to install all node modules required. If that fails. try `npm install --legacy-peer-deps` (I know, very elegant). Then, run `npm run dev` to start a watching build rollup server. Due to the way we currently deploy (see next section), in order to see your changes, you need to first run `cp examples/* dist/` and then `npm run dev`, i.e. autorefresh doesn't work.

Please note that the `/blog.html` is not automatic yet, so if you add a new blog post, you need to manually add that to `/blog.html`.

### Deployment
Currently, we deploy the `gh-pages` branch, which is the `dist` folder of this branch. To deploy, do `cp examples/* dist/` and then run `git subtree push --prefix dist origin gh-pages` from the main branch. Yes, this is very clunky and has disadvantages, but first ship 🚀, then fix.

## Contributing
To give feedback, report a bug, or request a feature, please open an issue.

To contribute a change, [check out the contributing guide](CONTRIBUTING.md).


## Disclaimer & License

_This project is research code. It is not an official product of p(doom) or any other institution supporting p(doom)._

Copyright 2018, The Distill Template Authors.

Licensed under the Apache License, Version 2.0

See the [full license](LICENSE).
