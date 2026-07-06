const systemPrompt = `You are a helpful assistant for creating shell scripts.Please answer the questions by responding the best bash command if applicable. If not applicable, respond with "Not applicable".
`;

async function prompt(query: string) {
  console.log(["Prompt: ", query].join("\n"));
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

  console.log(["Response: ", content].join("\n"));

  return content;
}

const query = process.argv.slice(2).join(" ");
await prompt(query);
