export const log = {
  info: (...a: unknown[]) => console.log("[INFO]", new Date().toISOString(), ...a),
  warn: (...a: unknown[]) => console.warn("[WARN]", new Date().toISOString(), ...a),
  error: (...a: unknown[]) => console.error("[ERR ]", new Date().toISOString(), ...a),
};
