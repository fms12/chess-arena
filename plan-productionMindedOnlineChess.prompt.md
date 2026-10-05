# Production-Minded Online Chess: Implementation Todo Plan

## 1. Product Definition

- [ ] Define the first-release scope: authenticated players, live two-player games, legal chess moves, clocks, resignation, draw offers, rematches, and game history.
- [ ] Record non-goals for v1, such as tournaments, matchmaking ratings, spectating, computer opponents, chat moderation, and chess variants.
- [ ] Write player-facing rules for disconnects, abandoned games, draws, rematches, and timeouts.
- [ ] Define supported browsers, responsive breakpoints, accessibility target, and expected concurrent-player capacity.
- [ ] Create acceptance criteria for every player workflow before implementation begins.

## 2. Architecture And Decisions

- [ ] Confirm the backend boundary: FastAPI serves HTTP APIs and WebSocket connections; a separate persistent store owns game records.
- [ ] Select the frontend stack and establish its build, test, lint, and formatting commands.
- [ ] Select a rules engine with a well-tested legal-move implementation; use it as the authoritative rules validator rather than hand-writing chess rules.
- [ ] Choose a relational database, such as PostgreSQL, for users, games, moves, and audit-friendly state transitions.
- [ ] Choose a shared realtime coordination layer, such as Redis, for WebSocket fan-out, presence, distributed game locks, and rate limiting.
- [ ] Start with one FastAPI application and a `/ws/games/{game_id}` WebSocket endpoint.
- [ ] Keep chess rules, clocks, persistence, and event publication in shared services rather than WebSocket route handlers.
- [ ] Add Redis Pub/Sub or Streams only when multiple backend instances require cross-instance event delivery.
- [ ] Split out a dedicated WebSocket service only when measured production scale requires it.
- [ ] Define deployment environments: local, test/staging, and production, each with independently managed configuration and secrets.
- [ ] Document API and WebSocket message contracts, including versioning and error envelopes.

## 3. Repository Foundation

- [ ] Add a root README with setup, run, test, lint, formatting, environment-variable, and deployment instructions.
- [ ] Add `.env.example` files without secrets for backend and frontend configuration.
- [ ] Pin runtime and development dependencies through the existing Python project configuration and the frontend package manifest.
- [ ] Add consistent formatting and static-analysis tooling for Python and frontend code.
- [ ] Add pre-commit hooks or CI equivalents for formatting, linting, type checking, and tests.
- [ ] Add `.gitignore` entries for virtual environments, local environment files, coverage, builds, and editor-generated files.
- [ ] Establish a conventional logging format with timestamp, severity, request/game correlation IDs, and structured fields.

## 4. Data Model And Migrations

- [ ] Create migration tooling and require every schema change to be versioned.
- [ ] Create a `users` table with immutable ID, unique normalized email or external identity, display name, status, timestamps, and optional rating fields.
- [ ] Create a `games` table with player IDs, color assignment, initial/current FEN, game status, result, termination reason, time control, remaining clocks, version number, timestamps, and last activity time.
- [ ] Create an append-only `moves` table with game ID, ply number, UCI move, SAN move, FEN after move, actor ID, server timestamp, and request/event ID for idempotency.
- [ ] Create tables for draw offers, rematch requests, refresh-token/session metadata, and audit events as needed.
- [ ] Add indexes for active games by player, game move ordering, user lookup, and stale-game cleanup.
- [ ] Define retention, backup, and restoration policies; test restoring a backup before production launch.

## 5. Authentication And Authorization

- [ ] Implement registration/sign-in or an approved identity-provider integration.
- [ ] Store passwords only with a modern adaptive hash if local credentials are supported.
- [ ] Implement short-lived access tokens and securely managed refresh tokens or server sessions.
- [ ] Add account verification, password reset, session revocation, and abuse-resistant request limits where applicable.
- [ ] Add dependency/middleware helpers that identify the current user and enforce access control.
- [ ] Ensure only assigned players can submit moves or game actions; spectators, if added later, remain read-only.
- [ ] Prevent user enumeration and return safe, consistent authentication error messages.

## 6. Core Chess Domain

