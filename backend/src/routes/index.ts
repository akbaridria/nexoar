import { Hono } from "hono";
import { UserService } from "../services/user-history.js";
import { UserRepository } from "../repository/user-history.js";
import type { StacksPayload } from "@hirosystems/chainhook-client";
import { serializeStacksPayload } from "../lib/stacks.js";
import { defaultQueue } from "../lib/queue.js";

const routes = new Hono();
const userService = new UserService(new UserRepository());

routes.get("/", (c) => c.text("Hello!"));

routes.get("/user-history/:address", async (c) => {
  const { address } = c.req.param();
  const history = await userService.findByWalletAddress(address);
  return c.json(history);
});

routes.post("/user-history", async (c) => {
  const payload: StacksPayload = await c.req.json();
  const results = serializeStacksPayload(payload);

  await userService.create(
    results.map((r) => ({ walletAddress: r.owner, optionId: r.optionId }))
  );

  defaultQueue.addBulk(
    results.map((r) => ({
      name: `process-option-${r.optionId}`,
      data: { optionId: r.optionId, expiry: r.expiry },
      opts: {
        delay: Math.max(r.expiry * 1000 - Date.now() + 360000, 0), // add buffer of 1 block (~6minutes)
        backoff: { type: "exponential", delay: 60000 },
        attempts: 5,
      },
    }))
  );
  return c.json({ success: true });
});

export default routes;
