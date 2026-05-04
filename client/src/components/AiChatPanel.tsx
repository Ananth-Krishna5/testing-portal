import { Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { http } from "../api/http";

export function AiChatPanel(): JSX.Element {
  const [input, setInput] = useState("Summarize current testing posture.");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const { data } = await http.post<{ reply: string }>("/ai/chat", { message: text, context: {} });
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Agent unavailable. Ensure the AI service is running." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", minHeight: 420 }}>
      <Typography fontWeight={700} gutterBottom>
        AI Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Ask questions about programs, failures, and certification usage.
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1} sx={{ flex: 1, overflow: "auto", mb: 1 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "92%" }}>
            <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: m.role === "user" ? "action.selected" : "background.default" }}>
              <Typography variant="body2" whiteSpace="pre-wrap">
                {m.text}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask TestHub…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        />
        <Button variant="contained" onClick={send} disabled={busy}>
          Send
        </Button>
      </Stack>
    </Paper>
  );
}
