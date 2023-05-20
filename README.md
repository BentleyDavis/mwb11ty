# Errors that need fixing

- `Example Page` on `Get Started with Massive Wiki` doesn't show brackets and makes a link
- `All Pages` does not work
- `Home` is `readme` but should be `index.html`
- Should these all be `.html` instead of `/`
- passtrhough markdown from output and other ignored files are copied. maybe write my own passthrough?

## External Documentation

- (Markdown-it plugin documentation)[https://github.com/markdown-it/markdown-it/tree/master/docs]
- (Eleventy documentation)[https://www.11ty.dev/docs/]
- (regex 101 - to help with writing regex)[https://regex101.com/]

## dev Notes

```
cd massive-wiki
git log -1 --pretty="%cI\t%an\t%s" -- README.md

2023-05-19T00:57:10-05:00\tBentley Davis\tadd all-pages
```

maybe use (gt-js)[https://github.com/steveukx/git-js]
