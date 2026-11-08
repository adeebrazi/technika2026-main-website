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

// Global state for WhatsApp Squads
interface WhatsAppGroupItem {
  id: number;
  name: string;
  tag: string;
  link: string;
  count: number;
  status: "OPEN" | "LOCKED" | "FROZEN";
  accent: string;
}

interface AuditLog {
  timestamp: string;
  type: string;
  message: string;
}

const auditLogs: AuditLog[] = [
  {
    timestamp: new Date().toISOString(),
    type: "SYSTEM_INIT",
    message: "WhatsApp Allocation Engine initialized on Technika 6.0 Main Website.",
  },
];

function logEvent(type: string, message: string) {
  auditLogs.unshift({
    timestamp: new Date().toISOString(),
    type,
    message,
  });
  if (auditLogs.length > 500) auditLogs.pop();
}

const whatsappServerState = {
  limit: 1000,
  groups: [
    {
      id: 1,
      name: "Group Alpha",
      tag: "Alpha",
      link: "https://chat.whatsapp.com/Eqqx6LcVA472hc0trTMkcC",
      count: 1000,
      status: "FROZEN" as const,
      accent: "#00FF66",
    },
    {
      id: 2,
      name: "Group Beta",
      tag: "Beta",
      link: "https://chat.whatsapp.com/Byt0h7SkQzX7kLuNLgDPeW",
      count: 36,
      status: "OPEN" as const,
      accent: "#FFE600",
    },
  ],
  activeGroupId: 2 as number | null,
  totalJoined: 1036,
  totalCapacity: 2000,
  totalRemaining: 964,
  allFull: false,
};

function recalculateState() {
  const limit = whatsappServerState.limit || 1000;
  let activeFound = false;
  const previousActive = whatsappServerState.activeGroupId;

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

  if (previousActive && whatsappServerState.activeGroupId && previousActive !== whatsappServerState.activeGroupId) {
    logEvent("ROLLOVER", `Group #${previousActive} filled and FROZE. Group #${whatsappServerState.activeGroupId} is now OPEN.`);
  } else if (previousActive && whatsappServerState.allFull) {
    logEvent("ALL_FULL", `All WhatsApp groups are at maximum capacity (${whatsappServerState.totalCapacity}/${whatsappServerState.totalCapacity}).`);
  }

  return whatsappServerState;
}

