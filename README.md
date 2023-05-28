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

### Known Issues

- Git it not reading from the right source repo!!!

## Next Use cases

- See file (git) history on the website

## flow

read config file
Data Gathering

- list out all the source file paths in all the sources excluding ignored files and folders
- calculate Source files destination path
- Report destination conflicts (or last source wins)

Move Source Files

File Processing

- Pull H1 for title
- Determine official Wikilinks
- Create Search Index

- Copy files to destination (including any nexessary transforms like updating )
- ...
