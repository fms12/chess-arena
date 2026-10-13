"""Add a column

Revision ID: 82ef0b571bdf
Revises: d4efca20038d
Create Date: 2026-10-13 18:40:08.673057

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = '82ef0b571bdf'
down_revision: Union[str, Sequence[str], None] = 'd4efca20038d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
