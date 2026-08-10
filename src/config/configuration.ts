export default () => ({
  port: parseInt(process.env.PORT ?? '5000', 10),
  database: {
    uri:
      process.env.DB_URI ??
      'mongodb://localhost:27017/secure-note-taking-app-db',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME ?? 'Admin',
  },
});
