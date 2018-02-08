'use babel'

import fs from 'fs'

export function provideBuilder() {
  return class ElmAnalyseBuilder {
    constructor(cwd) {
      this.cwd = cwd
    }

    getNiceName() {
      return 'Elm'
    }

    isEligible() {
      return fs.existsSync(`${this.cwd}/elm-package.json`)
    }

    settings() {
      const functionMatch = function(output) {
        try {
          const result = JSON.parse(_lastline(output))
          const nestedLintMessages = result.messages.map(function(m) { return _formatResult(m) })
          const lintMessages = [].concat(...nestedLintMessages)
          return lintMessages
        } catch (e) {
          console.log(e);
          atom.notifications.addError("atom-build-elm-analyse", {
            description: output,
            dismissable: true,
            detail: e.message,
            stack: e.stack,
          })
          return []
        }
      }

      return [
        {
          name: 'Elm: elm-analyse',
          exec: 'elm-analyse',
          args: [ '--format=json' ],
          sh: false,
          functionMatch: functionMatch,
          atomCommandName: 'build:elm-analyse',
        }
      ]
    }
  }
}

export function _lastline(stdout) {
  const lines = stdout.trim().split("\n")
  return lines[lines.length - 1]
}

export function _formatResult({file, type, data}) {
  if (data.properties.range) {
    const [l1, c1, l2, c2] = data.properties.range
    return [ _singleMessage(type, file, data.description, [[l1, c1], [l2, c2]]) ]
  } else if (data.properties.ranges) {
    const ranges = data.properties.ranges
    return _duplicateByRanges(type, file, data.description, ranges)
  } else {
    return [ _singleMessage(type, file, data.description, [[0, 0], [0, 0]]) ]
  }
}

export function _singleMessage(type, file, desc, [[l1, c1], [l2, c2]]) {
  return {
    type: 'warning',
    file: file,
    message: `${desc} (${type})`,
    url: `https://stil4m.github.io/elm-analyse/#/messages/${type}`,
    // Indexes are one-based
    line: l1 + 1,
    line_end: l2 + 1,
    col: c1 + 1,
    col_end: c2 + 1,
  }
}

export function _duplicateByRanges(type, file, desc, ranges) {
  ranges.map(function([l1, c1, l2, c2]) { _singleMessage(type, file, desc, [[l1, c1], [l2, c2]]) })
}
