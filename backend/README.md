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

Finally, inspect the tables:

```powershell
docker compose exec db psql -U postgres -d chess_db -c "\dt"
```

You should see `games`, `moves`, and `alembic_version`.