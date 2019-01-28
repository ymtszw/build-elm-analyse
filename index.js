"use babel";

import fs from "fs";

export function provideBuilder() {
  return class ElmAnalyseBuilder {
    constructor(cwd) {
      this.cwd = cwd;
    }

    getNiceName() {
      return "Elm";
    }

    isEligible() {
      return fs.existsSync(path.resolve(this.cwd, "elm.json"));
    }

    settings() {
      // Redirecting analysis into temporary file,
      // since large output of child_process.spawn() will be truncated
      // and there is no simple way to collect remaining buffers.
      const tmpResultPath = path.resolve(
        this.cwd,
        ".build-elm-analyse-result.json"
      );
      const functionMatch = function(output) {
        try {
          const resultJson = fs.readFileSync(tmpResultPath, {
            encoding: "utf8"
          });
          const result = JSON.parse(_lastline(resultJson));
          const nestedLintMessages = result.messages.map(function(m) {
            return _formatResult(m);
          });
          const lintMessages = [].concat(...nestedLintMessages);
          return lintMessages;
        } catch (e) {
          console.log(e);
          atom.notifications.addError("build-elm-analyse", {
            description: output,
            dismissable: true,
            detail: e.message,
            stack: e.stack
          });
          return [];
        } finally {
          fs.unlink(tmpResultPath, function(possiblyErr) {
            if (possiblyErr) {
              console.log(possiblyErr);
              atom.notifications.addError("build-elm-analyse", {
                description: `Failed to remove elm-analyse result file (${tmpResultPath}). Please manually remove it.`,
                dismissable: true,
                detail: possiblyErr.message,
                stack: possiblyErr.stack
              });
            }
          });
        }
      }

      return [
        {
          // The provider doc states it requires `cmd` but actually it is `exec`.
          // https://github.com/noseglid/atom-build/issues/570
          exec: `elm-analyse --format=json > ${tmpResultPath}`,
          name: "Elm: elm-analyse",
          sh: true,
          cwd: this.cwd,
          functionMatch: functionMatch,
          atomCommandName: 'build:elm-analyse',
        }
      ];
    }
  };
}

export function _lastline(stdout) {
  const lines = stdout.trim().split("\n");
  return lines[lines.length - 1];
}

export function _formatResult({ file, type, data }) {
  if (data.properties.range) {
    const [l1, c1, l2, c2] = data.properties.range;
    return [_singleMessage(type, file, data.description, [[l1, c1], [l2, c2]])];
  } else if (data.properties.ranges) {
    const ranges = data.properties.ranges;
    return _duplicateByRanges(type, file, data.description, ranges);
  } else {
    return [_singleMessage(type, file, data.description, [[0, 0], [0, 0]])];
  }
}

export function _singleMessage(type, file, desc, [[l1, c1], [l2, c2]]) {
  return {
    type: "warning",
    file: file,
    message: `${desc} (${type})`,
    url: `https://stil4m.github.io/elm-analyse/#/messages/${type}`,
    line: l1,
    line_end: l2,
    col: c1,
    col_end: c2
  };
}

export function _duplicateByRanges(type, file, desc, ranges) {
  ranges.map(function([l1, c1, l2, c2]) {
    _singleMessage(type, file, desc, [[l1, c1], [l2, c2]]);
  });
}
