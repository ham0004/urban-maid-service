# Module 2, Member-3: Maid Scheduling & Availability Implementation

## 📋 Overview

Complete implementation of **Maid Scheduling & Availability** feature for Module 2, Member-3 of the Urban Maid Service platform. This feature enables maids to:
- Set weekly working hours (Monday-Sunday with custom time ranges)
- Block specific time slots (full day or partial)
- Manage availability status
- Integrate with real-time booking conflict prevention system

## ✅ Implementation Status

**Completion: 100%**

All components are implemented and ready for integration with existing features.

---

## 🏗️ Architecture & Components

### Backend (Node.js/Express)

#### 1. **Database Model Extension** (`server/models/User.js`)
Extended the `maidProfile` object with scheduling fields:

```javascript
maidProfile: {
  // ... existing fields (experience, skills, documents, verificationStatus)
  
  // NEW: Scheduling Fields (Member-3, Module 2)
  weeklySchedule: [
    {
      dayOfWeek: 0-6,        // 0 = Monday, 6 = Sunday
      isAvailable: Boolean,  // Is maid available on this day?
      startTime: "HH:MM",    // Working hours start (24-hour format)
      endTime: "HH:MM"       // Working hours end (24-hour format)
    }
  ],
  
  blockedSlots: [
    {
      date: Date,            // Date to block
      reason: String,        // Why blocked (personal appointment, sick leave, etc.)
      startTime: "HH:MM",    // Block start time (optional, default "00:00")
      endTime: "HH:MM"       // Block end time (optional, default "23:59")
    }
  ]
}
```

#### 2. **Controller** (`server/controllers/maidScheduleController.js`)

**6 Main Functions:**

##### a) `setWeeklySchedule(req, res, next)`
- **Route:** `PUT /api/maids/schedule/weekly`
- **Access:** Private (Maid only)
- **Validates:** Time format (HH:MM), start < end time
- **Updates:** User's weeklySchedule array
- **Returns:** Updated schedule

**Example Request:**
```json
{
  "weeklySchedule": [
    { "dayOfWeek": 0, "isAvailable": true, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 1, "isAvailable": true, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 2, "isAvailable": false },
    { "dayOfWeek": 3, "isAvailable": true, "startTime": "10:00", "endTime": "18:00" },
    { "dayOfWeek": 4, "isAvailable": true, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 5, "isAvailable": true, "startTime": "09:00", "endTime": "14:00" },
    { "dayOfWeek": 6, "isAvailable": false }
  ]
}
```

##### b) `getWeeklySchedule(req, res, next)`
- **Route:** `GET /api/maids/schedule/weekly`
- **Access:** Private (Maid only)
- **Returns:** Maid's weekly schedule array

##### c) `blockSlot(req, res, next)`
- **Route:** `POST /api/maids/schedule/block-slot`
- **Access:** Private (Maid only)
- **Validates:** Date not in past, time format, start < end
- **Creates:** New blocked slot entry
- **Returns:** Newly created blocked slot

**Example Request:**
```json
{
  "date": "2025-12-25",
  "startTime": "09:00",
  "endTime": "17:00",
  "reason": "Personal appointment"
}
```

**Default Behavior:** If times not provided, blocks entire day (00:00-23:59)

##### d) `unblockSlot(req, res, next)`
- **Route:** `DELETE /api/maids/schedule/block-slot/:slotId`
- **Access:** Private (Maid only)
- **Removes:** Blocked slot by ID
- **Returns:** Success message

##### e) `getBlockedSlots(req, res, next)`
- **Route:** `GET /api/maids/schedule/blocked-slots`
- **Access:** Private (Maid only)
- **Returns:** Array of all blocked slots

##### f) `getAvailableSlots(req, res, next)` ⭐ **Integration Point**
- **Route:** `GET /api/maids/schedule/available-slots/:maidId`
- **Access:** Public
- **Integrates With:** Member-2's Booking system
- **Logic:** 
  1. Checks maid's weekly schedule for the requested day
  2. Filters out booked time slots (from Booking model)
  3. Filters out blocked time slots
  4. Returns remaining available time slots
- **Returns:** Available slots, booked slots, blocked slots, maid schedule

**Example Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-15",
    "maidSchedule": {
      "dayOfWeek": 0,
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "availableSlots": ["09:00", "10:00", "12:00", "13:00", "14:00", "15:00"],
    "bookedSlots": ["11:00"],
    "blockedSlots": []
  }
}
```

#### 3. **Routes** (`server/routes/maidScheduleRoutes.js`)

```javascript
// Public endpoint (for checking availability before booking)
GET    /api/maids/schedule/available-slots/:maidId?date=YYYY-MM-DD

