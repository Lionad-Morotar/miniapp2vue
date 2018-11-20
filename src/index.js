import Compiler from "/lib";

var unsolvedFolder = "./swan/swan-template";

var vuetpl = Compiler.convert(unsolvedFolder, {
  plat: "swan",
  type: "template"
});

console.log("RESULT:", vuetpl);
