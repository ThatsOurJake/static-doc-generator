import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const compile = (directory: string, outputDir: string) => {
  const program = ts.createProgram({
    rootNames: fs.readdirSync(directory).map((x) => path.join(directory, x)),
    options: {
      outDir: outputDir,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ESNext,
      noImplicitAny: true,
      noEmitOnError: true,
      ignoreDeprecations: "6.0",
    },
  });

  const emitResult = program.emit();
  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!,
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      );
      console.error(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
      );
    } else {
      console.error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );
    }
  });
};

export default compile;
