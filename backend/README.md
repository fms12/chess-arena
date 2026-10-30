`setup alembic migration lib`
Yes. Use Alembic now rather than `init_db()` so the schema is versioned and reproducible.

Run from `backend`:

```powershell
uv run alembic init alembic
```

Then configure the generated Alembic environment to:

- read `DATABASE_URL` from `config.py`
- import `Game` and `Move` from `model.py`
- set Alembic metadata to `SQLModel.metadata`

After configuration, generate and apply the first migration:

```powershell
uv run alembic revision --autogenerate -m "create games and moves tables"
uv run alembic upgrade head
```
```
if above migration command giving this error  :FAILED: No 'script_location' key found in configuration.
uv run alembic -c app\alembic.ini revision --autogenerate -m "add bot game fields"
uv run alembic -c app\alembic.ini upgrade head
```

Finally, inspect the tables:

```powershell
docker compose exec db psql -U postgres -d chess_db -c "\dt"
```

You should see `games`, `moves`, and `alembic_version`.

## Real-time game updates

Redis must be available at `localhost:6379` for live game and analysis updates.
Each backend process subscribes to `game:<game_id>` and forwards published events
only to its local WebSockets for that game. Room keys are normalized to strings
because API routes pass UUID objects while Redis channel names contain strings.
The Redis subscription must be ready before the listener starts; otherwise the
listener can exit before any updates arrive. Closed sockets are removed without
interrupting updates for the remaining players.

Run the isolated Redis/WebSocket manager regression tests (no Redis or database
server required):

```powershell
uv run pytest app\tests\test_realtime_manager.py -q
```