module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const connection =
    client === 'postgres'
      ? {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', false) && {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
          },
          schema: env('DATABASE_SCHEMA', 'public'),
        }
      : {
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        };

  return {
    connection: {
      client,
      connection,
      pool:
        client === 'sqlite'
          ? { min: 0, max: 1 }
          : {
              min: env.int('DATABASE_POOL_MIN', 2),
              max: env.int('DATABASE_POOL_MAX', 10),
            },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
      useNullAsDefault: client === 'sqlite',
    },
  };
};