// Protected endpoints (Maid only)
PUT    /api/maids/schedule/weekly                    // Set weekly hours
GET    /api/maids/schedule/weekly                    // View weekly hours
POST   /api/maids/schedule/block-slot                // Block a slot
GET    /api/maids/schedule/blocked-slots             // View blocked slots
DELETE /api/maids/schedule/block-slot/:slotId        // Unblock a slot
```

#### 4. **Server Integration** (`server/server.js`)
- Imported: `maidScheduleRoutes`
- Registered: `app.use('/api/maids/schedule', maidScheduleRoutes)`
- No conflicts with existing routes

---

### Frontend (React)

#### 1. **MaidSchedule Component** (`client/src/components/maid/MaidSchedule.js`)

**Features:**
- Display all 7 days of the week
- Toggle availability on/off for each day
- Set custom start/end times for working hours
- Save entire weekly schedule with validation
- View and manage blocked slots
- Remove blocked slots

**Props:** None

**State:**
- `weeklySchedule`: Array of day schedules
- `blockedSlots`: Array of blocked time slots
- `loading`: Boolean for form submission
- `error`, `success`: Message states

**Key Functions:**
- `fetchWeeklySchedule()`: Load maid's schedule from API
- `fetchBlockedSlots()`: Load blocked slots
- `handleSaveSchedule()`: Send weekly schedule to backend
- `handleUnblockSlot()`: Remove a blocked slot

**UI Layout:**
```
📅 My Availability Schedule
┌─────────────────────────────────────┐
│ Weekly Working Hours                │
│ ┌─ Monday      [✓ Available]       │
│ │  Start: [09:00] End: [17:00]     │
│ ├─ Tuesday     [✓ Available]       │
│ │  Start: [09:00] End: [17:00]     │
│ ├─ Wednesday   [✗ Not Available]   │
│ ├─ ...                             │
│ [Save Schedule Button]             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Blocked Time Slots                  │
│ • 2025-12-25 | Personal appointment │
│ • 2025-12-26 | Sick leave          │
└─────────────────────────────────────┘
```

#### 2. **BlockSlot Component** (`client/src/components/maid/BlockSlot.js`)

**Features:**
- Date picker (prevents past dates)
- Toggle between full-day and partial-time blocks
- Add reason for blocking
- Validation for time ranges
- Success feedback

**Props:**
- `onBlockSuccess`: Callback function (optional)

**State:**
- `formData`: Form fields (date, startTime, endTime, reason)
- `isFullDay`: Toggle for full-day blocks
- `loading`, `error`, `success`: Status messages

**Key Functions:**
- `handleSubmit()`: Create blocked slot via API
- `handleChange()`: Update form fields

**UI Layout:**
```
🚫 Block Time Slot
┌─────────────────────────────────────┐
│ Date: [picker]                      │
│ [✓] Block entire day                │
│ [or custom time range if unchecked] │
│ Start: [00:00] End: [23:59]         │
│ Reason: [text input]                │
│ [Block Slot Button]                 │
└─────────────────────────────────────┘
```

#### 3. **Routes** (`client/src/App.js`)
```javascript
<Route path="/maid/schedule" element={<MaidSchedule />} />
<Route path="/maid/block-slot" element={<BlockSlot />} />
```

---

## 🔗 Integration Points

### With Member-2's Booking System

**Location:** `getAvailableSlots()` in `maidScheduleController.js`

**How It Works:**
1. When customer books a service, they select a maid and date
2. Frontend calls: `GET /api/maids/schedule/available-slots/:maidId?date=...`
3. This endpoint:
   - Checks maid's weekly schedule
   - Queries booking conflict from `Booking.find()`
   - Filters blocked slots
   - Returns combined available slots
4. Customer picks from these slots
5. Booking is created with conflict validation

**No Breaking Changes:**
- Existing `getAvailableSlots()` in `bookingController.js` still works
- New endpoint is additional, doesn't replace existing logic
- Both systems are independent

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   MAID (User)   │
└────────┬────────┘
         │
         ├─→ Sets Weekly Schedule
         │   PUT /api/maids/schedule/weekly
         │   Updates User.maidProfile.weeklySchedule
         │
         └─→ Blocks Time Slots
             POST /api/maids/schedule/block-slot
             Adds to User.maidProfile.blockedSlots

┌──────────────────┐
│ CUSTOMER (User)  │
└────────┬─────────┘
         │
         └─→ Books Service
             POST /api/bookings
             │
             ├─→ Checks Availability
             │   GET /api/maids/schedule/available-slots/:maidId
             │   │
             │   ├─→ Reads Weekly Schedule ✓
             │   ├─→ Queries Existing Bookings ✓
             │   └─→ Filters Blocked Slots ✓
             │   Returns: [available slots]
             │
             └─→ Creates Booking
                 Booking.checkConflict() validates
```

---

## 🚀 API Usage Examples

### 1. Set Weekly Schedule

**Request:**
```bash
curl -X PUT http://localhost:5000/api/maids/schedule/weekly \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weeklySchedule": [
      {"dayOfWeek": 0, "isAvailable": true, "startTime": "09:00", "endTime": "17:00"},
      {"dayOfWeek": 1, "isAvailable": true, "startTime": "09:00", "endTime": "17:00"},
      {"dayOfWeek": 2, "isAvailable": false},
      {"dayOfWeek": 3, "isAvailable": true, "startTime": "10:00", "endTime": "18:00"},
      {"dayOfWeek": 4, "isAvailable": true, "startTime": "09:00", "endTime": "17:00"},
      {"dayOfWeek": 5, "isAvailable": true, "startTime": "09:00", "endTime": "14:00"},
      {"dayOfWeek": 6, "isAvailable": false}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Weekly schedule updated successfully",
  "data": [...]
}
```

