import { styleText } from "node:util";

const systemPrompt = `You are a helpful assistant. Please do what user asks. If user ask you about time please respond with ${new Date().toLocaleString()}
`;

async function prompt(query: string) {
  console.log(
    [
      styleText(["gray"], "--------------"),
      styleText(["bold", "green"], "System Prompt: "),
      styleText(["gray"], systemPrompt),
      styleText(["bold", "blue"], "User Prompt: "),
      styleText(["gray"], query),
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
          content: query,
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

  console.log(
    [
      styleText(["bold", "yellow"], "Response: "),
      styleText(["gray"], content),
    ].join("\n"),
  );

  return content;
}

const query = process.argv.slice(2).join(" ");
await prompt(query);
