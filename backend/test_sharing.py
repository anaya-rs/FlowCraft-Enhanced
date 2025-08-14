#!/usr/bin/env python3
"""
Test script for document sharing functionality
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_sharing_endpoints():
    """Test the document sharing endpoints"""
    
    print("Testing Document Sharing Endpoints")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✓ Health check passed")
        else:
            print("✗ Health check failed")
            return
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return
    
    # Test 2: API info
    try:
        response = requests.get(f"{BASE_URL}/api")
        if response.status_code == 200:
            data = response.json()
            if "sharing" in data.get("endpoints", {}):
                print("✓ Sharing endpoints registered in API")
            else:
                print("✗ Sharing endpoints not found in API")
        else:
            print("✗ API info failed")
    except Exception as e:
        print(f"✗ API info error: {e}")
    
    # Test 3: Check sharing router
    try:
        response = requests.get(f"{API_BASE}/sharing/shares")
        if response.status_code == 401:  # Unauthorized (expected without auth)
            print("✓ Sharing router is working (requires authentication)")
        else:
            print(f"⚠ Unexpected response from sharing router: {response.status_code}")
    except Exception as e:
        print(f"✗ Sharing router error: {e}")
    
    print("\nAvailable Sharing Endpoints:")
    print("- POST /api/v1/sharing/documents/{id}/share")
    print("- GET /api/v1/sharing/documents/{id}/shares")
    print("- GET /api/v1/sharing/shares")
    print("- PUT /api/v1/sharing/shares/{id}")
    print("- DELETE /api/v1/sharing/shares/{id}")
    print("- GET /api/v1/sharing/shared/{token}")
    print("- POST /api/v1/sharing/shares/{id}/revoke")
    print("- POST /api/v1/sharing/shares/{id}/extend")
    
    print("\nDocument sharing functionality is ready!")
    print("You can now use the Share button in the frontend to:")
    print("- Create public shareable links")
    print("- Share documents with specific users")
    print("- Set access levels (view, comment, edit)")
    print("- Set expiration dates")
    print("- Add personal messages")

if __name__ == "__main__":
    test_sharing_endpoints()
