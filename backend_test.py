#!/usr/bin/env python3
"""
Wedding Card Application Backend API Testing Suite
Tests all backend APIs comprehensively with real data
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Backend URL - using localhost for testing
BACKEND_URL = "http://localhost:8001/api"

# Test credentials
TEST_USERNAME = "aaaaaa"
TEST_PASSWORD = "aaaaaa"

class WeddingCardAPITester:
    def __init__(self):
        self.session_id = None
        self.user_id = None
        self.wedding_id = None
        self.current_theme = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_authentication(self):
        """Test authentication APIs"""
        print("\n🔐 Testing Authentication APIs...")
        
        # Test login
        try:
            login_data = {
                "username": TEST_USERNAME,
                "password": TEST_PASSWORD
            }
            
            response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("session_id"):
                    self.session_id = data["session_id"]
                    self.user_id = data["user_id"]
                    self.log_test("Authentication Login", True, 
                                f"Login successful, session_id: {self.session_id[:8]}...", data)
                else:
                    self.log_test("Authentication Login", False, 
                                f"Login response missing required fields: {data}")
            else:
                self.log_test("Authentication Login", False, 
                            f"Login failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Authentication Login", False, f"Login request failed: {str(e)}")
            
    def test_wedding_data_retrieval(self):
        """Test wedding data retrieval"""
        print("\n📋 Testing Wedding Data Retrieval...")
        
        if not self.session_id:
            self.log_test("Wedding Data GET", False, "No session_id available for testing")
            return
            
        try:
            # Test GET wedding data
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify data structure
                required_fields = [
                    "id", "user_id", "couple_name_1", "couple_name_2", 
                    "wedding_date", "venue_name", "venue_location", 
                    "story_timeline", "schedule_events", "gallery_photos",
                    "bridal_party", "groom_party", "registry_items", "faqs", "theme"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.wedding_id = data.get("id")
                    self.log_test("Wedding Data GET", True, 
                                f"Retrieved wedding data successfully. Wedding ID: {self.wedding_id}", 
                                {k: v for k, v in data.items() if k in ["id", "couple_name_1", "couple_name_2", "theme"]})
                else:
                    self.log_test("Wedding Data GET", False, 
                                f"Missing required fields: {missing_fields}")
            else:
                self.log_test("Wedding Data GET", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Wedding Data GET", False, f"Request failed: {str(e)}")
            
    def test_wedding_data_update(self):
        """Test wedding data update"""
        print("\n✏️ Testing Wedding Data Update...")
        
        if not self.session_id:
            self.log_test("Wedding Data PUT", False, "No session_id available for testing")
            return
            
        try:
            # Test data with realistic wedding information
            update_data = {
                "session_id": self.session_id,
                "couple_name_1": "Emily",
                "couple_name_2": "James",
                "wedding_date": "2025-08-15",
                "venue_name": "Rosewood Manor",
                "venue_location": "Rosewood Manor • Sonoma County, California",
                "their_story": "Our love story began at a bookstore cafe where we both reached for the same novel. What started as a conversation about literature blossomed into a beautiful romance filled with shared adventures and dreams.",
                "theme": "modern",
                "story_timeline": [
                    {
                        "year": "2020",
                        "title": "First Meeting",
                        "description": "We met at Powell's Books in Portland during a rainy afternoon, both reaching for the same copy of 'The Seven Husbands of Evelyn Hugo'.",
                        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
                    },
                    {
                        "year": "2022",
                        "title": "First Trip Together",
                        "description": "Our first adventure together was a road trip along the Pacific Coast Highway, creating memories that would last a lifetime.",
                        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                    }
                ],
                "schedule_events": [
                    {
                        "time": "3:00 PM",
                        "title": "Wedding Ceremony",
                        "description": "Join us as we exchange vows in the beautiful garden pavilion surrounded by blooming roses.",
                        "location": "Rose Garden Pavilion",
                        "duration": "45 minutes",
                        "highlight": True
                    },
                    {
                        "time": "4:00 PM",
                        "title": "Cocktail Reception",
                        "description": "Celebrate with signature cocktails and hors d'oeuvres on the vineyard terrace.",
                        "location": "Vineyard Terrace",
                        "duration": "90 minutes",
                        "highlight": False
                    }
                ],
                "faqs": [
                    {
                        "question": "What is the dress code?",
                        "answer": "We're requesting cocktail attire. Think elegant and comfortable for an outdoor garden setting."
                    },
                    {
                        "question": "Will transportation be provided?",
                        "answer": "We'll have shuttle service from the main hotel to the venue starting at 2:30 PM."
                    }
                ]
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding", json=update_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify the update worked
                if (data.get("couple_name_1") == "Emily" and 
                    data.get("couple_name_2") == "James" and
                    data.get("theme") == "modern"):
                    self.log_test("Wedding Data PUT", True, 
                                "Wedding data updated successfully", 
                                {k: v for k, v in data.items() if k in ["couple_name_1", "couple_name_2", "theme", "updated_at"]})
                else:
                    self.log_test("Wedding Data PUT", False, 
                                f"Update didn't persist correctly: {data}")
            else:
                self.log_test("Wedding Data PUT", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Wedding Data PUT", False, f"Request failed: {str(e)}")
            
    def test_data_persistence(self):
        """Test that data persists correctly"""
        print("\n💾 Testing Data Persistence...")
        
        if not self.session_id:
            self.log_test("Data Persistence", False, "No session_id available for testing")
            return
            
        try:
            # Retrieve data again to verify persistence
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if our updates persisted
                if (data.get("couple_name_1") == "Emily" and 
                    data.get("couple_name_2") == "James" and
                    data.get("theme") == "modern"):
                    self.log_test("Data Persistence", True, 
                                "Data changes persisted correctly in database")
                else:
                    self.log_test("Data Persistence", False, 
                                f"Data didn't persist: names={data.get('couple_name_1')}/{data.get('couple_name_2')}, theme={data.get('theme')}")
            else:
                self.log_test("Data Persistence", False, 
                            f"Failed to retrieve data for persistence check: {response.status_code}")
                
        except Exception as e:
            self.log_test("Data Persistence", False, f"Persistence check failed: {str(e)}")
            
    def test_faq_section_update(self):
        """Test FAQ section specific update"""
        print("\n❓ Testing FAQ Section Update...")
        
        if not self.session_id:
            self.log_test("FAQ Section Update", False, "No session_id available for testing")
            return
            
        try:
            faq_data = {
                "session_id": self.session_id,
                "faqs": [
                    {
                        "question": "What time should guests arrive?",
                        "answer": "Please arrive by 2:45 PM to allow time for seating before the 3:00 PM ceremony."
                    },
                    {
                        "question": "Is there parking available?",
                        "answer": "Yes, complimentary valet parking is available at the venue entrance."
                    },
                    {
                        "question": "Can children attend?",
                        "answer": "We love your little ones, but we've planned an adults-only celebration to allow everyone to relax and enjoy the evening."
                    }
                ]
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/faq", json=faq_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    faqs = wedding_data.get("faqs", [])
                    if len(faqs) == 3 and faqs[0]["question"] == "What time should guests arrive?":
                        self.log_test("FAQ Section Update", True, 
                                    f"FAQ section updated successfully with {len(faqs)} questions")
                    else:
                        self.log_test("FAQ Section Update", False, 
                                    f"FAQ update didn't work correctly: {faqs}")
                else:
                    self.log_test("FAQ Section Update", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("FAQ Section Update", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("FAQ Section Update", False, f"FAQ update failed: {str(e)}")
            
    def test_session_management(self):
        """Test session management"""
        print("\n🔑 Testing Session Management...")
        
        if not self.session_id:
            self.log_test("Session Management", False, "No session_id available for testing")
            return
            
        try:
            # Test profile endpoint with session
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/profile", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("username") == TEST_USERNAME:
                    self.log_test("Session Management", True, 
                                f"Session working correctly for user: {data['username']}")
                else:
                    self.log_test("Session Management", False, 
                                f"Session returned wrong user: {data}")
            else:
                self.log_test("Session Management", False, 
                            f"Profile request failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Session Management", False, f"Session test failed: {str(e)}")
            
    def test_data_structure_integrity(self):
        """Test that all data is stored in ONE document per user"""
        print("\n🏗️ Testing Data Structure Integrity...")
        
        if not self.session_id:
            self.log_test("Data Structure", False, "No session_id available for testing")
            return
            
        try:
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all sections are in one document
                sections = [
                    "couple_name_1", "couple_name_2", "wedding_date", "venue_name", "venue_location",
                    "story_timeline", "schedule_events", "gallery_photos", "bridal_party", 
                    "groom_party", "special_roles", "registry_items", "faqs", "theme"
                ]
                
                present_sections = [section for section in sections if section in data]
                
                if len(present_sections) == len(sections):
                    self.log_test("Data Structure", True, 
                                f"All {len(sections)} sections present in single document")
                else:
                    missing = set(sections) - set(present_sections)
                    self.log_test("Data Structure", False, 
                                f"Missing sections: {missing}")
            else:
                self.log_test("Data Structure", False, 
                            f"Failed to retrieve data: {response.status_code}")
                
        except Exception as e:
            self.log_test("Data Structure", False, f"Structure test failed: {str(e)}")
            
    def test_wedding_party_fields_exist(self):
        """Test that bridal_party, groom_party, and special_roles fields exist"""
        print("\n👰🤵 Testing Wedding Party Fields Existence...")
        
        if not self.session_id:
            self.log_test("Wedding Party Fields", False, "No session_id available for testing")
            return
            
        try:
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for wedding party fields
                required_party_fields = ["bridal_party", "groom_party", "special_roles"]
                missing_fields = [field for field in required_party_fields if field not in data]
                
                if not missing_fields:
                    # Verify they are lists
                    field_types = {field: type(data[field]).__name__ for field in required_party_fields}
                    all_lists = all(isinstance(data[field], list) for field in required_party_fields)
                    
                    if all_lists:
                        self.log_test("Wedding Party Fields", True, 
                                    f"All wedding party fields exist as lists: {field_types}")
                    else:
                        self.log_test("Wedding Party Fields", False, 
                                    f"Wedding party fields have wrong types: {field_types}")
                else:
                    self.log_test("Wedding Party Fields", False, 
                                f"Missing wedding party fields: {missing_fields}")
            else:
                self.log_test("Wedding Party Fields", False, 
                            f"Failed to retrieve wedding data: {response.status_code}")
                
        except Exception as e:
            self.log_test("Wedding Party Fields", False, f"Wedding party fields test failed: {str(e)}")
            
    def test_add_bridal_party_member(self):
        """Test adding a new person to bridal_party"""
        print("\n👰 Testing Add Bridal Party Member...")
        
        if not self.session_id:
            self.log_test("Add Bridal Party Member", False, "No session_id available for testing")
            return
            
        try:
            # Create new bridal party member
            new_member = {
                "id": str(uuid.uuid4()),
                "name": "Isabella Rodriguez",
                "designation": "Maid of Honor",
                "role": "Best Friend",
                "description": "Emily's college roommate and closest confidante who has been there through every milestone.",
                "photo": "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300&h=300&fit=crop",
                "image": "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300&h=300&fit=crop"
            }
            
            # Get current wedding data first
            params = {"session_id": self.session_id}
            get_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if get_response.status_code != 200:
                self.log_test("Add Bridal Party Member", False, "Failed to get current wedding data")
                return
                
            current_data = get_response.json()
            current_bridal_party = current_data.get("bridal_party", [])
            
            # Add new member to bridal party
            updated_bridal_party = current_bridal_party + [new_member]
            
            party_data = {
                "session_id": self.session_id,
                "bridal_party": updated_bridal_party
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/party", json=party_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    bridal_party = wedding_data.get("bridal_party", [])
                    
                    # Check if our member was added
                    added_member = next((member for member in bridal_party if member["name"] == "Isabella Rodriguez"), None)
                    
                    if added_member and added_member["designation"] == "Maid of Honor":
                        self.log_test("Add Bridal Party Member", True, 
                                    f"Successfully added Isabella Rodriguez as Maid of Honor. Total bridal party: {len(bridal_party)}")
                    else:
                        self.log_test("Add Bridal Party Member", False, 
                                    f"Member not found in updated bridal party: {bridal_party}")
                else:
                    self.log_test("Add Bridal Party Member", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Add Bridal Party Member", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Add Bridal Party Member", False, f"Add bridal party member failed: {str(e)}")
            
    def test_add_groom_party_member(self):
        """Test adding a new person to groom_party"""
        print("\n🤵 Testing Add Groom Party Member...")
        
        if not self.session_id:
            self.log_test("Add Groom Party Member", False, "No session_id available for testing")
            return
            
        try:
            # Create new groom party member
            new_member = {
                "id": str(uuid.uuid4()),
                "name": "Marcus Thompson",
                "designation": "Best Man",
                "role": "Brother",
                "description": "James's younger brother and adventure partner who shares his love for hiking and photography.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
                "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
            }
            
            # Get current wedding data first
            params = {"session_id": self.session_id}
            get_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if get_response.status_code != 200:
                self.log_test("Add Groom Party Member", False, "Failed to get current wedding data")
                return
                
            current_data = get_response.json()
            current_groom_party = current_data.get("groom_party", [])
            
            # Add new member to groom party
            updated_groom_party = current_groom_party + [new_member]
            
            party_data = {
                "session_id": self.session_id,
                "groom_party": updated_groom_party
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/party", json=party_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    groom_party = wedding_data.get("groom_party", [])
                    
                    # Check if our member was added
                    added_member = next((member for member in groom_party if member["name"] == "Marcus Thompson"), None)
                    
                    if added_member and added_member["designation"] == "Best Man":
                        self.log_test("Add Groom Party Member", True, 
                                    f"Successfully added Marcus Thompson as Best Man. Total groom party: {len(groom_party)}")
                    else:
                        self.log_test("Add Groom Party Member", False, 
                                    f"Member not found in updated groom party: {groom_party}")
                else:
                    self.log_test("Add Groom Party Member", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Add Groom Party Member", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Add Groom Party Member", False, f"Add groom party member failed: {str(e)}")
            
    def test_add_special_roles_member(self):
        """Test adding a new person to special_roles"""
        print("\n🌟 Testing Add Special Roles Member...")
        
        if not self.session_id:
            self.log_test("Add Special Roles Member", False, "No session_id available for testing")
            return
            
        try:
            # Create new special roles member
            new_member = {
                "id": str(uuid.uuid4()),
                "name": "Lily Chen",
                "designation": "Flower Girl",
                "role": "Niece",
                "description": "Emily's adorable 7-year-old niece who will sprinkle rose petals down the aisle with the biggest smile.",
                "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
                "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop"
            }
            
            # Get current wedding data first
            params = {"session_id": self.session_id}
            get_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if get_response.status_code != 200:
                self.log_test("Add Special Roles Member", False, "Failed to get current wedding data")
                return
                
            current_data = get_response.json()
            current_special_roles = current_data.get("special_roles", [])
            
            # Add new member to special roles
            updated_special_roles = current_special_roles + [new_member]
            
            party_data = {
                "session_id": self.session_id,
                "special_roles": updated_special_roles
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/party", json=party_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    special_roles = wedding_data.get("special_roles", [])
                    
                    # Check if our member was added
                    added_member = next((member for member in special_roles if member["name"] == "Lily Chen"), None)
                    
                    if added_member and added_member["designation"] == "Flower Girl":
                        self.log_test("Add Special Roles Member", True, 
                                    f"Successfully added Lily Chen as Flower Girl. Total special roles: {len(special_roles)}")
                    else:
                        self.log_test("Add Special Roles Member", False, 
                                    f"Member not found in updated special roles: {special_roles}")
                else:
                    self.log_test("Add Special Roles Member", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Add Special Roles Member", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Add Special Roles Member", False, f"Add special roles member failed: {str(e)}")
            
    def test_edit_wedding_party_member(self):
        """Test editing a wedding party member's data"""
        print("\n✏️ Testing Edit Wedding Party Member...")
        
        if not self.session_id:
            self.log_test("Edit Wedding Party Member", False, "No session_id available for testing")
            return
            
        try:
            # Get current wedding data first
            params = {"session_id": self.session_id}
            get_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if get_response.status_code != 200:
                self.log_test("Edit Wedding Party Member", False, "Failed to get current wedding data")
                return
                
            current_data = get_response.json()
            bridal_party = current_data.get("bridal_party", [])
            
            if not bridal_party:
                self.log_test("Edit Wedding Party Member", False, "No bridal party members to edit")
                return
                
            # Edit the first bridal party member
            member_to_edit = bridal_party[0].copy()
            original_description = member_to_edit.get("description", "")
            member_to_edit["description"] = "Updated: " + original_description
            member_to_edit["designation"] = "Chief Bridesmaid"  # Change designation
            
            # Update the bridal party list
            updated_bridal_party = bridal_party.copy()
            updated_bridal_party[0] = member_to_edit
            
            party_data = {
                "session_id": self.session_id,
                "bridal_party": updated_bridal_party
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/party", json=party_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    updated_bridal_party_result = wedding_data.get("bridal_party", [])
                    
                    if updated_bridal_party_result:
                        edited_member = updated_bridal_party_result[0]
                        if (edited_member["designation"] == "Chief Bridesmaid" and 
                            edited_member["description"].startswith("Updated:")):
                            self.log_test("Edit Wedding Party Member", True, 
                                        f"Successfully edited member: {edited_member['name']} - {edited_member['designation']}")
                        else:
                            self.log_test("Edit Wedding Party Member", False, 
                                        f"Edit didn't persist correctly: {edited_member}")
                    else:
                        self.log_test("Edit Wedding Party Member", False, 
                                    "No bridal party members in response")
                else:
                    self.log_test("Edit Wedding Party Member", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Edit Wedding Party Member", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Edit Wedding Party Member", False, f"Edit wedding party member failed: {str(e)}")
            
    def test_delete_wedding_party_member(self):
        """Test deleting a wedding party member"""
        print("\n🗑️ Testing Delete Wedding Party Member...")
        
        if not self.session_id:
            self.log_test("Delete Wedding Party Member", False, "No session_id available for testing")
            return
            
        try:
            # Get current wedding data first
            params = {"session_id": self.session_id}
            get_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if get_response.status_code != 200:
                self.log_test("Delete Wedding Party Member", False, "Failed to get current wedding data")
                return
                
            current_data = get_response.json()
            groom_party = current_data.get("groom_party", [])
            
            if not groom_party:
                self.log_test("Delete Wedding Party Member", False, "No groom party members to delete")
                return
                
            # Remember the member we're deleting
            member_to_delete = groom_party[0]
            member_name = member_to_delete.get("name", "Unknown")
            original_count = len(groom_party)
            
            # Remove the first member
            updated_groom_party = groom_party[1:]  # Remove first member
            
            party_data = {
                "session_id": self.session_id,
                "groom_party": updated_groom_party
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/party", json=party_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    updated_groom_party_result = wedding_data.get("groom_party", [])
                    
                    new_count = len(updated_groom_party_result)
                    member_still_exists = any(member.get("name") == member_name for member in updated_groom_party_result)
                    
                    if new_count == original_count - 1 and not member_still_exists:
                        self.log_test("Delete Wedding Party Member", True, 
                                    f"Successfully deleted {member_name}. Count: {original_count} → {new_count}")
                    else:
                        self.log_test("Delete Wedding Party Member", False, 
                                    f"Delete didn't work correctly. Count: {original_count} → {new_count}, Still exists: {member_still_exists}")
                else:
                    self.log_test("Delete Wedding Party Member", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Delete Wedding Party Member", False, 
                            f"Failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Delete Wedding Party Member", False, f"Delete wedding party member failed: {str(e)}")
            
    def test_wedding_party_data_persistence(self):
        """Test that wedding party data persists correctly in MongoDB"""
        print("\n💾 Testing Wedding Party Data Persistence...")
        
        if not self.session_id:
            self.log_test("Wedding Party Persistence", False, "No session_id available for testing")
            return
            
        try:
            # Get current wedding data to verify all our changes persisted
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                bridal_party = data.get("bridal_party", [])
                groom_party = data.get("groom_party", [])
                special_roles = data.get("special_roles", [])
                
                # Check if our test data persisted
                isabella_exists = any(member.get("name") == "Isabella Rodriguez" for member in bridal_party)
                marcus_exists = any(member.get("name") == "Marcus Thompson" for member in groom_party)
                lily_exists = any(member.get("name") == "Lily Chen" for member in special_roles)
                
                # Check if the edited member has updated designation
                chief_bridesmaid_exists = any(member.get("designation") == "Chief Bridesmaid" for member in bridal_party)
                
                persistence_checks = {
                    "Isabella (Bridal Party)": isabella_exists,
                    "Marcus (Groom Party)": marcus_exists,
                    "Lily (Special Roles)": lily_exists,
                    "Chief Bridesmaid Edit": chief_bridesmaid_exists
                }
                
                passed_checks = sum(persistence_checks.values())
                total_checks = len(persistence_checks)
                
                if passed_checks >= 3:  # Allow for some flexibility since we deleted one member
                    self.log_test("Wedding Party Persistence", True, 
                                f"Wedding party data persisted correctly. Checks passed: {passed_checks}/{total_checks}")
                else:
                    self.log_test("Wedding Party Persistence", False, 
                                f"Wedding party data didn't persist correctly. Checks: {persistence_checks}")
            else:
                self.log_test("Wedding Party Persistence", False, 
                            f"Failed to retrieve data for persistence check: {response.status_code}")
                
        except Exception as e:
            self.log_test("Wedding Party Persistence", False, f"Persistence check failed: {str(e)}")

    def test_guestbook_field_exists(self):
        """Test that guestbook_messages field exists in wedding document"""
        print("\n📝 Testing Guestbook Field Existence...")
        
        if not self.session_id:
            self.log_test("Guestbook Field Exists", False, "No session_id available for testing")
            return
            
        try:
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "guestbook_messages" in data:
                    guestbook_messages = data["guestbook_messages"]
                    if isinstance(guestbook_messages, list):
                        self.log_test("Guestbook Field Exists", True, 
                                    f"guestbook_messages field exists as array with {len(guestbook_messages)} messages")
                    else:
                        self.log_test("Guestbook Field Exists", False, 
                                    f"guestbook_messages exists but is not an array: {type(guestbook_messages)}")
                else:
                    self.log_test("Guestbook Field Exists", False, 
                                "guestbook_messages field missing from wedding document")
            else:
                self.log_test("Guestbook Field Exists", False, 
                            f"Failed to retrieve wedding data: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Field Exists", False, f"Guestbook field check failed: {str(e)}")

    def test_guestbook_message_creation(self):
        """Test creating guestbook messages that store in owner's wedding document"""
        print("\n💌 Testing Guestbook Message Creation...")
        
        if not self.wedding_id:
            self.log_test("Guestbook Message Creation", False, "No wedding_id available for testing")
            return
            
        try:
            # Create first guestbook message
            message_data_1 = {
                "wedding_id": self.wedding_id,
                "name": "Sarah Johnson",
                "relationship": "Best Friend",
                "message": "Wishing you both a lifetime of happiness! 💕"
            }
            
            response_1 = requests.post(f"{BACKEND_URL}/guestbook", json=message_data_1, timeout=10)
            
            if response_1.status_code == 200:
                data_1 = response_1.json()
                if data_1.get("success"):
                    message_id_1 = data_1.get("message_id")
                    self.log_test("Guestbook Message 1 Creation", True, 
                                f"First guestbook message created successfully: {message_id_1}")
                    
                    # Create second guestbook message
                    message_data_2 = {
                        "wedding_id": self.wedding_id,
                        "name": "Michael Chen",
                        "relationship": "College Friend",
                        "message": "So excited to celebrate this special day with you! 🎉"
                    }
                    
                    response_2 = requests.post(f"{BACKEND_URL}/guestbook", json=message_data_2, timeout=10)
                    
                    if response_2.status_code == 200:
                        data_2 = response_2.json()
                        if data_2.get("success"):
                            message_id_2 = data_2.get("message_id")
                            self.log_test("Guestbook Message 2 Creation", True, 
                                        f"Second guestbook message created successfully: {message_id_2}")
                        else:
                            self.log_test("Guestbook Message 2 Creation", False, 
                                        f"Second message creation failed: {data_2}")
                    else:
                        self.log_test("Guestbook Message 2 Creation", False, 
                                    f"Second message request failed: {response_2.status_code}")
                else:
                    self.log_test("Guestbook Message 1 Creation", False, 
                                f"First message creation failed: {data_1}")
            else:
                self.log_test("Guestbook Message 1 Creation", False, 
                            f"First message request failed: {response_1.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Message Creation", False, f"Guestbook message creation failed: {str(e)}")

    def test_guestbook_message_retrieval(self):
        """Test retrieving guestbook messages from wedding document"""
        print("\n📖 Testing Guestbook Message Retrieval...")
        
        if not self.wedding_id:
            self.log_test("Guestbook Message Retrieval", False, "No wedding_id available for testing")
            return
            
        try:
            # Get guestbook messages via API
            response = requests.get(f"{BACKEND_URL}/guestbook/{self.wedding_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    messages = data.get("messages", [])
                    total_count = data.get("total_count", 0)
                    
                    # Check if our test messages are present
                    sarah_message = next((msg for msg in messages if msg.get("name") == "Sarah Johnson"), None)
                    michael_message = next((msg for msg in messages if msg.get("name") == "Michael Chen"), None)
                    
                    if sarah_message and michael_message:
                        # Verify message content
                        sarah_correct = "lifetime of happiness" in sarah_message.get("message", "")
                        michael_correct = "excited to celebrate" in michael_message.get("message", "")
                        
                        if sarah_correct and michael_correct:
                            self.log_test("Guestbook Message Retrieval", True, 
                                        f"Retrieved {total_count} messages successfully, both test messages found")
                        else:
                            self.log_test("Guestbook Message Retrieval", False, 
                                        f"Messages found but content incorrect: Sarah={sarah_correct}, Michael={michael_correct}")
                    else:
                        self.log_test("Guestbook Message Retrieval", False, 
                                    f"Test messages not found. Total messages: {total_count}")
                else:
                    self.log_test("Guestbook Message Retrieval", False, 
                                f"Retrieval failed: {data}")
            else:
                self.log_test("Guestbook Message Retrieval", False, 
                            f"Request failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Message Retrieval", False, f"Guestbook retrieval failed: {str(e)}")

    def test_guestbook_in_wedding_document(self):
        """Test that guestbook messages are stored in wedding document, not separate collection"""
        print("\n🏠 Testing Guestbook Storage in Wedding Document...")
        
        if not self.session_id:
            self.log_test("Guestbook in Wedding Document", False, "No session_id available for testing")
            return
            
        try:
            # Get wedding data directly to verify messages are stored there
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                guestbook_messages = data.get("guestbook_messages", [])
                
                # Check if our test messages are in the wedding document
                sarah_in_doc = next((msg for msg in guestbook_messages if msg.get("name") == "Sarah Johnson"), None)
                michael_in_doc = next((msg for msg in guestbook_messages if msg.get("name") == "Michael Chen"), None)
                
                if sarah_in_doc and michael_in_doc:
                    # Verify message structure
                    required_fields = ["id", "name", "relationship", "message", "created_at"]
                    sarah_fields = all(field in sarah_in_doc for field in required_fields)
                    michael_fields = all(field in michael_in_doc for field in required_fields)
                    
                    if sarah_fields and michael_fields:
                        self.log_test("Guestbook in Wedding Document", True, 
                                    f"Guestbook messages correctly stored in wedding document with proper structure")
                    else:
                        self.log_test("Guestbook in Wedding Document", False, 
                                    f"Messages in document but missing fields: Sarah={sarah_fields}, Michael={michael_fields}")
                else:
                    self.log_test("Guestbook in Wedding Document", False, 
                                f"Test messages not found in wedding document. Total messages: {len(guestbook_messages)}")
            else:
                self.log_test("Guestbook in Wedding Document", False, 
                            f"Failed to retrieve wedding data: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook in Wedding Document", False, f"Wedding document check failed: {str(e)}")

    def test_guestbook_persistence_across_requests(self):
        """Test that guestbook messages persist across multiple requests"""
        print("\n🔄 Testing Guestbook Persistence Across Requests...")
        
        if not self.wedding_id:
            self.log_test("Guestbook Persistence", False, "No wedding_id available for testing")
            return
            
        try:
            # Make multiple requests to verify persistence
            for i in range(3):
                response = requests.get(f"{BACKEND_URL}/guestbook/{self.wedding_id}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        messages = data.get("messages", [])
                        sarah_exists = any(msg.get("name") == "Sarah Johnson" for msg in messages)
                        michael_exists = any(msg.get("name") == "Michael Chen" for msg in messages)
                        
                        if not (sarah_exists and michael_exists):
                            self.log_test("Guestbook Persistence", False, 
                                        f"Messages not persistent on request {i+1}")
                            return
                    else:
                        self.log_test("Guestbook Persistence", False, 
                                    f"Request {i+1} failed: {data}")
                        return
                else:
                    self.log_test("Guestbook Persistence", False, 
                                f"Request {i+1} failed with status: {response.status_code}")
                    return
            
            self.log_test("Guestbook Persistence", True, 
                        "Guestbook messages persist correctly across multiple requests")
                
        except Exception as e:
            self.log_test("Guestbook Persistence", False, f"Persistence test failed: {str(e)}")

    def test_guestbook_owner_specific(self):
        """Test that guestbook messages are tied to specific wedding owner"""
        print("\n👤 Testing Guestbook Owner Specificity...")
        
        if not self.wedding_id:
            self.log_test("Guestbook Owner Specific", False, "No wedding_id available for testing")
            return
            
        try:
            # Try to access guestbook with invalid wedding_id
            invalid_wedding_id = "invalid-wedding-id-12345"
            response = requests.get(f"{BACKEND_URL}/guestbook/{invalid_wedding_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    messages = data.get("messages", [])
                    if len(messages) == 0:
                        self.log_test("Guestbook Owner Specific", True, 
                                    "Invalid wedding_id returns empty messages (owner-specific isolation working)")
                    else:
                        self.log_test("Guestbook Owner Specific", False, 
                                    f"Invalid wedding_id returned {len(messages)} messages (should be 0)")
                else:
                    self.log_test("Guestbook Owner Specific", True, 
                                "Invalid wedding_id properly rejected")
            else:
                self.log_test("Guestbook Owner Specific", True, 
                            f"Invalid wedding_id properly rejected with status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Owner Specific", False, f"Owner specificity test failed: {str(e)}")

    def test_theme_persistence_get_current(self):
        """Test getting current theme from wedding data"""
        print("\n🎨 Testing Current Theme Retrieval...")
        
        if not self.session_id:
            self.log_test("Current Theme Retrieval", False, "No session_id available for testing")
            return
            
        try:
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                current_theme = data.get("theme")
                
                if current_theme:
                    valid_themes = ["classic", "modern", "boho"]
                    if current_theme in valid_themes:
                        self.log_test("Current Theme Retrieval", True, 
                                    f"Current theme retrieved successfully: {current_theme}")
                        # Store current theme for later tests
                        self.current_theme = current_theme
                    else:
                        self.log_test("Current Theme Retrieval", False, 
                                    f"Invalid theme value: {current_theme}")
                else:
                    self.log_test("Current Theme Retrieval", False, 
                                "Theme field missing from wedding data")
            else:
                self.log_test("Current Theme Retrieval", False, 
                            f"Failed to retrieve wedding data: {response.status_code}")
                
        except Exception as e:
            self.log_test("Current Theme Retrieval", False, f"Theme retrieval failed: {str(e)}")

    def test_theme_update_classic(self):
        """Test updating theme to classic"""
        print("\n🏛️ Testing Theme Update to Classic...")
        
        if not self.session_id:
            self.log_test("Theme Update Classic", False, "No session_id available for testing")
            return
            
        try:
            theme_data = {
                "session_id": self.session_id,
                "theme": "classic"
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/theme", json=theme_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    updated_theme = wedding_data.get("theme")
                    
                    if updated_theme == "classic":
                        self.log_test("Theme Update Classic", True, 
                                    "Theme successfully updated to classic")
                    else:
                        self.log_test("Theme Update Classic", False, 
                                    f"Theme update failed, got: {updated_theme}")
                else:
                    self.log_test("Theme Update Classic", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Theme Update Classic", False, 
                            f"Theme update failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Theme Update Classic", False, f"Theme update failed: {str(e)}")

    def test_theme_persistence_verification(self):
        """Test that theme change persists in database"""
        print("\n💾 Testing Theme Persistence Verification...")
        
        if not self.session_id:
            self.log_test("Theme Persistence Verification", False, "No session_id available for testing")
            return
            
        try:
            # Get wedding data again to verify theme persisted
            params = {"session_id": self.session_id}
            response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                persisted_theme = data.get("theme")
                
                if persisted_theme == "classic":
                    self.log_test("Theme Persistence Verification", True, 
                                "Theme 'classic' persisted correctly in database")
                else:
                    self.log_test("Theme Persistence Verification", False, 
                                f"Theme didn't persist correctly, got: {persisted_theme}")
            else:
                self.log_test("Theme Persistence Verification", False, 
                            f"Failed to retrieve wedding data: {response.status_code}")
                
        except Exception as e:
            self.log_test("Theme Persistence Verification", False, f"Theme persistence check failed: {str(e)}")

    def test_theme_update_modern(self):
        """Test updating theme to modern"""
        print("\n🏢 Testing Theme Update to Modern...")
        
        if not self.session_id:
            self.log_test("Theme Update Modern", False, "No session_id available for testing")
            return
            
        try:
            theme_data = {
                "session_id": self.session_id,
                "theme": "modern"
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/theme", json=theme_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    updated_theme = wedding_data.get("theme")
                    
                    if updated_theme == "modern":
                        self.log_test("Theme Update Modern", True, 
                                    "Theme successfully updated to modern")
                    else:
                        self.log_test("Theme Update Modern", False, 
                                    f"Theme update failed, got: {updated_theme}")
                else:
                    self.log_test("Theme Update Modern", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Theme Update Modern", False, 
                            f"Theme update failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Theme Update Modern", False, f"Theme update failed: {str(e)}")

    def test_theme_update_boho(self):
        """Test updating theme to boho"""
        print("\n🌸 Testing Theme Update to Boho...")
        
        if not self.session_id:
            self.log_test("Theme Update Boho", False, "No session_id available for testing")
            return
            
        try:
            theme_data = {
                "session_id": self.session_id,
                "theme": "boho"
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/theme", json=theme_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "wedding_data" in data:
                    wedding_data = data["wedding_data"]
                    updated_theme = wedding_data.get("theme")
                    
                    if updated_theme == "boho":
                        self.log_test("Theme Update Boho", True, 
                                    "Theme successfully updated to boho")
                        
                        # Verify persistence immediately
                        params = {"session_id": self.session_id}
                        verify_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
                        
                        if verify_response.status_code == 200:
                            verify_data = verify_response.json()
                            if verify_data.get("theme") == "boho":
                                self.log_test("Theme Boho Persistence", True, 
                                            "Boho theme persisted correctly")
                            else:
                                self.log_test("Theme Boho Persistence", False, 
                                            f"Boho theme didn't persist: {verify_data.get('theme')}")
                        else:
                            self.log_test("Theme Boho Persistence", False, 
                                        "Failed to verify boho theme persistence")
                    else:
                        self.log_test("Theme Update Boho", False, 
                                    f"Theme update failed, got: {updated_theme}")
                else:
                    self.log_test("Theme Update Boho", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("Theme Update Boho", False, 
                            f"Theme update failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Theme Update Boho", False, f"Theme update failed: {str(e)}")

    def test_theme_invalid_value(self):
        """Test that invalid theme values are rejected"""
        print("\n❌ Testing Invalid Theme Value Rejection...")
        
        if not self.session_id:
            self.log_test("Invalid Theme Rejection", False, "No session_id available for testing")
            return
            
        try:
            theme_data = {
                "session_id": self.session_id,
                "theme": "invalid_theme"
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/theme", json=theme_data, timeout=10)
            
            if response.status_code == 400:
                self.log_test("Invalid Theme Rejection", True, 
                            "Invalid theme value properly rejected with 400 status")
            elif response.status_code == 200:
                # Check if the theme actually changed
                params = {"session_id": self.session_id}
                verify_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    current_theme = verify_data.get("theme")
                    
                    if current_theme != "invalid_theme":
                        self.log_test("Invalid Theme Rejection", True, 
                                    f"Invalid theme rejected, current theme remains: {current_theme}")
                    else:
                        self.log_test("Invalid Theme Rejection", False, 
                                    "Invalid theme was accepted and saved")
                else:
                    self.log_test("Invalid Theme Rejection", False, 
                                "Failed to verify theme after invalid update")
            else:
                self.log_test("Invalid Theme Rejection", True, 
                            f"Invalid theme rejected with status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Theme Rejection", False, f"Invalid theme test failed: {str(e)}")

    def test_theme_without_session(self):
        """Test that theme update requires session_id"""
        print("\n🔒 Testing Theme Update Without Session...")
        
        try:
            theme_data = {
                "theme": "classic"
                # Intentionally omitting session_id
            }
            
            response = requests.put(f"{BACKEND_URL}/wedding/theme", json=theme_data, timeout=10)
            
            if response.status_code in [400, 401]:
                self.log_test("Theme Without Session", True, 
                            f"Theme update properly rejected without session_id (status: {response.status_code})")
            else:
                self.log_test("Theme Without Session", False, 
                            f"Theme update should require session_id but got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Theme Without Session", False, f"Session requirement test failed: {str(e)}")

    def test_guestbook_without_wedding_id(self):
        """Test that guestbook message creation requires valid wedding_id"""
        print("\n🚫 Testing Guestbook Without Wedding ID...")
        
        try:
            message_data = {
                "name": "Test User",
                "relationship": "Friend",
                "message": "Test message"
                # Intentionally omitting wedding_id
            }
            
            response = requests.post(f"{BACKEND_URL}/guestbook", json=message_data, timeout=10)
            
            if response.status_code == 400:
                self.log_test("Guestbook Without Wedding ID", True, 
                            "Guestbook message properly rejected without wedding_id")
            else:
                self.log_test("Guestbook Without Wedding ID", False, 
                            f"Guestbook should require wedding_id but got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Without Wedding ID", False, f"Wedding ID requirement test failed: {str(e)}")

    def test_guestbook_invalid_wedding_id(self):
        """Test that guestbook message creation fails with invalid wedding_id"""
        print("\n🔍 Testing Guestbook With Invalid Wedding ID...")
        
        try:
            message_data = {
                "wedding_id": "invalid-wedding-id-xyz",
                "name": "Test User",
                "relationship": "Friend",
                "message": "Test message"
            }
            
            response = requests.post(f"{BACKEND_URL}/guestbook", json=message_data, timeout=10)
            
            if response.status_code == 404:
                self.log_test("Guestbook Invalid Wedding ID", True, 
                            "Guestbook message properly rejected with invalid wedding_id (404)")
            else:
                self.log_test("Guestbook Invalid Wedding ID", False, 
                            f"Invalid wedding_id should return 404 but got: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Invalid Wedding ID", False, f"Invalid wedding ID test failed: {str(e)}")

    def test_guestbook_message_sorting(self):
        """Test that guestbook messages are sorted by created_at (newest first)"""
        print("\n📅 Testing Guestbook Message Sorting...")
        
        if not self.wedding_id:
            self.log_test("Guestbook Message Sorting", False, "No wedding_id available for testing")
            return
            
        try:
            response = requests.get(f"{BACKEND_URL}/guestbook/{self.wedding_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    messages = data.get("messages", [])
                    
                    if len(messages) >= 2:
                        # Check if messages are sorted by created_at (newest first)
                        is_sorted = True
                        for i in range(len(messages) - 1):
                            current_time = messages[i].get("created_at", "")
                            next_time = messages[i + 1].get("created_at", "")
                            
                            if current_time < next_time:  # Should be >= for newest first
                                is_sorted = False
                                break
                        
                        if is_sorted:
                            self.log_test("Guestbook Message Sorting", True, 
                                        f"Messages properly sorted by created_at (newest first). Total: {len(messages)}")
                        else:
                            self.log_test("Guestbook Message Sorting", False, 
                                        "Messages not properly sorted by created_at")
                    else:
                        self.log_test("Guestbook Message Sorting", True, 
                                    f"Not enough messages to test sorting ({len(messages)} messages)")
                else:
                    self.log_test("Guestbook Message Sorting", False, 
                                f"Failed to retrieve messages: {data}")
            else:
                self.log_test("Guestbook Message Sorting", False, 
                            f"Request failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Guestbook Message Sorting", False, f"Message sorting test failed: {str(e)}")

    def test_integration_theme_and_guestbook(self):
        """Test that theme changes and guestbook work together without conflicts"""
        print("\n🔄 Testing Theme and Guestbook Integration...")
        
        if not self.session_id or not self.wedding_id:
            self.log_test("Theme Guestbook Integration", False, "Missing session_id or wedding_id")
            return
            
        try:
            # Change theme multiple times
            themes_to_test = ["classic", "modern", "boho", "classic"]
            
            for theme in themes_to_test:
                theme_data = {
                    "session_id": self.session_id,
                    "theme": theme
                }
                
                theme_response = requests.put(f"{BACKEND_URL}/wedding/theme", json=theme_data, timeout=10)
                
                if theme_response.status_code != 200:
                    self.log_test("Theme Guestbook Integration", False, 
                                f"Theme update to {theme} failed during integration test")
                    return
                
                # Add a guestbook message after each theme change
                message_data = {
                    "wedding_id": self.wedding_id,
                    "name": f"Integration Tester {theme.title()}",
                    "relationship": "Test Friend",
                    "message": f"Testing integration with {theme} theme! 🎨"
                }
                
                guestbook_response = requests.post(f"{BACKEND_URL}/guestbook", json=message_data, timeout=10)
                
                if guestbook_response.status_code != 200:
                    self.log_test("Theme Guestbook Integration", False, 
                                f"Guestbook message failed after {theme} theme change")
                    return
            
            # Verify final state
            params = {"session_id": self.session_id}
            final_response = requests.get(f"{BACKEND_URL}/wedding", params=params, timeout=10)
            
            if final_response.status_code == 200:
                final_data = final_response.json()
                final_theme = final_data.get("theme")
                final_guestbook = final_data.get("guestbook_messages", [])
                
                integration_messages = [msg for msg in final_guestbook if "Integration Tester" in msg.get("name", "")]
                
                if final_theme == "classic" and len(integration_messages) >= 4:
                    self.log_test("Theme Guestbook Integration", True, 
                                f"Integration successful: theme={final_theme}, integration messages={len(integration_messages)}")
                else:
                    self.log_test("Theme Guestbook Integration", False, 
                                f"Integration incomplete: theme={final_theme}, messages={len(integration_messages)}")
            else:
                self.log_test("Theme Guestbook Integration", False, 
                            "Failed to verify final integration state")
                
        except Exception as e:
            self.log_test("Theme Guestbook Integration", False, f"Integration test failed: {str(e)}")
            
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Wedding Card Backend API Tests...")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Credentials: {TEST_USERNAME}/{TEST_PASSWORD}")
        print("=" * 60)
        
        # Run core tests in order
        self.test_authentication()
        self.test_wedding_data_retrieval()
        self.test_wedding_data_update()
        self.test_data_persistence()
        self.test_faq_section_update()
        self.test_session_management()
        self.test_data_structure_integrity()
        
        # Wedding Party specific tests
        self.test_wedding_party_fields_exist()
        self.test_add_bridal_party_member()
        self.test_add_groom_party_member()
        self.test_add_special_roles_member()
        self.test_edit_wedding_party_member()
        self.test_delete_wedding_party_member()
        self.test_wedding_party_data_persistence()
        
        # NEW FEATURE TESTS - Guestbook Persistence
        print("\n" + "=" * 60)
        print("🎯 TESTING NEW FEATURE: GUESTBOOK PERSISTENCE")
        print("=" * 60)
        self.test_guestbook_field_exists()
        self.test_guestbook_message_creation()
        self.test_guestbook_message_retrieval()
        self.test_guestbook_in_wedding_document()
        self.test_guestbook_persistence_across_requests()
        self.test_guestbook_owner_specific()
        self.test_guestbook_without_wedding_id()
        self.test_guestbook_invalid_wedding_id()
        self.test_guestbook_message_sorting()
        
        # NEW FEATURE TESTS - Theme Persistence
        print("\n" + "=" * 60)
        print("🎨 TESTING NEW FEATURE: THEME PERSISTENCE")
        print("=" * 60)
        self.test_theme_persistence_get_current()
        self.test_theme_update_classic()
        self.test_theme_persistence_verification()
        self.test_theme_update_modern()
        self.test_theme_update_boho()
        self.test_theme_invalid_value()
        self.test_theme_without_session()
        
        # Integration Tests
        print("\n" + "=" * 60)
        print("🔄 TESTING FEATURE INTEGRATION")
        print("=" * 60)
        self.test_integration_theme_and_guestbook()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['message']}")
        else:
            print("\n🎉 ALL TESTS PASSED!")
        
        # Show specific results for new features
        print("\n" + "=" * 60)
        print("🎯 NEW FEATURE TEST RESULTS")
        print("=" * 60)
        
        guestbook_tests = [r for r in self.test_results if "Guestbook" in r["test"]]
        theme_tests = [r for r in self.test_results if "Theme" in r["test"]]
        integration_tests = [r for r in self.test_results if "Integration" in r["test"]]
        
        guestbook_passed = sum(1 for t in guestbook_tests if t["success"])
        theme_passed = sum(1 for t in theme_tests if t["success"])
        integration_passed = sum(1 for t in integration_tests if t["success"])
        
        print(f"📝 Guestbook Persistence: {guestbook_passed}/{len(guestbook_tests)} tests passed")
        print(f"🎨 Theme Persistence: {theme_passed}/{len(theme_tests)} tests passed")
        print(f"🔄 Integration Tests: {integration_passed}/{len(integration_tests)} tests passed")
        
        return passed == total

if __name__ == "__main__":
    tester = WeddingCardAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)