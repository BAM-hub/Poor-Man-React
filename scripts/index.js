import fs from "fs";

class Token {
  type;
  attributes = {};
  children = [];

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

const data = fs.readFileSync("../src/test.tsx", "utf8");

console.log(data);

let parseing = false;

let jsxString = "";

data.split("\n").forEach((line, index) => {
  if (line.includes("return")) {
    let { out, isParsing } = parseLine("", line, index);
    parseing = isParsing;
  } else if (parseing) {
    let { out, isParsing } = parseLine("", line, index);
    parseing = isParsing;
    jsxString += out;
    console.log("function output", out, isParsing);
  }
});

function parseLine(out, line) {
  if (line.includes("(")) {
    return { out, isParsing: true };
  } else if (line.includes(")")) {
    return { out, isParsing: false };
  } else {
    const trimmed = line.trim();
    out += trimmed;
    return { out, isParsing: true };
  }
}

const chars = jsxString.split("");

let token = null;
const stack = [];

for (let i = 0; i < chars.length; i++) {
  const char = chars[i];

  if (char === "<") {
    let { tagName, type } = extractTagName(chars, i);
    const newToken = new Token(tagName);

    if (type === "end") {
      const lastToken = stack.pop();
      if (lastToken.type !== tagName || !lastToken) {
        throw new Error(
          `Mismatched closing tag: expected </${lastToken.type}>, found </${tagName}>`
        );
      }
    } else {
      stack.push(newToken);
    }
    console.log(newToken);
  }
}

function extractTagName(jsx, i) {
  let tagName = "";
  let type = "start";

  for (let j = i + 1; j < jsx.length; j++) {
    const nextChar = chars[j];
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

  return { tagName, type };
}
