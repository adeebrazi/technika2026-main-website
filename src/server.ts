import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// Global in-memory state for WhatsApp Squads
interface WhatsAppGroupItem {
  id: number;
  name: string;
  tag: string;
  link: string;
  count: number;
  status: "OPEN" | "LOCKED" | "FROZEN";
  accent: string;
}

const whatsappServerState = {
  limit: 1000,
  groups: [
    {
      id: 1,
      name: "Group Alpha",
      tag: "Alpha",
      link: "https://chat.whatsapp.com/JGuwj0BeaqXHtaOT8azHtc",
      count: 0,
      status: "OPEN" as const,
      accent: "#00FF66",
    },
    {
      id: 2,
      name: "Group Beta",
      tag: "Beta",
      link: "https://chat.whatsapp.com/CjfVMQB3G8oA9IlKH3RTXm",
      count: 0,
      status: "LOCKED" as const,
      accent: "#FFE600",
    },
    {
      id: 3,
      name: "Group Gamma",
      tag: "Gamma",
      link: "https://chat.whatsapp.com/invite-gamma-03",
      count: 0,
      status: "LOCKED" as const,
      accent: "#00D8F6",
    },
    {
      id: 4,
      name: "Group Delta",
      tag: "Delta",
      link: "https://chat.whatsapp.com/invite-delta-04",
      count: 0,
      status: "LOCKED" as const,
      accent: "#FF007F",
    },
  ],
  activeGroupId: 1 as number | null,
  totalJoined: 0,
  totalCapacity: 4000,
  totalRemaining: 4000,
  allFull: false,
};

function recalculateState() {
  const limit = whatsappServerState.limit || 1000;
  let activeFound = false;

  whatsappServerState.groups.forEach((group) => {
    if (group.count < 0) group.count = 0;

    if (group.count >= limit) {
      group.count = limit;
      group.status = "FROZEN";
    } else if (!activeFound) {
      group.status = "OPEN";
      activeFound = true;
    } else {
      group.status = "LOCKED";
    }
  });

  whatsappServerState.allFull = !activeFound;
  whatsappServerState.activeGroupId = activeFound
    ? (whatsappServerState.groups.find((g) => g.status === "OPEN")?.id ?? null)
    : null;
  whatsappServerState.totalJoined = whatsappServerState.groups.reduce((acc, g) => acc + g.count, 0);
  whatsappServerState.totalCapacity = whatsappServerState.groups.length * limit;
  whatsappServerState.totalRemaining = Math.max(
    0,
    whatsappServerState.totalCapacity - whatsappServerState.totalJoined,
  );

  return whatsappServerState;
}

function handleJoin() {
  recalculateState();
  const activeGroup = whatsappServerState.groups.find((g) => g.status === "OPEN");

  if (!activeGroup) {
    return {
      success: false,
      message: "All 4 WhatsApp groups are at maximum capacity (1000/1000).",
      state: whatsappServerState,
    };
  }

  activeGroup.count += 1;
  recalculateState();

  return {
    success: true,
    message: `Seat secured in ${activeGroup.name}!`,
    joinedGroupId: activeGroup.id,
    whatsappUrl: activeGroup.link,
    state: whatsappServerState,
  };
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Dedicated edge API endpoints for WhatsApp Group Allocation
      if (url.pathname === "/api/whatsapp/status" || url.pathname === "/api/status") {
        return new Response(JSON.stringify(recalculateState()), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "no-cache",
          },
        });
      }

      if (
        (url.pathname === "/api/whatsapp/join" || url.pathname === "/api/join") &&
        request.method === "POST"
      ) {
        const result = handleJoin();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "no-cache",
          },
        });
      }

      // Delegate all other routes to TanStack Start SSR
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
