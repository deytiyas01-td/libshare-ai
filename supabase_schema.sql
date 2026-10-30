-- ========================================================
-- LIBSHARE AI — SUPABASE POSTGRESQL DATABASE SCHEMA
-- CodeVerse India National-Level Hackathon
-- Problem Statement: Unlock Underused Equipment and Spaces
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR PRIMARY KEY, -- e.g. 'school-a', 'school-b', 'school-c'
    name VARCHAR NOT NULL,
    code VARCHAR UNIQUE NOT NULL,
    admin_email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    address TEXT DEFAULT '',
    phone VARCHAR DEFAULT '',
    logo_color VARCHAR DEFAULT 'teal',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES (Students & Staff)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'student', -- 'student', 'school_admin'
    school_id VARCHAR REFERENCES schools(id) ON DELETE SET NULL,
    grade VARCHAR DEFAULT 'Class 10',
    age INTEGER DEFAULT 16,
    phone VARCHAR DEFAULT '',
    verification_status VARCHAR DEFAULT 'Pending', -- 'Pending', 'Verified', 'Rejected', 'Additional Info Required'
    verification_notes TEXT DEFAULT '',
    document_type VARCHAR DEFAULT 'School ID Card',
    document_url TEXT DEFAULT '',
    verified_by_school_id VARCHAR REFERENCES schools(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RESOURCES (Equipments, Spaces, Books, Computing Devices)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    category VARCHAR NOT NULL, -- 'Books', 'Computers and laptops', 'Study spaces', 'Science laboratory equipment', 'Educational tools and devices'
    description TEXT DEFAULT '',
    owning_school_id VARCHAR NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    image_url TEXT DEFAULT '',
    author VARCHAR DEFAULT '',
    subject VARCHAR DEFAULT '',
    genre VARCHAR DEFAULT '',
    total_quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    location_room VARCHAR DEFAULT 'Main Facility',
    usage_rules TEXT DEFAULT 'Standard 7-day borrowing. Return in original condition.',
    eligibility_requirements TEXT DEFAULT 'Verified student of any partner school.',
    status VARCHAR DEFAULT 'Available', -- 'Available', 'Under Maintenance', 'Fully Booked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BOOKINGS (Root Booking Session)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_items INTEGER DEFAULT 1,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BOOKING ITEMS (Partitioned Per Owning School)
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    owning_school_id VARCHAR NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'Requested', -- 'Requested', 'Approved', 'Ready for Collection', 'Collected', 'Returned', 'Rejected', 'Cancelled', 'Overdue'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    collection_date TIMESTAMP WITH TIME ZONE,
    return_date TIMESTAMP WITH TIME ZONE,
    qr_token VARCHAR UNIQUE NOT NULL,
    qr_action VARCHAR DEFAULT 'COLLECTION', -- 'COLLECTION', 'RETURN', 'EXPIRED', 'USED'
    qr_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 days'),
    rejection_reason TEXT,
    pre_collection_condition VARCHAR DEFAULT 'Good',
    post_return_condition VARCHAR,
    damage_notes TEXT,
    missing_parts TEXT,
    staff_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONDITION REPORTS
CREATE TABLE IF NOT EXISTS condition_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    school_id VARCHAR NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    stage VARCHAR NOT NULL, -- 'Pre-Collection', 'Post-Return'
    condition_rating VARCHAR DEFAULT 'Good', -- 'Excellent', 'Good', 'Fair', 'Damaged', 'Missing Parts'
    damage_details TEXT DEFAULT '',
    missing_items TEXT DEFAULT '',
    inspector_name VARCHAR DEFAULT 'School Resource Coordinator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SCHOOL RESTRICTIONS (Institutional Policies)
CREATE TABLE IF NOT EXISTS school_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id VARCHAR NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    restricted_category VARCHAR DEFAULT 'All',
    min_grade VARCHAR DEFAULT '',
    require_faculty_approval BOOLEAN DEFAULT FALSE,
    rule_description VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    school_id VARCHAR REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR NOT NULL,
    actor_id VARCHAR NOT NULL,
    actor_type VARCHAR DEFAULT 'staff',
    target_type VARCHAR DEFAULT '',
    target_id VARCHAR DEFAULT '',
    details TEXT DEFAULT '',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_school ON resources(owning_school_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_booking_items_school ON booking_items(owning_school_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_student ON booking_items(student_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_qr ON booking_items(qr_token);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_school ON notifications(school_id);
