# atom-build-elm-analyse

Run [elm-analyse] in Atom Editor using [atom-build].

[elm-analyse]: https://github.com/stil4m/elm-analyse
[atom-build]: https://github.com/noseglid/atom-build

Depends on:

- [elm-analyse]
- [atom-build]

`elm-analyse` must be installed globally.

Working directory is always current project root.
Both `elm-package.json` and `elm-analyse.json` must be found there.

## Usage

Trigger build for the whole project, then [elm-analyse] will run, too.
(by default [atom-build] key binding, <kbd>Option + Cmd + b</kbd> or <kbd>F9</kbd> in mac)

Alternatively, you can selectively run [elm-analyse].

1. Open command palette (<kbd>Shift + Cmd + P</kbd> in mac)
2. Run `Build: Elm Analyse`

## Motivation

I initially published [linter-elm-analyse], though [elm-analyse] is rather costly operation
and takes usually longer time than per-file linters/formatters.
In such cases it would be better to manually run it on-demand,
so build provider is the way to take.

[linter-elm-analyse]: https://github.com/ymtszw/linter-elm-analyse
