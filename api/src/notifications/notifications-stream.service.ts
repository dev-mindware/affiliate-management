import { Injectable, Logger, OnModuleDestroy, OnModuleInit, MessageEvent } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { randomUUID } from "crypto";
import Redis from "ioredis";
import { Observable } from "rxjs";
import {
  NOTIFICATION_CREATED_EVENT,
  PublicNotification,
} from "./notification.types";

type StreamTicket = {
  userId: string;
  expiresAt: number;
};

type LocalSubscriber = {
  userId: string;
  next: (event: MessageEvent) => void;
};

const REDIS_CHANNEL = "affiliate:notifications";
const TICKET_TTL_MS = 60_000;
const HEARTBEAT_MS = 25_000;

@Injectable()
export class NotificationsStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsStreamService.name);
  private readonly tickets = new Map<string, StreamTicket>();
  private readonly subscribers = new Map<string, Set<LocalSubscriber>>();
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private ticketCleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.heartbeatTimer = setInterval(() => this.heartbeat(), HEARTBEAT_MS);
    this.ticketCleanupTimer = setInterval(() => this.cleanupTickets(), 30_000);
    await this.connectRedis();
  }

  async onModuleDestroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.ticketCleanupTimer) clearInterval(this.ticketCleanupTimer);
    try {
      await this.subscriber?.quit();
    } catch {
      /* ignore */
    }
    try {
      await this.publisher?.quit();
    } catch {
      /* ignore */
    }
  }

  private async connectRedis() {
    const host = this.config.get<string>("REDIS_HOST");
    if (!host) {
      this.logger.warn("REDIS_HOST not set — using in-process notification bus only");
      return;
    }

    const port = Number(this.config.get("REDIS_PORT") || 6379);
    const password = this.config.get<string>("REDIS_PASSWORD") || undefined;

    try {
      this.publisher = new Redis({ host, port, password, maxRetriesPerRequest: 1, lazyConnect: true });
      this.subscriber = new Redis({ host, port, password, maxRetriesPerRequest: 1, lazyConnect: true });

      this.publisher.on("error", (err) => this.logger.warn(`Redis publisher: ${err.message}`));
      this.subscriber.on("error", (err) => this.logger.warn(`Redis subscriber: ${err.message}`));

      await this.publisher.connect();
      await this.subscriber.connect();
      await this.subscriber.subscribe(REDIS_CHANNEL);
      this.subscriber.on("message", (_channel, message) => {
        try {
          const notification = JSON.parse(message) as PublicNotification;
          this.pushLocal(notification);
        } catch (err: any) {
          this.logger.warn(`Invalid Redis notification payload: ${err?.message || err}`);
        }
      });
      this.logger.log(`Redis pub/sub connected (${host}:${port})`);
    } catch (err: any) {
      this.logger.warn(`Redis unavailable — falling back to in-process bus: ${err?.message || err}`);
      try {
        await this.publisher?.quit();
      } catch {
        /* ignore */
      }
      try {
        await this.subscriber?.quit();
      } catch {
        /* ignore */
      }
      this.publisher = null;
      this.subscriber = null;
    }
  }

  createTicket(userId: string) {
    this.cleanupTickets();
    const ticket = randomUUID();
    const expiresAt = Date.now() + TICKET_TTL_MS;
    this.tickets.set(ticket, { userId, expiresAt });

    // Multi-instance: also store in Redis so any replica can consume the ticket.
    if (this.publisher) {
      void this.publisher
        .set(`affiliate:sse-ticket:${ticket}`, userId, "PX", TICKET_TTL_MS)
        .catch((err) => this.logger.warn(`Failed to store SSE ticket in Redis: ${err?.message || err}`));
    }

    const publicUrl = (this.config.get<string>("API_PUBLIC_URL") || "https://partner.mindware-vps.cloud")
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .replace(/\/+$/, "");
    const prefix = (this.config.get<string>("API_PREFIX") || "/api").replace(/^\/?|\/$/g, "");
    const streamUrl = `${publicUrl}/${prefix}/notifications/stream?ticket=${encodeURIComponent(ticket)}`;

    return {
      ticket,
      expiresIn: Math.floor(TICKET_TTL_MS / 1000),
      streamUrl,
    };
  }

  async consumeTicket(ticket: string): Promise<string | null> {
    const local = this.tickets.get(ticket);
    this.tickets.delete(ticket);
    if (local && local.expiresAt >= Date.now()) {
      if (this.publisher) {
        void this.publisher.del(`affiliate:sse-ticket:${ticket}`).catch(() => undefined);
      }
      return local.userId;
    }

    if (this.publisher) {
      try {
        const key = `affiliate:sse-ticket:${ticket}`;
        const userId = await this.publisher.get(key);
        if (userId) {
          await this.publisher.del(key);
          return userId;
        }
      } catch (err: any) {
        this.logger.warn(`Failed to consume SSE ticket from Redis: ${err?.message || err}`);
      }
    }

    return null;
  }

  openStream(userId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const local: LocalSubscriber = {
        userId,
        next: (event) => {
          try {
            subscriber.next(event);
          } catch {
            /* closed */
          }
        },
      };

      let set = this.subscribers.get(userId);
      if (!set) {
        set = new Set();
        this.subscribers.set(userId, set);
      }
      set.add(local);

      subscriber.next({ data: { type: "connected" } } as MessageEvent);

      return () => {
        set!.delete(local);
        if (set!.size === 0) this.subscribers.delete(userId);
      };
    });
  }

  @OnEvent(NOTIFICATION_CREATED_EVENT)
  async onNotificationCreated(notification: PublicNotification) {
    await this.broadcast(notification);
  }

  /**
   * With Redis: publish only (all instances including self receive via subscribe).
   * Without Redis: push to local SSE subscribers.
   */
  async broadcast(notification: PublicNotification) {
    if (this.publisher) {
      try {
        await this.publisher.publish(REDIS_CHANNEL, JSON.stringify(notification));
        return;
      } catch (err: any) {
        this.logger.warn(`Redis publish failed, falling back to local: ${err?.message || err}`);
      }
    }
    this.pushLocal(notification);
  }

  private pushLocal(notification: PublicNotification) {
    const set = this.subscribers.get(notification.userId);
    if (!set || set.size === 0) return;

    const event: MessageEvent = {
      data: notification,
      type: "notification",
      id: notification.id,
    };

    for (const sub of set) {
      sub.next(event);
    }
  }

  private heartbeat() {
    const event: MessageEvent = { data: { type: "ping" }, type: "ping" };
    for (const set of this.subscribers.values()) {
      for (const sub of set) {
        sub.next(event);
      }
    }
  }

  private cleanupTickets() {
    const now = Date.now();
    for (const [key, value] of this.tickets) {
      if (value.expiresAt < now) this.tickets.delete(key);
    }
  }
}
