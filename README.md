<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
  </a>
</p>

# Greelow Backend

NestJS REST API for the Greelow MVP.
This service handles business logic and persistence.

## Development setup

1. Copy the `.env.template` file and rename it to `.env`:

```
cp .env.template .env
```

2. After copying the template, update the `.env` file with the required environment variables.

- JWT_SECRET
- TELEGRAM_BOT_TOKEN (You can create a new bot and get the token from BotFather on Telegram: https://t.me/BotFather)

3. Install the project dependencies using Yarn:

```
yarn install
```

4. Start the Postgres database using Docker Compose:

```
docker compose up -d
```

5. Start the app in development mode with automatic reload:

```
yarn start:dev
```

6. If you want to use Nest CLI commands globally, install it with:

```
npm i -g @nestjs/cli
```

## Seed Execution

To populate the database with initial data:

http://localhost:3000/api/seed

## API Documentation

This project includes API documentation using Swagger. You can access it to explore the available endpoints and test them.

Swagger URL
After starting the application, you can access the Swagger documentation at the following URL:

http://localhost:3000/api/docs

Make sure to replace <PORT> with the actual port defined in your .env file (e.g., 3000 if using the default port).

Swagger provides a convenient interface to view all available routes and schemas.

## Running tests

Run the tests using the following commands:

- Run tests normally:

```
yarn test
```

- Run tests with coverage:

```
yarn test:cov
```

## Tech stack

- NestJS
- TypeScript
- Postgres
- Docker