- [ ] Implement a `GameService` that owns game creation, join, move submission, resignations, draw offers, draw acceptance/decline, timeout, abandonment, and rematch transitions.
- [ ] Validate every move on the server against the stored authoritative position, player color, game status, turn, and clock state.
- [ ] Support all standard legal rules through the selected engine: castling, en passant, promotion, check, checkmate, stalemate, insufficient material, threefold repetition, and the fifty-move rule.
- [ ] Generate and persist canonical UCI/SAN moves and the resulting FEN in a single transaction.
- [ ] Use optimistic concurrency with a game version or expected ply value to reject stale client actions.
- [ ] Make client action IDs idempotent so reconnects and retries cannot duplicate a move or game action.
- [ ] Calculate clocks from trusted server time; never accept remaining time reported by the browser.
- [ ] Add a periodic or queued timeout check that atomically ends games whose active player's clock expires.
- [ ] Preserve a complete, ordered game record suitable for replay and PGN export.

## 7. HTTP API

- [ ] Add health and readiness endpoints suitable for load balancers and deployment checks.
- [ ] Add authenticated endpoints to retrieve the current user, create a game, list a user's games, and fetch an individual game/replay.
- [ ] Add endpoints for an invite/join flow with unguessable, expiring game invite identifiers.
- [ ] Add endpoints for historical PGN export and account/session actions as needed.
- [ ] Validate request bodies with explicit schemas and return a consistent error response format.
- [ ] Generate and review OpenAPI documentation; keep examples aligned with actual client payloads.
- [ ] Enforce pagination, filter limits, and ownership checks on all history and lookup endpoints.

## 8. WebSocket Realtime Protocol

- [ ] Authenticate the WebSocket connection before subscribing it to a user or game channel.
- [ ] Define client commands such as `subscribe_game`, `move`, `resign`, `offer_draw`, `respond_draw`, `request_rematch`, `respond_rematch`, and `ping`.
- [ ] Define server events such as `game_state`, `move_applied`, `clock_updated`, `draw_offer`, `game_ended`, `opponent_presence`, `error`, and `resync_required`.
- [ ] Include game version, ply, event ID, and server timestamp in relevant events so clients can order and deduplicate updates.
- [ ] Send a complete authoritative snapshot on subscription and support an explicit resynchronization path.
- [ ] Use per-game distributed locking or transactional concurrency controls to serialize competing actions across backend instances.
- [ ] Publish events through Redis or an equivalent broker so WebSocket delivery works after horizontal scaling.
- [ ] Add heartbeat, connection timeout, reconnection, and presence tracking; treat disconnects separately from game termination.
- [ ] Rate-limit commands and cap payload sizes, subscriptions, and idle connections.

## 9. Frontend Game Experience

- [ ] Build the authenticated application shell with clear navigation to active games, new game, and game history.
- [ ] Implement an accessible chessboard with keyboard interaction, focus indicators, coordinate labels, legal-move hints, capture feedback, and promotion selection.
- [ ] Keep client board state derived from authoritative FEN/move events; use optimistic rendering only with rollback/resync support.
- [ ] Display both player identities, colors, clocks, turn state, check state, connection status, and terminal game result.
- [ ] Add clear controls and confirmation states for resigning, offering/responding to a draw, and requesting/responding to a rematch.
- [ ] Build game creation and invitation/join flows with validation and actionable failures.
- [ ] Add reconnecting and out-of-sync states that block moves until the authoritative snapshot is restored.
- [ ] Build a move list with SAN notation, selectable replay positions, captured pieces if desired, and PGN export.
- [ ] Make desktop and mobile interactions work without hover-only or drag-only requirements.
- [ ] Respect reduced-motion preferences and meet keyboard, contrast, labels, and screen-reader requirements.

## 10. Security And Abuse Controls

- [ ] Validate and authorize every HTTP request and WebSocket command on the server.
- [ ] Configure strict CORS origins, secure headers, HTTPS-only cookies, and production TLS termination.
- [ ] Keep secrets in the deployment secret store; rotate credentials and prevent them from entering logs or source control.
- [ ] Add rate limits for sign-in, registration, invite creation, game actions, WebSocket connections, and history queries.
- [ ] Sanitize user-supplied display names and any future chat/profile content; render untrusted data safely.
- [ ] Add audit events for authentication changes, game-ending decisions, administrative actions, and suspected abuse.
- [ ] Define privacy controls and account-deletion/export behavior appropriate for the intended launch region.
- [ ] Run dependency vulnerability scanning and establish a process for applying security updates.

## 11. Reliability, Operations, And Observability

