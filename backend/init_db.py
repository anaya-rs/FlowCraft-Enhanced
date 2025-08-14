#!/usr/bin/env python3
"""
Database initialization script for FlowCraft AI
Creates all database tables and optionally adds sample data
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import create_tables, engine
from app.models import User, Document, ProcessingStatus, DocumentType, ExportFormat
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

def init_database():
    """Initialize database with tables and sample data"""
    print("Creating database tables...")
    
    # Create all tables
    create_tables()
    print("✅ Database tables created successfully!")
    
    # Create a sample admin user
    print("Creating sample admin user...")
    
    with Session(engine) as db:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@flowcraft.ai").first()
        
        if not existing_admin:
            admin_user = User(
                id=str(uuid.uuid4()),
                email="admin@flowcraft.ai",
                password_hash=get_password_hash("admin123"),
                first_name="Admin",
                last_name="User",
                is_active=True,
                is_verified=True,
                subscription_tier="PRO",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(admin_user)
            db.commit()
            print("✅ Sample admin user created:")
            print("   Email: admin@flowcraft.ai")
            print("   Password: admin123")
        else:
            print("ℹ️  Admin user already exists")
    
    print("\n🎉 Database initialization complete!")
    print("You can now start the server and login with:")
    print("   Email: admin@flowcraft.ai")
    print("   Password: admin123")

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)
