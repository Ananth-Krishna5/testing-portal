import { Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { Send24Regular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { http } from "../api/http";
import { FluentIcon } from "./ui/FluentIcon";

function normalizeReply(reply: unknown): string {
  if (typeof reply === "string") return reply;
  if (Array.isArray(reply)) {
    return reply
      .map((item) => normalizeReply(item))
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  if (reply && typeof reply === "object") {
    const value = reply as Record<string, unknown>;

    // Handle OpenAI-style assistant messages: { role, content }
    if ("content" in value) return normalizeReply(value.content);
    if ("text" in value) return normalizeReply(value.text);
    if ("message" in value) return normalizeReply(value.message);

    return JSON.stringify(value);
  }
  return String(reply ?? "");
}

export function AiChatPanel(): JSX.Element {
  const [input, setInput] = useState("Summarize current testing posture.");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const { data } = await http.post<{ reply: unknown }>("/ai/chat", { message: text, context: {} });
      const replyText = normalizeReply(data.reply) || "No response received.";
      setMessages((m) => [...m, { role: "assistant", text: replyText }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Agent unavailable. Ensure the AI service is running." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 420,
        borderRadius: "var(--app-radius-md)",
        border: "1px solid var(--app-border-light)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.97) 100%)",
        boxShadow: "var(--app-shadow-sm)",
      }}
    >
      <Typography sx={{ fontFamily: "var(--app-font-display)", fontWeight: 600, fontSize: "1.05rem" }}>AI Assistant</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Ask questions about programs, failures, and certification usage.
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Stack ref={listRef} spacing={1} className="app-scroll" sx={{ flex: 1, overflow: "auto", mb: 1, pr: 0.5, minHeight: 0 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "92%" }}>
            <Paper
              variant="outlined"
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: m.role === "user" ? "action.selected" : "background.default",
                borderRadius: "var(--app-radius-sm)",
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {m.text}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="Ask TestHub… (Shift+Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (e.shiftKey) return;
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            void send();
          }}
        />
        <Button
          variant="contained"
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          sx={{ minWidth: 100, height: 40 }}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <FluentIcon icon={Send24Regular} size="inline" color="inherit" />}
        >
          {busy ? "Sending" : "Send"}
        </Button>
      </Stack>
    </Paper>
  );
}
