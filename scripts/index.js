import fs from "fs";

class Token {
  type;
  attributes = {};
  children = [];
  parent = null;
  constructor(type) {
    this.type = type;
  }
  addAttribute(name, value) {
    this.attributes = {
      ...this.attributes,
      [name]: value,
    };
  }
  addchild(child) {
    this.children = [...this.children, child];
  }
}

export default function transformAsync(data, id) {
  console.log("started transforming");

  return new Promise((res, rej) => {
    try {
      const writeStream = fs.createWriteStream("./test.out.js");
      console.log(data);
      let result = "";
      let parseing = false;

      let jsxString = "";

      data.split("\n").forEach((line, index) => {
        if (line.includes("return")) {
          let { out, isParsing } = parseLine("", line, index);
          writeStream.write(line + "\n");
          parseing = isParsing;
        } else if (parseing) {
          let { out, isParsing } = parseLine("", line, index);
          parseing = isParsing;
          jsxString += out;

          if (!isParsing) {
            const chars = jsxString.split("");
            transpile(chars);

            writeStream.write(");\n");
          }
        } else if (!parseing) {
          writeStream.write(line + "\n");
        }
      });

      function parseLine(out, line) {
        if (line.includes("(")) {
          return { out, isParsing: true };
        } else if (line.includes(")")) {
          return { out, isParsing: false };
        } else {
          const trimmed = line.trim();
          out += " " + trimmed;
          return { out, isParsing: true };
        }
      }

      function transpile(chars) {
        let token = null;
        const stack = [];
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];

          if (char === "<") {
            let { tagName, type, props, newIndex } = extractTagName(chars, i);
            i = newIndex;
            const newToken = new Token(tagName);
            if (type === "end") {
              const lastToken = stack.pop();
              if (lastToken.type !== tagName || !lastToken) {
                throw new Error(
                  `Mismatched closing tag: expected </${lastToken.type}>, found </${tagName}>`,
                );
              }

              writeStream.write(`]})${stack.length === 0 ? "" : ","}\n`);
            } else {
              stack.push(newToken);
              writeStream.write(
                `createElement({"type":"${newToken.type}", props:${JSON.stringify(props)}, "children":[ \n`,
              );
            }
          } else {
            let j = i;
            let word = "";

            for (j; j < chars.length; j++) {
              const nextChar = chars[j];

              // if (nextChar === " ") {
              //   break;
              // }

              if (nextChar === "<") {
                const nextToken = chars[j] + chars?.at(j + 1);
                if (nextToken === "</") {
                  j -= 1;
                  break;
                } else if (nextToken !== "< ") {
                  j -= 1;
                  break;
                }
              }
              word += nextChar;
            }
            i = j;

            if (word.trim() === "") {
              continue;
            }
            writeStream.write(`'${word}',`);
          }
        }
        function extractTagName(jsx, i) {
          let tagName = "";
          let type = "start";
          let props = {};
          let newIndex = -1;
          let j = i + 1;

          for (j; j < jsx.length; j++) {
            const nextChar = chars[j];
            if (nextChar === " " || nextChar === "\n") {
              const { props: extractedProps, newIndex } = extractProps(jsx, j);
              j = newIndex;
              props = extractedProps;
              break;
            }
            if (nextChar === "/") {
              type = "end";
              continue;
            }
            if (nextChar !== ">") {
              tagName += nextChar;
            } else {
              break;
            }
          }

          newIndex = j;

          return { tagName, type, props, newIndex };
        }

        function extractProps(jsx, i) {
          let propsString = "";
          let j = i + 1;
          for (j; j < jsx.length; j++) {
            const nextChar = chars[j];
            if (nextChar === ">") {
              break;
            } else {
              propsString += nextChar;
            }
          }
          const props = {};
          propsString.split(" ").forEach((prop) => {
            const [key, value] = prop.split("=");
            if (key && value) {
              props[key] = value.replace(/"/g, "");
            }
          });
          return { props, newIndex: j };
        }
        const finalRes = fs
          .readFileSync("./test.out.js", { encoding: "utf-8" })
          .toString();
        res(finalRes);
      }
    } catch (err) {
      console.error(err);
    }
  });
}
