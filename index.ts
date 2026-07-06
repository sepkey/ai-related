import fs from "node:fs";
import { styleText } from "node:util";

const systemPrompt = `You are a helpful assistant. Please do what user asks. If user ask you about time please respond with {{{get_time}}} if the time is not included in the message otherwise tell the time.

you have access to the following tools:
1.get_time {}: returns the current time in a human-readable format.
2.write_file {fileName:string,content:string}: writes the specified content to a file at the given fileName.


you can use tools with the following syntax:
<tool_call>{"name":<name>,"arguments":{...}}</tool_call>
`;

let context = "";
async function prompt(query: string) {
  context += `${context}\n${query}`;
  console.log(
    [
      styleText(["gray"], "--------------"),
      styleText(["bold", "green"], "System Prompt: "),
      styleText(["gray"], systemPrompt),
      styleText(["bold", "blue"], "User Prompt: "),
      styleText(["gray"], context),
    ].join("\n"),
  );

  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma4",
      stream: false,
      messages: [
        {
          role: "user",
          content: context,
        },
        {
          role: "system",
          content: systemPrompt,
        },
      ],
    }),
  });

  const json = await res.json();

  const content = json.message.content;
  const toolCallMatch = content.match(/<tool_call>(.*?)<\/tool_call>/s);
  console.log("Tool call match:", toolCallMatch[1]);
  let toolcall = { name: null, arguments: [] };
  if (toolCallMatch[1]) {
    try {
      toolcall = JSON.parse(toolCallMatch[1]);
    } catch (error) {
      throw new Error(`Invalid tool call format `);
    }
  }

  if (toolcall.name) {
    console.log(
      [
        styleText(["gray"], "--------------"),
        styleText(["bold", "magenta"], "Tool call: "),
        JSON.stringify(toolcall, null, 2),
        styleText(["gray"], "--------------"),
      ].join("\n"),
    );
  } else {
    console.log(
      [
        styleText(["gray"], "--------------"),
        styleText(["bold", "yellow"], "Response: "),
        content,
        styleText(["gray"], "--------------"),
      ].join("\n"),
    );
  }

  return { content, toolcall };
}

const query = process.argv.slice(2).join(" ");
const { content, toolcall } = await prompt(query);

function getTime() {
  const now = new Date().toLocaleString();
  return `The current time is: ${now}`;
}

function writeFile({
  fileName,
  content,
}: {
  fileName: string;
  content: string;
}) {
  fs.writeFileSync(fileName, content, "utf-8");
  return `Successfully wrote to file: ${content} in ${fileName}`;
}

while (toolcall.name) {
  switch (toolcall.name) {
    case "get_time": {
      let timeContext = getTime();
      await prompt(timeContext);
      break;
    }
    case "write_file": {
      let writeFileContext = writeFile(toolcall.arguments);
      await prompt(writeFileContext);
      break;
    }
  }
}
