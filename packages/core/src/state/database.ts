import * as z from '@zod/mini';

const roll = z.interface({
  dice: z.number().check(z.minimum(1)),
  sides: z.number().check(z.minimum(1)),
  modifier: z.optional(z.number()),
});

const compare = z.object({
  compare: z.enum(['<', '>', '>=', '<=', '==', '!=']),
  value: z.number(),
});

const wavePayload = z.object({
  enemies: z
    .array(z.enum(['enemy1', 'enemy2', 'enemy3', 'enemy4', 'enemy5']))
    .check(z.minLength(6)),
});

const hazardPayload = z.object({
  type: z.string(),
  odds: z.object({
    roll,
    compare,
  }),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  damage: z.number(),
});

const bossPayload = z.object({
  bossType: z.string(),
  health: z.number(),
  abilities: z.array(z.string()),
});

// Define the union schema
const schema = z.array(
  z.union([
    z.object({
      t: z.number(),
      event: z.literal('wave'),
      payload: wavePayload,
    }),
    z.object({
      t: z.number(),
      event: z.literal('hazard'),
      payload: hazardPayload,
    }),
    z.object({
      t: z.number(),
      event: z.literal('boss'),
      payload: bossPayload,
    }),
  ]),
);

// Export the type
export type GameEvent = z.infer<typeof schema>[number];
export default schema;