### 2. Block a Slot (Full Day)

**Request:**
```bash
curl -X POST http://localhost:5000/api/maids/schedule/block-slot \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "reason": "Holiday"
  }'
```

### 3. Block a Slot (Partial Time)

**Request:**
```bash
curl -X POST http://localhost:5000/api/maids/schedule/block-slot \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-20",
    "startTime": "14:00",
    "endTime": "17:00",
    "reason": "Doctor appointment"
  }'
```

### 4. Check Available Slots (for Booking)

**Request:**
```bash
curl "http://localhost:5000/api/maids/schedule/available-slots/507f1f77bcf86cd799439011?date=2025-12-20"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-20",
    "maidSchedule": {
      "dayOfWeek": 4,
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "availableSlots": ["09:00", "10:00", "11:00", "13:00", "14:00"],
    "bookedSlots": ["12:00"],
    "blockedSlots": [{"startTime": "14:00", "endTime": "17:00", "reason": "Doctor appointment"}]
  }
}
```

### 5. Get Blocked Slots

**Request:**
```bash
curl -X GET http://localhost:5000/api/maids/schedule/blocked-slots \
  -H "Authorization: Bearer <token>"
```

---

## ✨ Key Features

### 1. **No Conflicts with Existing Work**
- Extended User model without breaking existing fields
- Created separate routes (under `/api/maids/schedule`)
- Member-2's booking system remains unchanged
- All new endpoints are additive

### 2. **Comprehensive Validation**
- Time format validation (HH:MM in 24-hour)
- Date validation (no past dates)
- Time range validation (start < end)
- Duplicate slot prevention
- Day of week validation (0-6)

### 3. **Integration Ready**
- `getAvailableSlots()` reads from Booking model
- Uses same conflict checking logic
- Respects both weekly schedule AND blocked slots
- Public endpoint for customers to check availability

### 4. **User-Friendly UI**
- Simple toggle for availability
- Time pickers for easy scheduling
- Quick block slot creation
- View and manage blocked slots
- Visual feedback (success/error messages)

---

## 📁 Files Created/Modified

### Created:
✅ `server/controllers/maidScheduleController.js` - 6 controller functions
✅ `server/routes/maidScheduleRoutes.js` - 6 API endpoints
✅ `client/src/components/maid/MaidSchedule.js` - Schedule management UI
✅ `client/src/components/maid/BlockSlot.js` - Block slot creation UI

### Modified:
✅ `server/models/User.js` - Extended maidProfile with scheduling fields
✅ `server/server.js` - Registered maidScheduleRoutes
✅ `client/src/App.js` - Added MaidSchedule and BlockSlot routes

---

## 🧪 Testing Checklist

### Backend:
- [ ] Set weekly schedule (all days)
- [ ] Set partial weekly schedule (some days off)
- [ ] Validate time format errors
- [ ] Validate start < end time
- [ ] Block full day slot
- [ ] Block partial time slot
- [ ] Get available slots (with weekly schedule)
- [ ] Get available slots (with booked slots)
- [ ] Get available slots (with blocked slots)
- [ ] Get available slots (maid not available on day)
- [ ] Unblock a slot

### Frontend:
- [ ] Load and display weekly schedule
- [ ] Toggle day availability
- [ ] Change start/end times
- [ ] Save schedule with validation
- [ ] View blocked slots
- [ ] Block full day
- [ ] Block partial time
- [ ] Remove blocked slot
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### Integration:
- [ ] Book service → Check available slots
- [ ] Customer sees maid's availability
- [ ] Booked slots not in available list
- [ ] Blocked slots not in available list
- [ ] Schedule change affects future bookings

---

## 🔐 Security Considerations

1. **Authentication:** All endpoints require JWT token (via `protect` middleware)
2. **Authorization:** Scheduling endpoints only work for maid's own schedule
3. **Input Validation:** All fields validated before processing
4. **Date Security:** Past dates cannot be blocked
5. **Data Isolation:** Maid can only modify their own schedule

---

## 🎯 Next Steps for Team

### For Member-4 (Search & Filters):
- Use availability data to filter searchable maids
- Show maid's working hours in search results
- Allow filtering by "available on date X"

### For Member-1 (Service Categories):
- Can optionally associate skills to service categories
- Category pricing already integrated with bookings

### For Member-2 (Booking):
- Already fully integrated
- `getAvailableSlots()` now returns complete availability picture

---

## 📞 Support

**Author:** Member-3 (Module 2)  
**Feature:** Maid Scheduling & Availability  
**Module:** Module 2 - Booking, Scheduling & Search  
**Status:** ✅ Complete and Ready for Testing

---

**Last Updated:** December 11, 2025
