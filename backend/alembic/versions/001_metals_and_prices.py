"""metals and prices tables + seed metals

Revision ID: 001
Revises:
Create Date: 2025-02-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "metals",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(32), nullable=False),
        sa.Column("symbol", sa.String(8), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_metals_name", "metals", ["name"], unique=True)

    op.create_table(
        "prices",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("metal_id", sa.Integer(), nullable=False),
        sa.Column("buy_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("sell_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("source", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["metal_id"], ["metals.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_prices_metal_created", "prices", ["metal_id", "created_at"], unique=False)

    # Seed metals
    op.execute(
        sa.text("INSERT INTO metals (name, symbol) VALUES ('gold', 'XAU'), ('silver', 'XAG')")
    )


def downgrade() -> None:
    op.drop_index("ix_prices_metal_created", table_name="prices")
    op.drop_table("prices")
    op.drop_index("ix_metals_name", table_name="metals")
    op.drop_table("metals")
