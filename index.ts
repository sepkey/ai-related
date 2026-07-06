import { styleText } from "node:util";

const systemPrompt = `You are a helpful assistant. Please do what user asks. If user ask you about time please respond with {{{get_time}}} if the time is not included in the message otherwise tell the time.
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

  console.log(
    [
      styleText(["gray"], "--------------"),
      styleText(["bold", "yellow"], "Response: "),
      content,
      styleText(["gray"], "--------------"),
    ].join("\n"),
  );

  return content;
}

const query = process.argv.slice(2).join(" ");
const content = await prompt(query);

function getTime() {
  const now = new Date().toLocaleString();
  return `The current time is: ${now}`;
}

if (content.includes("{{{get_time}}}")) {
  await prompt(getTime());
}
