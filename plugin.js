/**
 * Converts TypeScript intersection types (joined with an "&") to a JSDoc type union "|" allowing the file to be
 * processed downstream. This allows you to use the amperstand "&" in your code.
 *
 * Specifically, this creates a compatibility between Visual Studio Code's TypeScript documentation and JSDoc, as
 * Visual Studio Code's parser uses amperstands for type unions, and JSDoc uses pipes.
 * @module intersection
 */
exports.handlers = {
  // eslint-disable-next-line no-unused-vars
  jsdocCommentFound(jsdocComment, parser) {
    let tags = [
      "augments",
      "extends",
      "type",
      "mixes",
      "property",
      "prop",
      "param",
      "typedef",
      "returns",
    ];
    for (let tag of tags) {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const r = new RegExp("^.+@" + tag + "\\s*\\{(?:.+&.+)\\s*\\}", "gm");
      let match = r.exec(jsdocComment.comment);
      const dependencyRoot = jsdocComment.filename
        .replace(`${process.cwd()}/`, "")
        .replace(".js", "");
      while (match && match.length) {
        // since String.replaceAll is not available in all node versions..
        // besides, it can probably be done with this regexp: / & /gi But it has its own issues
        jsdocComment.comment = jsdocComment.comment
          .split(" & ")
          .map((comment, index) => {
            if (index === 0) return comment;
            // allow inline jsdoc like: {SomeType & {prop1: String, prop2: Boolean}}
            if (comment[0] === "{") return ` | ${comment}`;
            return ` | module:${dependencyRoot}~${comment}`;
          })
          .join("");
        match = r.exec(jsdocComment.comment);
      }
    }
  },
};
