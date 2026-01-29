# DECISIONS.md

## Technical Decisions and Trade-offs

This document records the most relevant technical decisions made in the project and the associated trade-offs.

---

### 1. Hexagonal Architecture (Ports & Adapters)

- **Decision:** Implement hexagonal architecture, separating domain, use cases, and infrastructure (repositories, gateways, external services).
- **Why:** Improves maintainability, allows changing external providers without affecting business logic, and facilitates unit testing of the isolated domain.
- **Trade-off:** Increases initial complexity and number of folders/classes compared to a traditional monolith.

---

### 2. Use of DTOs and Mappers

- **Decision:** Expose data through DTOs (`ConversationResponseDto`, `MessageResponseDto`) and mappers (`ConversationMapper`, `MessageMapper`).
- **Why:** Keeps the domain isolated from presentation and allows formatting data such as converting `Date` to string.
- **Trade-off:** Reduced flexibility when using a single DTO for listing and sending messages.

---

### 3. Receiving Telegram Messages via Polling (`getUpdates`)

- **Decision:** Implement a polling service every 5 seconds.
- **Why:** Simplifies local testing and deployment without requiring a public endpoint.
- **Trade-off:** Higher frequency of HTTP requests and slight delay in message reception.

---

### 4. Sending and Storing Messages

- **Decision:** Store both incoming and outgoing messages in the database.
- **Why:** Maintains a complete history and facilitates auditing and testing.
- **Trade-off:** Increases storage usage and write operations.

---

### 5. Docker for Fast Local Deployment

- **Decision:** Add Dockerfile and docker-compose to spin up the app and database locally.
- **Why:** Facilitates onboarding and testing in consistent environments.
- **Trade-off:** Adds an extra layer of abstraction compared to running Node/PostgreSQL directly.

---

### 6. Seed Module

- **Decision:** Create a `seed` module to populate initial data (users, conversations, messages).
- **Why:** Facilitates testing and scenario generation without external scripts.
- **Trade-off:** Adds more code to the project, although centralized and maintainable.

---

### 7. Generic Pagination with `PaginationDto`

- **Decision:** Place the pagination DTO in `common` for reuse across multiple modules.
- **Why:** Avoids duplicated logic and ensures consistency.
- **Trade-off:** Slightly reduces module independence in favor of DRY.

---

### 8. Validation with `class-validator`

- **Decision:** Use `class-validator` decorators in DTOs for input validation.
- **Why:** Centralizes validation rules and improves consistency.
- **Trade-off:** Adds dependencies and requires familiarity with the library for new developers.

---

### 9. Unit, Integration, and e2e Testing

- **Decision:** Write unit, integration, and end-to-end tests using Jest and Supertest.
- **Why:** Ensures code quality and reduces production bugs.
- **Trade-off:** Increases initial development time.

---

### 10. Centralized Exception Handling

- **Decision:** Use `ExceptionHandlerService` to capture specific errors (duplicates, not found, conflicts).
- **Why:** Provides consistent error messages and easier maintenance.
- **Trade-off:** Adds an abstraction layer compared to throwing exceptions directly.

---

### 11. Removing `@Res()` from Controllers

- **Decision:** Avoid using `@Res()` and always return DTOs.
- **Why:** Keeps controllers NestJS-agnostic and simplifies testing.
- **Trade-off:** Loss of direct control over headers and HTTP responses.

---

### 12. Separation of Services by Responsibility (Single Responsibility Principle)

- **Decision:** Split services for messaging and conversations into smaller components (e.g., `ListConversationsUseCase`, `SendMessageUseCase`, `ListMessagesUseCase`).
- **Why:** Each use case focuses on a single responsibility, which facilitates testing, maintainability, and reusability.
- **Trade-off:** Increases the number of classes and files, but improves modularity and clarity of business logic.

---

### 13. Mapping Between Entities and DTOs in a Dedicated Service

- **Decision:** Keep mapping functions in a dedicated service.
- **Why:** Avoids duplication and centralizes data transformations.
- **Trade-off:** More classes to manage, but improves modularity.

---

### 14. Polling vs Telegram Webhooks

- **Decision:** Use polling for local development; Webhooks would be preferred in production.
- **Why:** Simplicity of local deployment and testing.
- **Trade-off:** Slight latency and frequent requests vs webhook configuration complexity.

---

### 15. Consistent DTO Responses

- **Decision:** All endpoints return DTOs (`ConversationResponseDto`, `MessageResponseDto`).
- **Why:** Maintains consistency and controlled API format.
- **Trade-off:** Requires mappers and additional code.

---

### 16. Swagger Documentation

- **Decision:** Use `@ApiOperation`, `@ApiResponse`, and `@ApiBearerAuth` decorators on all endpoints.
- **Why:** Improves API understanding for other developers and testers.
- **Trade-off:** Requires maintaining documentation in sync with DTOs and endpoints.

---

### 17. Role-based Access and Authorization

- **Decision:** Use `@Auth()` decorators and verify in use cases (ADMIN vs MEMBER).
- **Why:** Maintains security and centralizes access rules.
- **Trade-off:** Requires consistency between decorators and use case logic.

---
