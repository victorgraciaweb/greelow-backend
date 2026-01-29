export const EnvConfiguration = () => ({
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
  corsEnabled: process.env.CORS_ENABLED === 'true',
  port: parseInt(process.env.PORT, 10) || 3000,

  titleSwagger: process.env.TITLE_SWAGGER || 'API Documentation',
  descriptionSwagger:
    process.env.DESCRIPTION_SWAGGER || 'API description and usage',
  versionSwagger: process.env.VERSION_SWAGGER || '1.0',
  routeSwagger: process.env.ROUTE_SWAGGER || 'docs',

  jwtSecret: process.env.JWT_SECRET,

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramBaseUrl: process.env.TELEGRAM_BASE_URL,
});
