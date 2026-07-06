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
