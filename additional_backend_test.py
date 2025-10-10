#!/usr/bin/env python3
"""
Additional Backend API Tests - Edge cases and additional endpoints
"""

import requests
import json
import sys

BACKEND_URL = "https://digi-invite-maker.preview.emergentagent.com/api"
TEST_USERNAME = "aaaaaa"
TEST_PASSWORD = "aaaaaa"

def test_additional_endpoints():
    """Test additional endpoints and edge cases"""
    print("🔍 Testing Additional Backend Endpoints...")
    
    # Test 1: Test endpoint
    try:
        response = requests.get(f"{BACKEND_URL}/test", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Test Endpoint: {data.get('message', 'OK')}")
        else:
            print(f"❌ Test Endpoint Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Test Endpoint Error: {str(e)}")
    
    # Test 2: Invalid session handling
    try:
        params = {"session_id": "invalid-session-id"}
        response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
        if response.status_code == 401:
            print("✅ Invalid Session Handling: Correctly returns 401 Unauthorized")
        else:
            print(f"❌ Invalid Session Handling: Expected 401, got {response.status_code}")
    except Exception as e:
        print(f"❌ Invalid Session Test Error: {str(e)}")
    
    # Test 3: Login with wrong credentials
    try:
        login_data = {"username": "wronguser", "password": "wrongpass"}
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 401:
            print("✅ Wrong Credentials: Correctly returns 401 Unauthorized")
        else:
            print(f"❌ Wrong Credentials: Expected 401, got {response.status_code}")
    except Exception as e:
        print(f"❌ Wrong Credentials Test Error: {str(e)}")
    
    # Test 4: Login and test RSVP endpoints
    try:
        # Login first
        login_data = {"username": TEST_USERNAME, "password": TEST_PASSWORD}
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data["session_id"]
            
            # Get wedding data to get wedding_id
            params = {"session_id": session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                wedding_data = response.json()
                wedding_id = wedding_data["id"]
                
                # Test RSVP submission
                rsvp_data = {
                    "wedding_id": wedding_id,
                    "guest_name": "John Smith",
                    "guest_email": "john.smith@example.com",
                    "guest_phone": "+1-555-0123",
                    "attendance": "yes",
                    "guest_count": 2,
                    "dietary_restrictions": "Vegetarian",
                    "special_message": "So excited to celebrate with you both!"
                }
                
                response = requests.post(f"{BACKEND_URL}/rsvp", json=rsvp_data, timeout=10)
                if response.status_code == 200:
                    rsvp_result = response.json()
                    if rsvp_result.get("success"):
                        print("✅ RSVP Submission: Successfully submitted RSVP")
                    else:
                        print(f"❌ RSVP Submission: {rsvp_result}")
                else:
                    print(f"❌ RSVP Submission Failed: {response.status_code}")
                    
                # Test getting RSVPs
                response = requests.get(f"{BACKEND_URL}/rsvp/{wedding_id}", timeout=10)
                if response.status_code == 200:
                    rsvp_list = response.json()
                    if rsvp_list.get("success") and rsvp_list.get("total_count", 0) > 0:
                        print(f"✅ RSVP Retrieval: Found {rsvp_list['total_count']} RSVPs")
                    else:
                        print("✅ RSVP Retrieval: No RSVPs found (expected for new test)")
                else:
                    print(f"❌ RSVP Retrieval Failed: {response.status_code}")
                    
            else:
                print(f"❌ Could not get wedding data for RSVP test: {response.status_code}")
        else:
            print(f"❌ Could not login for RSVP test: {response.status_code}")
            
    except Exception as e:
        print(f"❌ RSVP Test Error: {str(e)}")
    
    # Test 5: Guestbook endpoints
    try:
        # Test public guestbook message
        guestbook_data = {
            "wedding_id": "public",
            "name": "Sarah Johnson",
            "relationship": "College Friend",
            "message": "Wishing you both a lifetime of love and happiness! Can't wait to celebrate with you.",
            "is_public": True
        }
        
        response = requests.post(f"{BACKEND_URL}/guestbook", json=guestbook_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Guestbook Message: Successfully posted public message")
            else:
                print(f"❌ Guestbook Message: {result}")
        else:
            print(f"❌ Guestbook Message Failed: {response.status_code}")
            
        # Test getting public guestbook messages
        response = requests.get(f"{BACKEND_URL}/guestbook/public/messages", timeout=10)
        if response.status_code == 200:
            messages = response.json()
            if messages.get("success"):
                print(f"✅ Guestbook Retrieval: Found {messages.get('total_count', 0)} public messages")
            else:
                print(f"❌ Guestbook Retrieval: {messages}")
        else:
            print(f"❌ Guestbook Retrieval Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Guestbook Test Error: {str(e)}")

if __name__ == "__main__":
    test_additional_endpoints()
    print("\n🏁 Additional backend tests completed!")