function handleJoin() {
  recalculateState();
  const activeGroup = whatsappServerState.groups.find((g) => g.status === "OPEN");

  if (!activeGroup) {
    return {
      success: false,
      message: `All ${whatsappServerState.groups.length} WhatsApp groups are at maximum capacity (${whatsappServerState.totalCapacity}/${whatsappServerState.totalCapacity}).`,
      state: whatsappServerState,
    };
  }

  activeGroup.count += 1;
  logEvent(
    "MEMBER_JOIN",
    `Seat claimed in ${activeGroup.name} (${activeGroup.tag}). Seats remaining: ${Math.max(
      0,
      whatsappServerState.limit - activeGroup.count,
    )}`,
  );
  recalculateState();

  return {
    success: true,
    message: `Seat secured in ${activeGroup.name}!`,
    joinedGroupId: activeGroup.id,
    whatsappUrl: activeGroup.link,
    state: whatsappServerState,
  };
}

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, Origin, Accept",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache, no-store, must-revalidate",
      ...CORS_HEADERS,
    },
  });
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

      // Handle CORS Preflight for all WhatsApp API endpoints
      if (request.method === "OPTIONS" && (url.pathname.startsWith("/api/whatsapp") || url.pathname.startsWith("/api/status"))) {
        return new Response(null, {
          status: 200,
          headers: CORS_HEADERS,
        });
      }

      // 1. GET status
      if (
        (url.pathname === "/api/whatsapp/status" ||
          url.pathname === "/api/status" ||
          url.pathname === "/api/whatsapp" ||
          url.pathname === "/api/whatsapp/") &&
        request.method === "GET"
      ) {
        return jsonResponse(recalculateState());
      }

      // 2. POST join
      if (
        (url.pathname === "/api/whatsapp/join" || url.pathname === "/api/join") &&
        request.method === "POST"
      ) {
        const result = handleJoin();
        return jsonResponse(result);
      }

      // 3. POST config (Update invite links, names, counts, limit)
      if (
        (url.pathname === "/api/whatsapp/config" || url.pathname === "/api/admin/config") &&
        request.method === "POST"
      ) {
        try {
          const body = (await request.json()) as any;
          if (body.limit && Number(body.limit) > 0) {
            whatsappServerState.limit = Number(body.limit);
          }
          if (Array.isArray(body.groups)) {
            body.groups.forEach((incoming: any) => {
              const existing = whatsappServerState.groups.find((g) => g.id === incoming.id);
              if (existing) {
                if (incoming.name) existing.name = incoming.name;
                if (incoming.link) existing.link = incoming.link;
                if (incoming.tag) existing.tag = incoming.tag;
                if (incoming.accent) existing.accent = incoming.accent;
                if (typeof incoming.count === "number") existing.count = incoming.count;
              }
            });
            logEvent("CONFIG_UPDATE", "WhatsApp squad configuration & invite URLs updated.");
          }
          const fresh = recalculateState();
          return jsonResponse({
            success: true,
            message: "WhatsApp configuration saved successfully.",
            state: fresh,
          });
        } catch {
          return jsonResponse({ success: false, message: "Invalid JSON body" }, 400);
        }
      }

      // 4. POST simulate (Quota adjustment: add, set, reset, reset-all)
      if (
        (url.pathname === "/api/whatsapp/simulate" || url.pathname === "/api/admin/simulate") &&
        request.method === "POST"
      ) {
        try {
          const body = (await request.json()) as any;
          const { groupId, action, value } = body;
          const group = whatsappServerState.groups.find((g) => g.id === Number(groupId));

          if (!group && action !== "reset-all") {
            return jsonResponse({ success: false, message: "Group not found." }, 404);
          }

          if (action === "add" && group) {
            group.count += Number(value || 1);
            logEvent("QUOTA_ADJUST", `Added ${value} members to Group #${groupId}. Count is now ${group.count}.`);
          } else if (action === "set" && group) {
            group.count = Number(value);
            logEvent("QUOTA_ADJUST", `Set Group #${groupId} count directly to ${value}.`);
          } else if (action === "reset" && group) {
            group.count = 0;
            logEvent("QUOTA_ADJUST", `Reset Group #${groupId} count back to 0.`);
          } else if (action === "reset-all") {
            whatsappServerState.groups.forEach((g) => (g.count = 0));
            logEvent("QUOTA_RESET_ALL", "All WhatsApp groups reset to 0 members.");
          }

          const fresh = recalculateState();
          return jsonResponse({
            success: true,
            message: "Quota adjustment applied successfully.",
            state: fresh,
          });
        } catch {
          return jsonResponse({ success: false, message: "Invalid JSON body" }, 400);
        }
      }

      // 5. POST add-group
      if (
        (url.pathname === "/api/whatsapp/add-group" || url.pathname === "/api/admin/add-group") &&
        request.method === "POST"
      ) {
        try {
          const body = (await request.json()) as any;
          const { name, tag, link, accent } = body;
          const newId =
            whatsappServerState.groups.length > 0
              ? Math.max(...whatsappServerState.groups.map((g) => g.id)) + 1
              : 1;

          const defaultAccents = ["#00FF66", "#FFE600", "#00D8F6", "#FF007F", "#A855F7", "#FF6B00"];
          const groupAccent = accent || defaultAccents[(newId - 1) % defaultAccents.length];

          const newGroup: WhatsAppGroupItem = {
            id: newId,
            name: name || `Group #0${newId}`,
            tag: tag ? tag.toUpperCase() : `Group ${newId}`,
            link: link || `https://chat.whatsapp.com/invite-new-${newId}`,
            count: 0,
            status: "LOCKED",
            accent: groupAccent,
          };

          whatsappServerState.groups.push(newGroup);
          const fresh = recalculateState();
          logEvent("ADD_GROUP", `Created new WhatsApp group #${newId}: ${newGroup.name}`);

          return jsonResponse({
            success: true,
            message: `Group #${newId} created successfully.`,
            state: fresh,
          });
        } catch {
          return jsonResponse({ success: false, message: "Invalid JSON body" }, 400);
        }
      }

      // 6. POST remove-group
      if (
        (url.pathname === "/api/whatsapp/remove-group" || url.pathname === "/api/admin/remove-group") &&
        request.method === "POST"
      ) {
        try {
          const body = (await request.json()) as any;
          const idToRemove = Number(body.groupId);

          if (whatsappServerState.groups.length <= 1) {
            return jsonResponse(
              { success: false, message: "At least one group must remain in the allocation system." },
              400,
            );
          }

          const groupIndex = whatsappServerState.groups.findIndex((g) => g.id === idToRemove);
          if (groupIndex === -1) {
            return jsonResponse({ success: false, message: "Group not found." }, 404);
          }

          const removedName = whatsappServerState.groups[groupIndex].name;
          whatsappServerState.groups.splice(groupIndex, 1);
          const fresh = recalculateState();
          logEvent("REMOVE_GROUP", `Removed Group #${idToRemove}: ${removedName}`);

          return jsonResponse({
            success: true,
            message: `${removedName} removed successfully.`,
            state: fresh,
          });
        } catch {
          return jsonResponse({ success: false, message: "Invalid JSON body" }, 400);
        }
      }

      // 7. GET logs
      if (
        (url.pathname === "/api/whatsapp/logs" || url.pathname === "/api/admin/logs") &&
        request.method === "GET"
      ) {
        return jsonResponse({ logs: auditLogs });
      }

      // 8. GET export-csv
      if (
        (url.pathname === "/api/whatsapp/export-csv" || url.pathname === "/api/admin/export-csv") &&
        request.method === "GET"
      ) {
        let csv = "Timestamp,Type,Event\n";
        auditLogs.forEach((row) => {
          csv += `"${row.timestamp}","${row.type}","${row.message.replace(/"/g, '""')}"\n`;
        });
        return new Response(csv, {
          status: 200,
          headers: {
            "content-type": "text/csv",
            "content-disposition": `attachment; filename="whatsapp-audit-${Date.now()}.csv"`,
            ...CORS_HEADERS,
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
