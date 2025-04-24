import { Client } from "@xhayper/discord-rpc";

const client = new Client({
  clientId: "1364804876088901702",
});

client.on("ready", () => {
  client.user?.setActivity({
    state: "Hello, world!",
    type: 2,
  });
});

client.login();
