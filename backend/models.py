import uuid
from datetime import datetime, timedelta
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Float
)
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class School(Base):
    __tablename__ = "schools"

    id = Column(String, primary_key=True, index=True) # e.g. "school-a", "school-b", "school-c"
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    admin_email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    address = Column(String, default="")
    phone = Column(String, default="")
    logo_color = Column(String, default="teal")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resources = relationship("Resource", back_populates="owning_school", cascade="all, delete-orphan")
    students = relationship("Profile", back_populates="school")
    restrictions = relationship("SchoolRestriction", back_populates="school", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # "student", "school_admin", "super_admin"
    school_id = Column(String, ForeignKey("schools.id"), nullable=True)
    grade = Column(String, default="Class 10")
    age = Column(Integer, default=16)
    phone = Column(String, default="")
    
    # Student Verification
    verification_status = Column(String, default="Pending") # "Pending", "Verified", "Rejected", "Additional Info Required"
    verification_notes = Column(String, default="")
    document_type = Column(String, default="School ID Card") # "School ID Card", "Admission Receipt"
    document_url = Column(Text, default="")
    verified_by_school_id = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    school = relationship("School", back_populates="students")
    bookings = relationship("Booking", back_populates="student", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True) 
    # "Books", "Computers and laptops", "Study spaces", "Science laboratory equipment", "Educational tools and devices"
    description = Column(Text, default="")
    owning_school_id = Column(String, ForeignKey("schools.id"), nullable=False, index=True)
    image_url = Column(Text, default="")
    
    # Metadata for rich filtering & AI
    author = Column(String, default="")
    subject = Column(String, default="")
    genre = Column(String, default="")
    
    total_quantity = Column(Integer, default=1)
    available_quantity = Column(Integer, default=1)
    location_room = Column(String, default="Main Facility")
    usage_rules = Column(Text, default="Standard 7-day borrowing. Treat with respect.")
    eligibility_requirements = Column(Text, default="Verified student of any partner school.")
    status = Column(String, default="Available") # "Available", "Under Maintenance", "Fully Booked"

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owning_school = relationship("School", back_populates="resources")
    booking_items = relationship("BookingItem", back_populates="resource", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_items = Column(Integer, default=1)
    notes = Column(Text, default="")

    # Relationships
    student = relationship("Profile", back_populates="bookings")
    items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")


class BookingItem(Base):
    __tablename__ = "booking_items"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False, index=True)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False, index=True)
    owning_school_id = Column(String, ForeignKey("schools.id"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    
    # Status Pipeline: Requested -> Approved -> Ready for Collection -> Collected -> Returned
    # Also: Rejected, Cancelled, Overdue, Condition Reported
    status = Column(String, default="Requested", index=True)
    
    start_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))
    collection_date = Column(DateTime, nullable=True)
    return_date = Column(DateTime, nullable=True)

    # QR Handover Security Token
    qr_token = Column(String, unique=True, index=True, default=generate_uuid)
    qr_action = Column(String, default="COLLECTION") # "COLLECTION", "RETURN", "EXPIRED", "USED"
    qr_expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=3))
    
    # Decisions & Conditions
    rejection_reason = Column(Text, nullable=True)
    pre_collection_condition = Column(String, default="Good") # Recorded by staff before handover
    post_return_condition = Column(String, nullable=True) # Recorded by staff upon return
    damage_notes = Column(Text, nullable=True)
    missing_parts = Column(Text, nullable=True)
    staff_remarks = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="items")
    resource = relationship("Resource", back_populates="booking_items")
    condition_reports = relationship("ConditionReport", back_populates="booking_item", cascade="all, delete-orphan")


class ConditionReport(Base):
    __tablename__ = "condition_reports"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    booking_item_id = Column(String, ForeignKey("booking_items.id"), nullable=False)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    school_id = Column(String, ForeignKey("schools.id"), nullable=False)
    stage = Column(String, nullable=False) # "Pre-Collection" or "Post-Return"
    condition_rating = Column(String, default="Good") # "Excellent", "Good", "Fair", "Damaged", "Missing Parts"
    damage_details = Column(Text, default="")
    missing_items = Column(Text, default="")
    inspector_name = Column(String, default="School Resource Coordinator")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking_item = relationship("BookingItem", back_populates="condition_reports")


class SchoolRestriction(Base):
    __tablename__ = "school_restrictions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    school_id = Column(String, ForeignKey("schools.id"), nullable=False)
    restricted_category = Column(String, default="All")
    min_grade = Column(String, default="")
    require_faculty_approval = Column(Boolean, default=False)
    rule_description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    school = relationship("School", back_populates="restrictions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=True, index=True)
    school_id = Column(String, nullable=True, index=True) # For school-level staff notifications
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="general") # "booking_status", "verification", "overdue", "collection", "return"
    is_read = Column(Boolean, default=False)
    link = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    recipient = relationship("Profile", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    action = Column(String, nullable=False)
    actor_id = Column(String, nullable=False)
    actor_type = Column(String, default="staff") # "staff", "student", "system"
    target_type = Column(String, default="")
    target_id = Column(String, default="")
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)