- [ ] Add structured logs for requests, WebSocket lifecycle, game state changes, failed commands, and background jobs.
- [ ] Add metrics for API latency/error rate, WebSocket connections, event delivery failures, active games, move validation failures, lock contention, and timeout processing.
- [ ] Add tracing or correlation IDs from HTTP/WebSocket entry through persistence and event publication.
- [ ] Configure error reporting with release identifiers and personally identifiable information scrubbing.
- [ ] Define alerts for availability, elevated errors, database saturation, broker failures, failed migrations, clock/timeout job failures, and abnormal disconnect rates.
- [ ] Add graceful shutdown behavior that stops new connections, drains active work, and preserves in-flight game actions.
- [ ] Document operational runbooks for rollback, failed migration, unavailable broker, database restore, stalled timeout job, and player dispute investigation.

## 12. Testing Strategy

- [ ] Add unit tests for domain transitions, authorization, clock calculations, idempotency, and all terminal chess conditions.
- [ ] Use known legal and illegal FEN positions to test castling, en passant, promotions, check evasions, repetition, and draw rules.
- [ ] Add API integration tests covering auth, game lifecycle, validation failures, authorization boundaries, and pagination.
- [ ] Add WebSocket integration tests for subscriptions, two-player move propagation, ordering, reconnect/resync, duplicate commands, and simultaneous action races.
- [ ] Add database migration tests and verify schema upgrades from a prior released version.
- [ ] Add frontend component tests for board interactions, promotion, clock display, action dialogs, error states, and accessibility semantics.
- [ ] Add end-to-end browser tests for registration/sign-in, invite flow, full game completion, disconnect/reconnect, and mobile viewport behavior.
- [ ] Add load tests for concurrent sockets and hot games, including broker fan-out and database lock behavior.
- [ ] Add security tests for origin checks, token expiry, malformed payloads, injection/XSS vectors, and rate-limit behavior.

## 13. CI/CD And Deployment

- [ ] Build CI stages for dependency install, formatting, lint, type checks, unit tests, integration tests, frontend build, end-to-end tests, and security scanning.
- [ ] Require passing CI and reviewed database migrations before merging to the release branch.
- [ ] Build immutable backend and frontend artifacts with version metadata.
- [ ] Provision managed PostgreSQL, Redis, object storage if exports are retained, TLS, DNS, secrets, and monitoring through infrastructure-as-code.
- [ ] Deploy migrations with an explicit backward-compatible rollout strategy and a tested rollback plan.
- [ ] Configure separate staging and production resources, URLs, credentials, telemetry, and rate limits.
- [ ] Add automated post-deploy smoke checks for health, authentication, game creation, and a two-client realtime move exchange.
- [ ] Use progressive rollout or quick rollback capability for backend/frontend releases.

## 14. Launch Readiness

- [ ] Perform a threat-model review of identity, invite links, WebSockets, persistence, and admin/support access.
- [ ] Run a production-like load test and document safe operating limits.
- [ ] Verify backup restoration, alert routing, on-call ownership, and incident runbooks.
- [ ] Validate accessibility with keyboard-only and screen-reader passes on current browser targets.
- [ ] Conduct manual test sessions across desktop and mobile for normal games, poor networks, refreshes, reconnects, expired clocks, and simultaneous moves.
- [ ] Verify analytics/events are privacy-aware and do not capture positions, tokens, or personal data unnecessarily.
- [ ] Publish player-facing terms, privacy information, support route, and service-status communication path as required.
- [ ] Establish a post-launch checklist for error review, performance monitoring, support triage, and prioritized v1.1 improvements.

## 15. Recommended Delivery Order

- [ ] Milestone 1: repository foundation, local environment, database migrations, health checks, and CI baseline.
- [ ] Milestone 2: authentication, user identity, game persistence, and read-only game retrieval.
- [ ] Milestone 3: server-authoritative chess domain with comprehensive legal-move and terminal-state tests.
- [ ] Milestone 4: game creation/invites plus authenticated HTTP game lifecycle APIs.
- [ ] Milestone 5: WebSocket protocol, two-player live move propagation, reconnect/resync, and clocks.
- [ ] Milestone 6: responsive accessible frontend game experience and browser end-to-end coverage.
- [ ] Milestone 7: observability, rate limiting, load/security testing, staging deployment, and operational runbooks.
- [ ] Milestone 8: production readiness review, controlled launch, and post-launch monitoring.
