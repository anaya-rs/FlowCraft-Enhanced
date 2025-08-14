"""Add API options to document shares

Revision ID: add_api_options_to_shares
Revises: add_document_shares
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_api_options_to_shares'
down_revision = 'add_document_shares'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns for API endpoint configuration
    op.add_column('document_shares', sa.Column('api_endpoint_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('document_shares', sa.Column('api_key', sa.String(), nullable=True))
    op.add_column('document_shares', sa.Column('api_permissions', sa.JSON(), nullable=True))
    
    # Add new columns for webhook configuration
    op.add_column('document_shares', sa.Column('webhook_url', sa.String(), nullable=True))
    op.add_column('document_shares', sa.Column('webhook_events', sa.JSON(), nullable=True))
    op.add_column('document_shares', sa.Column('webhook_secret', sa.String(), nullable=True))
    op.add_column('document_shares', sa.Column('webhook_active', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add new columns for export configuration
    op.add_column('document_shares', sa.Column('export_directory', sa.String(), nullable=True))
    op.add_column('document_shares', sa.Column('export_format', sa.String(), nullable=True))
    op.add_column('document_shares', sa.Column('auto_export', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('document_shares', sa.Column('compression', sa.Boolean(), nullable=False, server_default='true'))
    
    # Create index on api_key for faster lookups
    op.create_index(op.f('ix_document_shares_api_key'), 'document_shares', ['api_key'], unique=True)


def downgrade():
    # Remove indexes
    op.drop_index(op.f('ix_document_shares_api_key'), table_name='document_shares')
    
    # Remove export configuration columns
    op.drop_column('document_shares', 'compression')
    op.drop_column('document_shares', 'auto_export')
    op.drop_column('document_shares', 'export_format')
    op.drop_column('document_shares', 'export_directory')
    
    # Remove webhook configuration columns
    op.drop_column('document_shares', 'webhook_active')
    op.drop_column('document_shares', 'webhook_secret')
    op.drop_column('document_shares', 'webhook_events')
    op.drop_column('document_shares', 'webhook_url')
    
    # Remove API endpoint configuration columns
    op.drop_column('document_shares', 'api_permissions')
    op.drop_column('document_shares', 'api_key')
    op.drop_column('document_shares', 'api_endpoint_enabled')
