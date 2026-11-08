export type SessionEndReason =
  | "account_inactive"
  | "session_expired"
  | "logged_out";

type SessionEndListener = (reason: SessionEndReason) => void;

const CHANNEL_NAME = "learnup-auth-session";
const listeners = new Set<SessionEndListener>();
let channel: BroadcastChannel | null = null;
let sessionVersion = 0;

function isSessionEndReason(value: unknown): value is SessionEndReason {
  return (
    value === "account_inactive" ||
    value === "session_expired" ||
    value === "logged_out"
  );
}

function notify(reason: SessionEndReason) {
  sessionVersion += 1;
  listeners.forEach((listener) => listener(reason));
}

export function getSessionVersion() {
  return sessionVersion;
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (isSessionEndReason(event.data)) notify(event.data);
    });
  }
  return channel;
}

export function subscribeToSessionEnd(listener: SessionEndListener) {
  listeners.add(listener);
  getChannel();
  return () => {
    listeners.delete(listener);
  };
}

export function endSession(reason: SessionEndReason) {
  notify(reason);
  getChannel()?.postMessage(reason);
}
