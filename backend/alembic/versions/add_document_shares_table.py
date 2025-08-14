"""Add document shares table

Revision ID: add_document_shares
Revises: 
Create Date: 2025-08-14 18:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_document_shares'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create document_shares table
    op.create_table('document_shares',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('document_id', sa.String(), nullable=False),
        sa.Column('shared_by', sa.String(), nullable=False),
        sa.Column('recipient_email', sa.String(), nullable=True),
        sa.Column('recipient_name', sa.String(), nullable=True),
        sa.Column('access_level', sa.String(), nullable=False),
        sa.Column('share_token', sa.String(), nullable=False),
        sa.Column('share_link', sa.String(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ),
        sa.ForeignKeyConstraint(['shared_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_document_shares_id'), 'document_shares', ['id'], unique=False)
    op.create_index(op.f('ix_document_shares_share_token'), 'document_shares', ['share_token'], unique=True)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_document_shares_share_token'), table_name='document_shares')
    op.drop_index(op.f('ix_document_shares_id'), table_name='document_shares')
    
    # Drop table
    op.drop_table('document_shares')
