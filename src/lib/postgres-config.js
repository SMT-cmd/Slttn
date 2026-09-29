/**
 * Some managed Postgres hosts advertise IPv6 first. The deploy/build runtime
 * used here cannot always route IPv6, which surfaces as ENETUNREACH before the
 * client ever tries IPv4. Force IPv4 for all direct Postgres connections.
 *
 * @typedef {import("pg").PoolConfig & { family?: 4 }} IPv4PoolConfig
 *
 * @param {string} connectionString
 * @param {import("pg").PoolConfig} [overrides]
 * @returns {IPv4PoolConfig}
 */
export function createPostgresPoolConfig(connectionString, overrides = {}) {
  return /** @type {IPv4PoolConfig} */ ({
    connectionString,
    ...overrides,
    family: 4,
  });
}
