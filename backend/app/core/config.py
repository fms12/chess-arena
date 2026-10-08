import os

class Setting: 
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Chess Game API")
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:mysecretpassword@localhost:5432/chess_db")


setting = Setting()


### The Big Picture: Why Docker for the Database?

# Without Docker, you would have to install the entire PostgreSQL software installer on your Windows machine, run background Windows services, and deal with registry settings.

# With Docker, you run a **lightweight, isolated container** running Linux with PostgreSQL already pre-installed and configured. It starts in seconds and leaves zero clutter on your operating system.

# ```mermaid
# flowchart LR
#     subgraph HostMachine ["Your Computer (Windows)"]
#         subgraph PythonApp ["Your Python App (Chess API)"]
#             A["FastAPI / Alembic\nConnects to: localhost:5432"]
#         end
#         subgraph DockerEngine ["Docker Engine"]
#             subgraph PostgresContainer ["Postgres Container (Linux)"]
#                 B["Postgres Service\nListens on internal: 5432"]
#                 C["/var/lib/postgresql/data\n(Internal Database Files)"]
#             end
#             D[("Named Volume\n(Safe storage on your hard drive)")]
#         end
#     end
#     A -- "Port Bridge (5432:5432)" --> B
#     C <--> D
# ```

# ---

### The 5 Pillars of the Docker DB Setup


#### 1. The Image (`postgres:16-alpine`)
# * **What it is:** A pre-packaged, minimal Linux operating system that has PostgreSQL 16 pre-installed.
# * **Why Alpine?** `alpine` is a stripped-down Linux distribution (under 100MB), making it much faster to download and run than standard images.

# #### 2. Environment Variables (Initialization Credentials)
# When a PostgreSQL container runs for the very first time, its initialization script checks for 3 variables:
# * **`POSTGRES_USER`**: Who the database administrator is.
# * **`POSTGRES_PASSWORD`**: The master password.
# * **`POSTGRES_DB`**: The default empty database to automatically create on first boot (e.g., `chess_db`).

# *Note: Postgres only uses these variables on the very first boot when the storage directory is empty. On subsequent restarts, it reuses the already created database.*

# #### 3. Persistent Volumes (Saving your data)
# * **The Problem:** Docker containers are disposable. If you remove or recreate a container, everything inside its temporary filesystem disappears.
# * **The Solution:** A **Volume** (`postgres_data:/var/lib/postgresql/data`).
# * **How it works:** PostgreSQL stores its actual tables and indexes inside `/var/lib/postgresql/data`. The volume maps that internal folder to a permanent, safe location on your computer's drive. Even if you destroy the container, your users and chess matches remain intact.

# #### 4. Port Forwarding (`5432:5432`)
# * Containers live in an isolated private network inside Docker.
# * `5432:5432` builds a bridge:
#   * **Left side (5432):** Port opened on your Windows machine.
#   * **Right side (5432):** Port inside the container where Postgres is listening.
# * This allows your Python code running in your Windows terminal to reach into the container by calling `localhost:5432`.

# #### 5. Healthcheck (`pg_isready`)
# * **Why this is critical:** When Docker starts a container, its status immediately says `Up`. However, PostgreSQL needs a few seconds to initialize its engine and accept connections.
# * If your backend or Alembic starts immediately, it will crash with a `Connection Refused` error.
# * `pg_isready` is a utility built into Postgres. The healthcheck repeatedly asks Postgres: *"Are you accepting connections yet?"*
# * Once Postgres answers *"Yes"*, Docker flags the container as **`healthy`**, signaling that it is safe to run migrations and start the backend.

# ---

# ### How to Set It Up for Chess (Step-by-Step)

# Here is how to set up the DB container for your Chess project:

# #### Step 1: Create a `docker-compose.yml`
# In your project root, define the `db` service:

# ```yaml
# services:
#   db:
#     image: postgres:16-alpine
#     container_name: chess_db
#     restart: unless-stopped
#     environment:
#       POSTGRES_DB: chess_db
#       POSTGRES_USER: postgres
#       POSTGRES_PASSWORD: mysecretpassword
#     ports:
#       - "5432:5432"
#     volumes:
#       - chess_db_data:/var/lib/postgresql/data
#     healthcheck:
#       test: ["CMD-SHELL", "pg_isready -U postgres -d chess_db"]
#       interval: 5s
#       timeout: 5s
#       retries: 5

# volumes:
#   chess_db_data:
# ```

# #### Step 2: Start the Database
# Open your terminal and run:
# ```bash
# docker compose up -d db
# ```
# * `-d` runs it in detached (background) mode.

# #### Step 3: Check if it's running & healthy
# ```bash
# # Check status (should say "Up" and "(healthy)")
# docker compose ps

# # View the Postgres boot logs
# docker compose logs db
# ```

# #### Step 4: Connect from Python
# In your Python `.env` file, point your `DATABASE_URL` to this container:
# ```env
# DATABASE_URL=postgresql+psycopg://postgres:mysecretpassword@localhost:5432/chess_db
# ```

# #### Step 5: How to Manage the DB Container Later
# * **To stop the database:** `docker compose stop db`
# * **To start it again:** `docker compose start db`
# * **To completely wipe the database clean (fresh start):**
#   ```bash
#   docker compose down -v
#   ```
#   *(The `-v` flag deletes the volume, wiping all data so you can start with a fresh slate).*

#  check for thec connection```docker compose exec db pg_isready -U postgres -d chess_db```