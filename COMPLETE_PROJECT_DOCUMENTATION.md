# 📚 Complete Wedding Card Application - Project Documentation

## 🎯 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Folder Structure](#folder-structure)
5. [Database Schema](#database-schema)
6. [Backend API Documentation](#backend-api-documentation)
7. [Frontend Components](#frontend-components)
8. [Data Flow Explained](#data-flow-explained)
9. [Authentication System](#authentication-system)
10. [Form Management System](#form-management-system)
11. [Step-by-Step User Journey](#step-by-step-user-journey)
12. [How to Run the Project](#how-to-run-the-project)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is this project?
This is a **Wedding Card Web Application** where couples can:
- Create a beautiful, personalized digital wedding invitation
- Share it with guests via a unique URL
- Collect RSVPs from guests
- Display their love story, photo gallery, wedding schedule, and more
- Accept gifts and donations through payment integrations

### Think of it like:
Imagine you're getting married and instead of printing physical invitation cards, you create a beautiful website that has:
- Your wedding date and venue
- A timeline of your love story with photos
- A schedule of wedding events (ceremony, reception, etc.)
- A gallery of your photos together
- A way for guests to RSVP (say if they're coming or not)
- A gift registry where guests can contribute

---

## 💻 Technology Stack

### Backend (Server Side)
- **FastAPI** (Python) - A modern web framework to build the API
  - Think of it as: The brain of the application that handles all logic
- **MongoDB** - Database to store all information
  - Think of it as: A giant filing cabinet that stores all data
- **Motor** - Async MongoDB driver
  - Think of it as: The tool that helps Python talk to MongoDB
- **Stripe** - Payment processing
  - Think of it as: The cash register for accepting payments

### Frontend (Client Side - What users see)
- **React** - JavaScript library for building the user interface
  - Think of it as: The artist that paints what users see
- **Tailwind CSS** - Styling framework for design
  - Think of it as: The paint and brushes for making things pretty
- **React Router** - For navigation between pages
  - Think of it as: The GPS that helps you move between different pages
- **Lucide React** - Icons library
  - Think of it as: A collection of symbols and icons

### Development Tools
- **Yarn** - Package manager (installs all needed libraries)
- **Git** - Version control (tracks all code changes)
- **Supervisor** - Keeps backend and frontend running

---

## 🏗️ Project Architecture

### How the pieces fit together:

```
┌─────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                       │
│  (What the user sees - React Frontend on Port 3000)        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests (API Calls)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (FastAPI)                  │
│              (Python API running on Port 8001)               │
│                                                               │
│  ┌─────────────────────────────────────────────────┐       │
│  │  API Endpoints (Routes)                          │       │
│  │  - /api/register    - /api/login                 │       │
│  │  - /api/wedding     - /api/rsvp                  │       │
│  │  - /api/payment     - /api/guestbook             │       │
│  └─────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Database Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                        │
│               (Stores all data permanently)                  │
│                                                               │
│  Collections (like tables):                                  │
│  - users          (user accounts)                            │
│  - weddings       (wedding card data)                        │
│  - rsvp_responses (guest responses)                          │
│  - guestbook      (messages from guests)                     │
└─────────────────────────────────────────────────────────────┘
```

### Simple Explanation:
1. **User's Browser (Frontend)**: This is what you see and click on
2. **Backend Server**: This is the middleman that processes your requests
3. **Database**: This is where everything is saved forever

When you click a button:
1. Frontend sends a request to Backend
2. Backend processes it and talks to Database
3. Database saves/retrieves data
4. Backend sends response back to Frontend
5. Frontend updates what you see

---

## 📁 Folder Structure

```
/app/
│
├── backend/                    # All server-side code
│   ├── server.py              # Main API file (1531 lines) - THE BRAIN
│   ├── requirements.txt       # List of Python packages needed
│   ├── .env                   # Secret configuration (MongoDB URL, API keys)
│   ├── users.json            # Backup storage for users
│   └── weddings.json         # Backup storage for weddings
│
├── frontend/                   # All user interface code
│   ├── public/                # Static files
│   │   └── index.html        # Main HTML file (entry point)
│   │
│   ├── src/                   # Source code
│   │   ├── index.js          # Entry point - loads React app
│   │   ├── App.js            # Main component - routes & themes
│   │   ├── App.css           # Global styles
│   │   │
│   │   ├── pages/            # Different pages of the website
│   │   │   ├── HomePage.js            # Landing page
│   │   │   ├── LoginPage.js           # User login
│   │   │   ├── RegisterPage.js        # User signup
│   │   │   ├── DashboardPage.js       # Owner's dashboard
│   │   │   ├── PublicWeddingPage.js   # Public view of wedding
│   │   │   ├── StoryPage.js           # Love story display
│   │   │   ├── RSVPPage.js            # Guest RSVP form
│   │   │   ├── SchedulePage.js        # Wedding schedule
│   │   │   ├── GalleryPage.js         # Photo gallery
│   │   │   ├── PartyPage.js           # Wedding party members
│   │   │   ├── RegistryPage.js        # Gift registry
│   │   │   ├── GuestbookPage.js       # Guest messages
│   │   │   └── FAQPage.js             # Frequently asked questions
│   │   │
│   │   ├── components/       # Reusable UI pieces
│   │   │   ├── Navigation.js          # Top navigation bar
│   │   │   ├── LeftSidebar.js         # Dashboard sidebar (2944 lines!)
│   │   │   ├── FloatingTemplateButton.js  # "Edit" button
│   │   │   ├── PaymentModal.js        # Payment popup
│   │   │   └── ui/                    # Reusable UI components
│   │   │
│   │   ├── contexts/         # Global state management
│   │   │   └── UserDataContext.js     # User session & wedding data
│   │   │
│   │   └── utils/            # Helper functions
│   │       └── simpleAuth.js          # Authentication helpers
│   │
│   ├── package.json          # List of JavaScript packages
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── .env                  # Frontend configuration
│
├── tests/                     # Test files
├── .gitignore                # Files to ignore in Git
├── README.md                 # Basic project info
├── test_result.md           # Testing documentation
└── COMPLETE_PROJECT_DOCUMENTATION.md  # This file!
```

---

## 🗄️ Database Schema

### MongoDB Collections (Tables)

#### 1. **users** Collection
Stores all registered users (wedding owners)

```javascript
{
  "_id": "uuid-string",                    // Unique ID
  "username": "john_doe",                  // Login username
  "password": "password123",               // Plain text password (simple auth)
  "created_at": "2025-01-15T10:30:00Z",   // When account was created
  "wedding_id": "wedding-uuid"            // Link to their wedding card
}
```

**Example:**
```javascript
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "sarah_michael_2025",
  "password": "weddingpass",
  "created_at": "2025-06-01T14:20:00Z",
  "wedding_id": "wedding-abc123"
}
```

#### 2. **weddings** Collection
Stores all wedding card information

```javascript
{
  "_id": "wedding-uuid",                   // Unique wedding ID
  "user_id": "user-uuid",                  // Owner's user ID
  "wedding_url": "sarah-and-michael",      // Custom URL (shareable)
  
  // Basic Information
  "bride_name": "Sarah",
  "groom_name": "Michael",
  "wedding_date": "2025-06-15",
  "venue_name": "Sunset Garden Estate",
  "venue_location": "Napa Valley, California",
  
  // Story Timeline
  "story_timeline": [
    {
      "id": "story-1",
      "year": "2019",
      "title": "First Meeting",
      "description": "We met at a coffee shop...",
      "image": "https://example.com/photo1.jpg"
    }
  ],
  
  // Schedule
  "schedule_events": [
    {
      "id": "event-1",
      "time": "2:00 PM",
      "title": "Wedding Ceremony",
      "description": "Join us for the ceremony",
      "location": "Main Hall",
      "duration": "1 hour",
      "date": "2025-06-15",
      "highlight": true
    }
  ],
  
  // Photo Gallery
  "gallery_photos": [
    {
      "id": "photo-1",
      "url": "https://example.com/photo.jpg",
      "title": "Our First Date",
      "description": "Magical evening",
      "category": "engagement"
    }
  ],
  
  // Wedding Party
  "bridal_party": [
    {
      "id": "person-1",
      "name": "Emily Johnson",
      "designation": "Maid of Honor",
      "description": "Best friend since college",
      "photo": "https://example.com/emily.jpg"
    }
  ],
  
  "groom_party": [...],  // Same structure as bridal_party
  
  // Theme
  "theme": "classic",  // classic, modern, or boho
  
  // Sections enabled/disabled
  "sections": {
    "story": true,
    "rsvp": true,
    "schedule": true,
    "gallery": true,
    "wedding_party": true,
    "registry": true,
    "guestbook": true,
    "faq": true
  },
  
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-06-01T14:20:00Z"
}
```

#### 3. **rsvp_responses** Collection
Stores guest RSVP responses

```javascript
{
  "_id": "rsvp-uuid",
  "wedding_id": "wedding-uuid",
  "guest_name": "John Smith",
  "guest_email": "john@example.com",
  "guest_phone": "+1234567890",
  "attending": "yes",  // yes, no, maybe
  "number_of_guests": 2,
  "dietary_restrictions": "Vegetarian",
  "message": "So excited to celebrate with you!",
  "plus_one_name": "Jane Smith",
  "submitted_at": "2025-05-10T09:15:00Z"
}
```

#### 4. **guestbook** Collection
Stores messages from guests

```javascript
{
  "_id": "message-uuid",
  "wedding_id": "wedding-uuid",
  "guest_name": "Emma Wilson",
  "message": "Wishing you a lifetime of happiness!",
  "created_at": "2025-06-16T18:45:00Z"
}
```

#### 5. **gifts** Collection
Stores gift registry and contributions

```javascript
{
  "_id": "gift-uuid",
  "wedding_id": "wedding-uuid",
  "contributor_name": "Robert Brown",
  "contributor_email": "robert@example.com",
  "amount": 100.00,
  "currency": "USD",
  "message": "For your honeymoon!",
  "payment_status": "completed",
  "stripe_payment_id": "pi_xxx",
  "created_at": "2025-06-10T12:00:00Z"
}
```

---

## 🔌 Backend API Documentation

### Base URL
```
http://localhost:8001/api
```

All API endpoints are prefixed with `/api/`

### Authentication Endpoints

#### 1. Register New User
**POST** `/api/register`

**Request Body:**
```json
{
  "username": "sarah_michael",
  "password": "mypassword123"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "wedding_id": "wedding-abc123",
  "session_token": "token-xyz789"
}
```

**What happens:**
1. Backend receives username and password
2. Checks if username already exists
3. Creates new user in `users` collection
4. Creates empty wedding card in `weddings` collection
5. Creates session token for auto-login
6. Returns user_id, wedding_id, and token

#### 2. Login
**POST** `/api/login`

**Request Body:**
```json
{
  "username": "sarah_michael",
  "password": "mypassword123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "wedding_id": "wedding-abc123",
  "session_token": "token-xyz789"
}
```

**What happens:**
1. Backend receives credentials
2. Looks up user in database
3. Compares passwords (simple string match)
4. If match, creates session token
5. Returns user info and token

#### 3. Logout
**POST** `/api/logout`

**Headers:**
```
Authorization: Bearer token-xyz789
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Wedding Data Endpoints

#### 4. Get Wedding Data
**GET** `/api/wedding/{wedding_id}`

**Response:**
```json
{
  "wedding_id": "wedding-abc123",
  "bride_name": "Sarah",
  "groom_name": "Michael",
  "wedding_date": "2025-06-15",
  "venue_name": "Sunset Garden Estate",
  "story_timeline": [...],
  "schedule_events": [...],
  "gallery_photos": [...],
  // ... all wedding data
}
```

**What happens:**
1. Backend receives wedding_id
2. Queries MongoDB for that wedding
3. Returns all wedding data as JSON

#### 5. Update Wedding Data
**PUT** `/api/wedding/{wedding_id}`

**Headers:**
```
Authorization: Bearer token-xyz789
```

**Request Body:** (can update any fields)
```json
{
  "bride_name": "Sarah Jane",
  "groom_name": "Michael Robert",
  "wedding_date": "2025-06-15",
  "venue_name": "Updated Venue",
  "story_timeline": [
    {
      "year": "2020",
      "title": "Got Engaged",
      "description": "He proposed on the beach",
      "image": "https://..."
    }
  ]
}
```

**Response:**
```json
{
  "message": "Wedding updated successfully",
  "wedding_id": "wedding-abc123"
}
```

**What happens:**
1. Backend checks authorization token
2. Validates user owns this wedding
3. Updates wedding document in MongoDB
4. Returns success message

### RSVP Endpoints

#### 6. Submit RSVP
**POST** `/api/rsvp`

**Request Body:**
```json
{
  "wedding_id": "wedding-abc123",
  "guest_name": "John Smith",
  "guest_email": "john@example.com",
  "guest_phone": "+1234567890",
  "attending": "yes",
  "number_of_guests": 2,
  "dietary_restrictions": "Vegetarian",
  "message": "Can't wait!",
  "plus_one_name": "Jane Smith"
}
```

**Response:**
```json
{
  "message": "RSVP submitted successfully",
  "rsvp_id": "rsvp-xyz123"
}
```

**What happens:**
1. Guest fills out RSVP form
2. Frontend sends data to backend
3. Backend saves in `rsvp_responses` collection
4. Can send email notification (if configured)

#### 7. Get RSVPs for Wedding
**GET** `/api/wedding/{wedding_id}/rsvps`

**Headers:**
```
Authorization: Bearer token-xyz789
```

**Response:**
```json
{
  "rsvps": [
    {
      "rsvp_id": "rsvp-1",
      "guest_name": "John Smith",
      "attending": "yes",
      "number_of_guests": 2,
      "submitted_at": "2025-05-10T09:15:00Z"
    }
  ],
  "total_attending": 45,
  "total_declined": 12,
  "total_maybe": 5
}
```

### Guestbook Endpoints

#### 8. Post Guestbook Message
**POST** `/api/guestbook`

**Request Body:**
```json
{
  "wedding_id": "wedding-abc123",
  "guest_name": "Emma Wilson",
  "message": "Wishing you both a lifetime of love!"
}
```

**Response:**
```json
{
  "message": "Guestbook message added",
  "message_id": "msg-xyz"
}
```

#### 9. Get Guestbook Messages
**GET** `/api/wedding/{wedding_id}/guestbook`

**Response:**
```json
{
  "messages": [
    {
      "message_id": "msg-1",
      "guest_name": "Emma Wilson",
      "message": "Wishing you both...",
      "created_at": "2025-06-16T18:45:00Z"
    }
  ]
}
```

### Payment Endpoints (Stripe Integration)

#### 10. Create Payment Intent
**POST** `/api/create-payment-intent`

**Request Body:**
```json
{
  "amount": 10000,  // Amount in cents ($100.00)
  "currency": "usd",
  "wedding_id": "wedding-abc123",
  "contributor_name": "Robert Brown",
  "contributor_email": "robert@example.com"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx"
}
```

---

## 🎨 Frontend Components

### Page Components (What users see)

#### 1. **HomePage.js** - Landing Page
- **Purpose**: First page users see showing the wedding invitation
- **What it shows**:
  - Bride & Groom names
  - Wedding date
  - Venue location
  - Countdown timer (days, hours, minutes, seconds)
  - Navigation menu
  - Theme selector
  - "RSVP Now" and "Event Details" buttons

#### 2. **LoginPage.js** - User Login
- **Purpose**: Let wedding owners log in
- **What it shows**:
  - Username input field
  - Password input field
  - "Sign In" button
  - "Sign up here" link

#### 3. **RegisterPage.js** - User Registration
- **Purpose**: Create new wedding owner account
- **What it shows**:
  - Username input
  - Password input
  - Confirm password input
  - "Create Account" button

#### 4. **DashboardPage.js** - Owner's Control Panel
- **Purpose**: Main page where wedding owners manage their card
- **What it shows**:
  - Left sidebar with all sections (Home, Story, RSVP, etc.)
  - Main content area showing selected section
  - "Copy Shareable Link" button
  - Preview of wedding card
  - Edit forms for each section

#### 5. **PublicWeddingPage.js** - Guest View
- **Purpose**: What guests see when they visit the wedding URL
- **What it shows**:
  - Beautiful wedding card
  - All enabled sections (story, gallery, schedule, etc.)
  - RSVP button
  - Guestbook
  - Navigation between sections

#### Other Pages:
- **StoryPage.js**: Displays love story timeline
- **RSVPPage.js**: RSVP form for guests
- **SchedulePage.js**: Wedding day schedule
- **GalleryPage.js**: Photo gallery
- **PartyPage.js**: Wedding party members
- **RegistryPage.js**: Gift registry
- **GuestbookPage.js**: Guest messages
- **FAQPage.js**: Frequently asked questions

### Key Components

#### **LeftSidebar.js** (2,944 lines - THE BIGGEST COMPONENT!)
This is the control center for wedding owners.

**What it does:**
- Shows menu of all sections (Home, Story, RSVP, etc.)
- Each section has its own manager component:
  - `OurStoryManager` - Manages love story timeline
  - `ScheduleManager` - Manages wedding events
  - `GalleryManager` - Manages photo gallery
  - `WeddingPartyManager` - Manages party members
  - `FAQManager` - Manages FAQ items
  - etc.

**Important Feature - Form State Management:**
Each manager uses **separate state variables** for form inputs to prevent the input focus loss bug:

```javascript
// CORRECT WAY (prevents re-renders)
const [formTitle, setFormTitle] = useState('');
const [formDescription, setFormDescription] = useState('');

// Input uses these directly
<input 
  value={formTitle}
  onChange={(e) => setFormTitle(e.target.value)}
/>
```

**Why this matters:**
- When you type in an input field, React re-renders the component
- If you use object spreading, it creates a NEW object each time
- New object = React thinks it's different = loses focus
- Using separate state variables = no new objects = keeps focus!

#### **Navigation.js** - Top Menu Bar
Shows links to all sections: Home, Story, RSVP, Schedule, etc.

#### **FloatingTemplateButton.js** - Edit Button
The floating button at bottom-right that takes owners to dashboard.

#### **UserDataContext.js** - Global State
Manages user session and wedding data across all components.

**What it stores:**
```javascript
{
  isAuthenticated: true/false,
  userId: "user-id",
  weddingId: "wedding-id",
  sessionToken: "token-xyz",
  weddingData: { /* all wedding info */ }
}
```

**How it works:**
1. When user logs in, stores session info
2. All components can access this data
3. When user logs out, clears everything

---

## 🔄 Data Flow Explained

### Scenario 1: User Creates Account and Wedding Card

**Step-by-Step Flow:**

```
1. USER visits website
   └─> Sees HomePage (landing page)

2. USER clicks "Get This Template" button
   └─> Redirected to /register

3. USER fills registration form
   ├─> Username: "sarah_michael"
   └─> Password: "weddingpass123"

4. USER clicks "Create Account"
   └─> FRONTEND (RegisterPage.js) collects data
       └─> Sends POST request to /api/register
           └─> Request body: { username, password }

5. BACKEND (server.py) receives request
   ├─> Checks if username exists in database
   │   └─> If exists: Return error "Username taken"
   │   └─> If not exists: Continue...
   │
   ├─> Creates new user document
   │   ├─> Generates unique user_id (UUID)
   │   ├─> Stores username and password
   │   └─> Saves to MongoDB users collection
   │
   ├─> Creates new wedding document
   │   ├─> Generates unique wedding_id (UUID)
   │   ├─> Links to user_id
   │   ├─> Sets default template data
   │   │   ├─> bride_name: "Bride"
   │   │   ├─> groom_name: "Groom"
   │   │   ├─> wedding_date: "2025-12-31"
   │   │   └─> All sections enabled
   │   └─> Saves to MongoDB weddings collection
   │
   ├─> Creates session token (UUID)
   │   └─> Stores in active_sessions memory
   │
   └─> Returns response
       └─> { user_id, wedding_id, session_token }

6. FRONTEND receives response
   ├─> Stores session data in UserDataContext
   │   ├─> userId
   │   ├─> weddingId
   │   └─> sessionToken
   │
   ├─> Stores in browser localStorage (persistent)
   │   └─> So user stays logged in even after refresh
   │
   └─> Redirects to /dashboard

7. DASHBOARD loads
   ├─> Fetches wedding data (GET /api/wedding/{wedding_id})
   ├─> Shows left sidebar with all sections
   └─> USER can now edit their wedding card!
```

### Scenario 2: User Edits "Our Story" Section

**Step-by-Step Flow:**

```
1. USER is on Dashboard
   └─> LeftSidebar.js is displayed

2. USER clicks "Our Story" from sidebar menu
   └─> OurStoryManager component is rendered
       └─> Shows existing story timeline (if any)

3. USER clicks "Add New Story Stage" button
   └─> Form expands with empty fields:
       ├─> Year (e.g., "2019")
       ├─> Title (e.g., "First Meeting")
       ├─> Description (text area)
       └─> Image URL (optional)

4. USER types in Year field: "2020"
   └─> onChange event triggers
       └─> setFormYear("2020")
           └─> React updates ONLY formYear state
               └─> No re-render of entire component
                   └─> Input keeps focus! ✅

5. USER types in Title field: "Got Engaged"
   └─> onChange event triggers
       └─> setFormTitle("Got Engaged")
           └─> React updates ONLY formTitle state
               └─> Input keeps focus! ✅

6. USER types in Description: "He proposed on the beach..."
   └─> onChange event triggers
       └─> setFormDescription("He proposed...")
           └─> Input keeps focus! ✅

7. USER clicks "Save" button
   └─> handleSaveStage() function executes
       │
       ├─> Validates: Year and Title are required
       │   └─> If empty: Show alert "Please fill required fields"
       │   └─> If filled: Continue...
       │
       ├─> Creates story stage object
       │   └─> {
       │         year: formYear,
       │         title: formTitle,
       │         description: formDescription,
       │         image: formImage
       │       }
       │
       ├─> Adds to storyTimeline array
       │   └─> storyTimeline.push(newStage)
       │
       ├─> Calls onSave() to send to backend
       │   └─> onSave({ story_timeline: updatedTimeline })
       │
       └─> Clears form fields
           ├─> setFormYear('')
           ├─> setFormTitle('')
           ├─> setFormDescription('')
           └─> setFormImage('')

8. onSave() in DashboardPage.js executes
   └─> Calls updateWeddingData()
       └─> Sends PUT request to /api/wedding/{wedding_id}
           └─> Headers: { Authorization: "Bearer token" }
           └─> Body: { story_timeline: [...] }

9. BACKEND receives update request
   ├─> Validates session token
   │   └─> If invalid: Return 401 Unauthorized
   │   └─> If valid: Continue...
   │
   ├─> Finds wedding document by wedding_id
   │   └─> MongoDB query: weddings.find_one({ "_id": wedding_id })
   │
   ├─> Updates story_timeline field
   │   └─> MongoDB update: 
   │       weddings.update_one(
   │         { "_id": wedding_id },
   │         { "$set": { "story_timeline": new_timeline } }
   │       )
   │
   └─> Returns success response
       └─> { message: "Wedding updated successfully" }

10. FRONTEND receives success response
    ├─> Shows success notification "Story saved!"
    ├─> Updates local wedding data in context
    └─> User sees updated story on dashboard

11. RESULT: New story stage is now saved!
    └─> Will appear on public wedding page
    └─> Guests can see it when they visit
```

### Scenario 3: Guest Submits RSVP

**Step-by-Step Flow:**

```
1. GUEST receives wedding invitation link
   └─> Example: https://weddingcard.com/sarah-and-michael

2. GUEST clicks link and visits website
   └─> PublicWeddingPage.js loads
       └─> Fetches wedding data (GET /api/wedding/sarah-and-michael)
       └─> Displays beautiful wedding card

3. GUEST clicks "RSVP Now" button
   └─> Scrolls to RSVP section
       └─> Shows RSVP form

4. GUEST fills RSVP form
   ├─> Name: "John Smith"
   ├─> Email: "john@example.com"
   ├─> Phone: "+1234567890"
   ├─> Attending: Selects "Yes, I'll be there!"
   ├─> Number of Guests: "2"
   ├─> Dietary: "Vegetarian"
   ├─> Plus One: "Jane Smith"
   └─> Message: "So excited to celebrate!"

5. GUEST clicks "Submit RSVP" button
   └─> FRONTEND (RSVPPage.js) validates data
       ├─> Checks all required fields filled
       ├─> Validates email format
       └─> If valid: Sends to backend

6. FRONTEND sends POST to /api/rsvp
   └─> Request body: { 
         wedding_id: "wedding-abc123",
         guest_name: "John Smith",
         guest_email: "john@example.com",
         guest_phone: "+1234567890",
         attending: "yes",
         number_of_guests: 2,
         dietary_restrictions: "Vegetarian",
         plus_one_name: "Jane Smith",
         message: "So excited..."
       }

7. BACKEND receives RSVP submission
   ├─> Generates unique rsvp_id (UUID)
   │
   ├─> Creates RSVP document
   │   └─> {
   │         _id: "rsvp-xyz123",
   │         wedding_id: "wedding-abc123",
   │         guest_name: "John Smith",
   │         guest_email: "john@example.com",
   │         ...all other fields,
   │         submitted_at: "2025-05-10T09:15:00Z"
   │       }
   │
   ├─> Saves to MongoDB rsvp_responses collection
   │   └─> MongoDB insert: rsvp_responses.insert_one(rsvp_doc)
   │
   ├─> (Optional) Sends confirmation email to guest
   │   └─> If email service configured
   │
   └─> Returns success response
       └─> { message: "RSVP submitted", rsvp_id: "rsvp-xyz123" }

8. FRONTEND receives success
   ├─> Shows confirmation message
   │   └─> "Thank you! Your RSVP has been submitted."
   └─> Clears form

9. WEDDING OWNER can see RSVP
   └─> Goes to Dashboard
       └─> Clicks "RSVP" section
           └─> Backend fetches all RSVPs for this wedding
               └─> GET /api/wedding/{wedding_id}/rsvps
           └─> Shows list:
               ├─> John Smith - Attending (2 guests)
               ├─> Statistics: 45 attending, 12 declined
               └─> Can export to Excel
```

---

## 🔐 Authentication System

### How Login Works (Simple Explanation)

Our authentication is **simple and straightforward** (not enterprise-grade, but works well for this use case).

### Components:

1. **Session Token** - A unique random string (UUID)
   - Example: `"550e8400-e29b-41d4-a716-446655440000"`
   - Think of it as a temporary ID card

2. **Active Sessions** - A dictionary in backend memory
   ```python
   active_sessions = {
     "token-abc123": {
       "user_id": "user-xyz",
       "wedding_id": "wedding-abc",
       "created_at": "2025-06-15T10:00:00Z"
     }
   }
   ```

3. **localStorage** - Browser storage on frontend
   ```javascript
   localStorage.setItem('sessionToken', 'token-abc123');
   localStorage.setItem('userId', 'user-xyz');
   localStorage.setItem('weddingId', 'wedding-abc');
   ```

### Login Flow in Detail:

```
1. USER enters credentials
   ├─> Username: "sarah_michael"
   └─> Password: "weddingpass"

2. FRONTEND sends POST to /api/login
   └─> Body: { username: "sarah_michael", password: "weddingpass" }

3. BACKEND receives login request
   ├─> Queries MongoDB: users.find_one({ "username": "sarah_michael" })
   │   └─> Returns user document (or None if not found)
   │
   ├─> Checks password
   │   └─> if user.password == "weddingpass":  # Simple comparison
   │       └─> ✅ Password matches!
   │   └─> else:
   │       └─> ❌ Return error "Invalid credentials"
   │
   ├─> Generates session token (UUID)
   │   └─> token = "550e8400-e29b-41d4-a716-446655440000"
   │
   ├─> Stores in active_sessions
   │   └─> active_sessions[token] = {
   │         "user_id": user._id,
   │         "wedding_id": user.wedding_id,
   │         "created_at": datetime.now()
   │       }
   │
   └─> Returns response
       └─> {
             "message": "Login successful",
             "session_token": "token-550e8400...",
             "user_id": "user-xyz",
             "wedding_id": "wedding-abc"
           }

4. FRONTEND receives response
   ├─> Stores in UserDataContext (React state)
   │   └─> setUserData({
   │         isAuthenticated: true,
   │         userId: "user-xyz",
   │         weddingId: "wedding-abc",
   │         sessionToken: "token-550e8400..."
   │       })
   │
   ├─> Stores in localStorage (persistent)
   │   └─> So user stays logged in after page refresh
   │
   └─> Redirects to /dashboard

5. SUBSEQUENT REQUESTS use token
   └─> Every API call includes:
       └─> Headers: { "Authorization": "Bearer token-550e8400..." }
   
6. BACKEND validates token on each request
   └─> Checks if token exists in active_sessions
       ├─> If exists: ✅ Authorized, proceed
       └─> If not exists: ❌ Return 401 Unauthorized
```

### Logout Flow:

```
1. USER clicks "Logout"
   └─> FRONTEND sends POST to /api/logout
       └─> Headers: { "Authorization": "Bearer token-550e8400..." }

2. BACKEND removes session
   └─> del active_sessions["token-550e8400..."]

3. FRONTEND clears data
   ├─> localStorage.clear()
   ├─> setUserData({ isAuthenticated: false })
   └─> Redirects to /login
```

---

## 📝 Form Management System

### The Input Focus Bug (and how we fixed it!)

#### The Problem:
When users tried to type in form inputs (like "Year" or "Title" in Our Story), they could only type ONE character before the input lost focus.

**Why it happened:**
```javascript
// ❌ WRONG WAY (causes bug)
const [editingEvent, setEditingEvent] = useState({});

<input
  value={editingEvent.title || ''}
  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
/>

// What happens:
// 1. User types "H"
// 2. onChange fires
// 3. setEditingEvent creates NEW object: { ...editingEvent, title: "H" }
// 4. React sees new object → triggers re-render
// 5. Input element is recreated
// 6. Focus is LOST! 😱
// 7. User has to click again to type next character
```

#### The Solution:
```javascript
// ✅ CORRECT WAY (maintains focus)
const [formTitle, setFormTitle] = useState('');
const [formTime, setFormTime] = useState('');
const [formDescription, setFormDescription] = useState('');

<input
  value={formTitle}
  onChange={(e) => setFormTitle(e.target.value)}
/>

// What happens:
// 1. User types "H"
// 2. onChange fires
// 3. setFormTitle("H") updates ONLY formTitle
// 4. React updates ONLY that state variable
// 5. No new object created
// 6. Input element stays the same
// 7. Focus is MAINTAINED! 🎉
// 8. User can keep typing: "Hello World"
```

### Form Management Pattern Used:

Every form manager (OurStoryManager, ScheduleManager, GalleryManager, etc.) follows this pattern:

```javascript
const SectionManager = ({ weddingData, onSave, theme }) => {
  // Main data state (what's saved in database)
  const [items, setItems] = useState(weddingData?.items || []);
  
  // Editing state (which item is being edited)
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // ✅ SEPARATE form state for each input field
  const [formField1, setFormField1] = useState('');
  const [formField2, setFormField2] = useState('');
  const [formField3, setFormField3] = useState('');
  
  // When user clicks "Add New"
  const handleAdd = () => {
    setFormField1('');  // Clear form
    setFormField2('');
    setFormField3('');
    setEditingItem({ id: Date.now().toString() });
    setIsAddingNew(true);
  };
  
  // When user clicks "Edit" on existing item
  const handleEdit = (item) => {
    setFormField1(item.field1 || '');  // Load existing data
    setFormField2(item.field2 || '');
    setFormField3(item.field3 || '');
    setEditingItem(item);
    setIsAddingNew(false);
  };
  
  // When user clicks "Save"
  const handleSave = () => {
    // Validate
    if (!formField1.trim()) {
      alert('Field 1 is required');
      return;
    }
    
    // Create item from form state
    const itemData = {
      id: editingItem.id,
      field1: formField1.trim(),
      field2: formField2.trim(),
      field3: formField3.trim()
    };
    
    // Update items array
    const updatedItems = [...items];
    if (isAddingNew) {
      updatedItems.push(itemData);
    } else {
      const index = updatedItems.findIndex(i => i.id === editingItem.id);
      updatedItems[index] = itemData;
    }
    
    setItems(updatedItems);
    
    // Clear form
    setFormField1('');
    setFormField2('');
    setFormField3('');
    setEditingItem(null);
    setIsAddingNew(false);
    
    // Save to backend
    onSave({ items: updatedItems });
  };
  
  // Render form
  return (
    <div>
      {editingItem && (
        <form>
          <input
            value={formField1}
            onChange={(e) => setFormField1(e.target.value)}
          />
          <input
            value={formField2}
            onChange={(e) => setFormField2(e.target.value)}
          />
          <textarea
            value={formField3}
            onChange={(e) => setFormField3(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
        </form>
      )}
    </div>
  );
};
```

---

## 🚶 Step-by-Step User Journey

### Journey 1: Wedding Owner Creates Their Card

```
┌─────────────────────────────────────────────────┐
│ DAY 1: Sarah & Michael decide to get married   │
└─────────────────────────────────────────────────┘

Step 1: Discovery
├─> Sarah searches "digital wedding invitation"
├─> Finds our Wedding Card app
└─> Opens https://weddingcard.com

Step 2: Landing Page
├─> Sees beautiful template
├─> Bride & Groom names: "Sarah & Michael"
├─> Date: "June 15, 2025"
├─> Clicks "Get This Template" button
└─> Redirected to /register

Step 3: Account Creation
├─> Fills form:
│   ├─> Username: "sarah_michael_2025"
│   ├─> Password: "ourloveforever"
│   └─> Confirm Password: "ourloveforever"
├─> Clicks "Create Account"
├─> Account created in 2 seconds!
└─> Automatically logged in → Dashboard

Step 4: Dashboard First Look
├─> Sees left sidebar menu:
│   ├─> ✓ Home (Basic Info)
│   ├─> ✓ Our Story
│   ├─> ✓ RSVP
│   ├─> ✓ Schedule
│   ├─> ✓ Gallery
│   ├─> ✓ Wedding Party
│   ├─> ✓ Registry
│   ├─> ✓ Guestbook
│   └─> ✓ FAQ
└─> Right side shows preview of wedding card

Step 5: Edit Basic Info (Home Section)
├─> Clicks "Home" from sidebar
├─> Form opens with fields:
│   ├─> Bride Name: Changes to "Sarah Jane"
│   ├─> Groom Name: Changes to "Michael Robert"
│   ├─> Wedding Date: Picks June 15, 2025
│   ├─> Venue: "Sunset Garden Estate"
│   └─> Location: "Napa Valley, California"
├─> Clicks "Save Changes"
└─> ✅ Saved! Preview updates instantly

Step 6: Add Love Story
├─> Clicks "Our Story" from sidebar
├─> Clicks "Add New Story Stage"
├─> Fills form:
│   ├─> Year: "2019"
│   ├─> Title: "First Meeting"
│   ├─> Description: "We met at a coffee shop in downtown San Francisco on a rainy Tuesday morning. Sarah was reading a book, Michael was ordering coffee. Our eyes met, and the rest is history."
│   └─> Image URL: "https://photos.com/first-date.jpg"
├─> Clicks "Save"
├─> Adds another stage:
│   ├─> Year: "2021"
│   ├─> Title: "Got Engaged"
│   └─> Description: "Michael proposed on a beach at sunset..."
└─> ✅ Love story timeline created!

Step 7: Add Wedding Schedule
├─> Clicks "Schedule" from sidebar
├─> Clicks "Add New Event"
├─> Event 1:
│   ├─> Title: "Wedding Ceremony"
│   ├─> Time: "2:00 PM"
│   ├─> Location: "Main Hall"
│   ├─> Duration: "1 hour"
│   └─> Highlight: ✓ (makes it stand out)
├─> Event 2:
│   ├─> Title: "Cocktail Hour"
│   ├─> Time: "3:00 PM"
│   └─> Location: "Garden Terrace"
├─> Event 3:
│   ├─> Title: "Reception Dinner"
│   ├─> Time: "5:00 PM"
│   └─> Location: "Grand Ballroom"
└─> ✅ Schedule complete!

Step 8: Add Photo Gallery
├─> Clicks "Gallery" from sidebar
├─> Adds 10 photos:
│   ├─> Photo 1: Engagement shoot
│   ├─> Photo 2: Vacation in Paris
│   ├─> Photo 3: With families
│   └─> etc.
└─> ✅ Gallery looks beautiful!

Step 9: Add Wedding Party
├─> Clicks "Wedding Party"
├─> Adds Bride's Party:
│   ├─> Maid of Honor: "Emily Johnson"
│   ├─> Bridesmaid 1: "Jessica Smith"
│   └─> Bridesmaid 2: "Rachel Green"
├─> Adds Groom's Party:
│   ├─> Best Man: "David Brown"
│   ├─> Groomsman 1: "Tom Wilson"
│   └─> Groomsman 2: "James Taylor"
└─> ✅ Wedding party complete!

Step 10: Customize Theme
├─> Clicks theme selector (top right)
├─> Tries different themes:
│   ├─> Classic (elegant black & gold)
│   ├─> Modern (purple gradient)
│   └─> Boho (earthy brown & cream)
├─> Chooses "Classic"
└─> ✅ Theme applied to entire card!

Step 11: Get Shareable Link
├─> Clicks "Copy Shareable Link" button
├─> Gets link: "https://weddingcard.com/sarah-and-michael"
├─> Opens WhatsApp
├─> Shares with 150 guests:
│   "Hey everyone! We're getting married! 🎉💍
│    Check out our wedding card: 
│    https://weddingcard.com/sarah-and-michael
│    Please RSVP! Can't wait to celebrate with you!"
└─> ✅ Invitation sent!

Step 12: Monitor RSVPs
├─> Over next few weeks...
├─> Logs into dashboard daily
├─> Clicks "RSVP" section
├─> Sees responses coming in:
│   ├─> 45 attending
│   ├─> 12 declined
│   ├─> 5 maybe
│   └─> Total: 62 responses (41% response rate)
└─> Can export list to Excel for seating chart

┌─────────────────────────────────────────────────┐
│ JUNE 15, 2025: The Big Day!                    │
│ Sarah & Michael get married 💒💕              │
│ All guests had the information they needed      │
│ Everything went perfectly! 🎊                   │
└─────────────────────────────────────────────────┘
```

### Journey 2: Guest Receives Invitation and RSVPs

```
┌─────────────────────────────────────────────────┐
│ Guest: John Smith (Sarah's college friend)     │
└─────────────────────────────────────────────────┘

Step 1: Receives Invitation
├─> Gets WhatsApp message from Sarah
├─> Sees link: https://weddingcard.com/sarah-and-michael
├─> Clicks link on phone
└─> Wedding card opens in browser

Step 2: Views Wedding Card
├─> Sees beautiful homepage:
│   ├─> "Sarah & Michael"
│   ├─> "June 15, 2025"
│   ├─> Countdown: 45 days, 12 hours, 30 minutes
│   └─> "Sunset Garden Estate • Napa Valley"
├─> Navigation menu at top shows all sections
└─> Explores the card...

Step 3: Reads Love Story
├─> Clicks "Our Story" link
├─> Scrolls through timeline:
│   ├─> 2019: First Meeting ❤️
│   ├─> 2021: Got Engaged 💍
│   └─> 2023: Bought First Home 🏡
└─> "Aww, so cute!" 😊

Step 4: Checks Schedule
├─> Clicks "Schedule"
├─> Sees events:
│   ├─> 2:00 PM - Wedding Ceremony
│   ├─> 3:00 PM - Cocktail Hour
│   ├─> 5:00 PM - Reception Dinner
│   └─> 8:00 PM - Dancing!
├─> Notes: "Need to arrive by 1:30 PM"
└─> Adds to phone calendar

Step 5: Views Gallery
├─> Clicks "Gallery"
├─> Sees beautiful photos of couple
├─> Recognizes some mutual friends
└─> Screenshots favorite photo

Step 6: Decides to RSVP
├─> Clicks "RSVP" button
├─> Form opens with fields:
│   ├─> Name: "John Smith"
│   ├─> Email: "john.smith@email.com"
│   ├─> Phone: "+1 (555) 123-4567"
│   ├─> Will you attend?: Selects "Yes, I'll be there!"
│   ├─> Number of guests: "2" (bringing wife Jane)
│   ├─> Plus-one name: "Jane Smith"
│   ├─> Dietary restrictions: "Jane is vegetarian"
│   └─> Message: "So excited to celebrate with you both! Congratulations! 🎉"
├─> Clicks "Submit RSVP"
└─> ✅ "Thank you! Your RSVP has been submitted."

Step 7: Leaves Guestbook Message
├─> Scrolls down to Guestbook
├─> Types message:
│   "Wishing you both a lifetime of love and happiness!
│    Can't wait to see you walk down the aisle! ❤️"
├─> Clicks "Post Message"
└─> ✅ Message appears on guestbook wall

Step 8: Checks Gift Registry
├─> Clicks "Registry"
├─> Sees honeymoon fund info
├─> Decides to contribute $100
├─> Clicks "Contribute"
├─> Payment form opens (Stripe)
├─> Enters card details
└─> ✅ Payment successful! "Thank you for your gift!"

Step 9: Day of Wedding
├─> Opens wedding card again on phone
├─> Checks schedule: "Ceremony at 2:00 PM"
├─> Uses "Get Directions" link
├─> Arrives at venue on time
└─> Has amazing time at wedding! 🎊

Step 10: After Wedding
├─> Goes back to wedding card website
├─> Looks at photos again
├─> Shares link with other friends:
│   "Look at Sarah and Michael's beautiful wedding card!"
└─> Great memories! 📸💕
```

---

## 🚀 How to Run the Project

### Prerequisites (What you need installed):
- Python 3.11+ (for backend)
- Node.js 18+ & Yarn (for frontend)
- MongoDB (database)

### Step 1: Clone the Repository
```bash
git clone https://github.com/pspatilx/wc1.1.git
cd wc1.1
```

### Step 2: Configure Environment Variables

**Backend (.env)**
```bash
cd backend
nano .env
```

Add these lines:
```env
MONGO_URL=mongodb+srv://your-mongodb-url
DB_NAME=weddingcard
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-here
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
```

**Frontend (.env)**
```bash
cd ../frontend
nano .env
```

Add these lines:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=0
```

### Step 3: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

What gets installed:
- fastapi (web framework)
- uvicorn (server)
- motor (MongoDB driver)
- stripe (payment processing)
- pydantic (data validation)
- python-dotenv (environment variables)

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
yarn install
```

What gets installed:
- react (UI library)
- react-router-dom (navigation)
- tailwindcss (styling)
- lucide-react (icons)
- stripe/react-stripe-js (payments)
- and many more...

### Step 5: Start Backend Server
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
✅ Connected to MongoDB database: weddingcard
✅ Wedding Card API started successfully
```

### Step 6: Start Frontend Server
Open a new terminal:
```bash
cd frontend
yarn start
```

You should see:
```
Compiled successfully!
You can now view wedding-card in the browser.
  Local:            http://localhost:3000
```

### Step 7: Open in Browser
Visit: `http://localhost:3000`

You should see the beautiful wedding card landing page!

### Alternative: Using Supervisor (Production-like)

If the project has supervisor configured:

```bash
# Start all services at once
sudo supervisorctl start all

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/frontend.out.log

# Restart a service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

---

## 🐛 Troubleshooting

### Problem 1: Backend won't start
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Problem 2: MongoDB connection failed
**Error:** `❌ Error connecting to MongoDB`

**Solution:**
1. Check your MongoDB URL in `backend/.env`
2. Make sure MongoDB is running
3. Verify network connectivity

### Problem 3: Frontend shows blank page
**Error:** `Cannot read properties of undefined`

**Solution:**
1. Check browser console (F12)
2. Verify backend is running on port 8001
3. Check REACT_APP_BACKEND_URL in `frontend/.env`

### Problem 4: Input fields lose focus
**This was FIXED!**

The issue was in ScheduleManager component. We now use separate state variables for each form field instead of object spreading.

If you still see this issue:
1. Check that LeftSidebar.js has the latest code
2. Make sure you're using `setFormField()` instead of `setEditingEvent({ ...editingEvent })`

### Problem 5: RSVP not saving
**Check:**
1. Backend logs: `tail -f /var/log/supervisor/backend.out.log`
2. MongoDB connection is working
3. Wedding ID is correct

### Problem 6: Can't upload images
**Note:** This app uses IMAGE URLs, not file uploads.

To add images:
1. Upload image to image hosting service (Imgur, Cloudinary, etc.)
2. Copy direct image URL
3. Paste URL in image field

---

## 📚 Additional Resources

### File Sizes
- **backend/server.py**: 1,531 lines - Main API logic
- **frontend/src/components/LeftSidebar.js**: 2,944 lines - Dashboard control center

### Key Technologies Documentation
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [MongoDB](https://www.mongodb.com/docs/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Stripe](https://stripe.com/docs) - Payments

### Project Structure Best Practices
1. **Separation of Concerns**: Backend and Frontend are separate
2. **Component-Based**: Each page/section is a separate component
3. **State Management**: React Context for global state
4. **Form Handling**: Separate state variables to prevent re-renders
5. **API Design**: RESTful endpoints with clear purposes

---

## 🎓 Summary for a 15-Year-Old

Imagine you're building a LEGO castle:

1. **Backend (server.py)** = The instruction manual
   - Tells everything how to work
   - Connects to the database (storage box)
   - Handles all the logic

2. **Frontend (React)** = The actual LEGO pieces you see
   - The pretty castle you can touch
   - Different sections (rooms) of the castle
   - You click buttons, it tells backend what to do

3. **Database (MongoDB)** = The storage box
   - Keeps all your LEGO pieces safe
   - You can take them out anytime
   - Everything is organized in labeled bags

4. **Data Flow** = How things move:
   ```
   You click button → 
   Frontend sends request → 
   Backend processes → 
   Database saves → 
   Backend responds → 
   Frontend updates → 
   You see result!
   ```

5. **The Input Focus Bug** = Like a pen that stops working after one letter
   - We fixed it by using separate notebooks for each field
   - Now you can write whole stories without stopping!

**The whole app** is like a digital wedding invitation builder where couples can create beautiful websites to share with their guests, and guests can RSVP and leave messages. It's like having a wedding planner website that you customize yourself!

---

## 📝 Conclusion

This Wedding Card Application is a full-stack web application that demonstrates:
- Modern web development practices
- Clean code architecture
- Proper data flow
- User-friendly interface
- Real-world functionality

Whether you're a beginner learning how web apps work or an experienced developer reviewing the code, this documentation should help you understand every aspect of the project.

**Happy coding! 💻✨**

*Last Updated: October 4, 2025*
*Version: 1.0*
*Author: Development Team*
