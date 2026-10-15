"""Add a column

Revision ID: b36fa4c9a80b
Revises: 82ef0b571bdf
Create Date: 2026-10-13 19:11:05.406629

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = 'b36fa4c9a80b'
down_revision: Union[str, Sequence[str], None] = '82ef0b571bdf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
