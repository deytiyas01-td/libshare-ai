from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class LoginRequest(BaseModel):
    email_or_school: str
    password: str
    portal_type: str # "school" or "student"
    school_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class RegisterStudentRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str
    age: int
    school_name: str
    school_id: Optional[str] = None
    grade: str
    document_type: str = "School ID Card"
    document_url: Optional[str] = ""

class StudentVerificationUpdate(BaseModel):
    verification_status: str # "Pending", "Verified", "Rejected", "Additional Info Required"
    verification_notes: Optional[str] = ""

# School Schemas
class SchoolResponse(BaseModel):
    id: str
    name: str
    code: str
    admin_email: str
    address: str
    phone: str
    logo_color: str
    is_active: bool

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceCreate(BaseModel):
    title: str
    category: str
    description: str
    image_url: Optional[str] = ""
    author: Optional[str] = ""
    subject: Optional[str] = ""
    genre: Optional[str] = ""
    total_quantity: int = 1
    available_quantity: int = 1
    location_room: Optional[str] = "Main Facility"
    usage_rules: Optional[str] = "Standard 7-day borrowing. Return in original condition."
    eligibility_requirements: Optional[str] = "Verified student ID required."

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    genre: Optional[str] = None
    total_quantity: Optional[int] = None
    available_quantity: Optional[int] = None
    location_room: Optional[str] = None
    usage_rules: Optional[str] = None
    eligibility_requirements: Optional[str] = None
    status: Optional[str] = None

class ResourceResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    owning_school_id: str
    owning_school_name: Optional[str] = None
    image_url: str
    author: str
    subject: str
    genre: str
    total_quantity: int
    available_quantity: int
    location_room: str
    usage_rules: str
    eligibility_requirements: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Booking Schemas
class BookingItemCart(BaseModel):
    resource_id: str
    days_requested: int = 7

class BookingCreateRequest(BaseModel):
    items: List[BookingItemCart]
    notes: Optional[str] = ""

class BookingDecisionRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    rejection_reason: Optional[str] = None

class HandoverConfirmRequest(BaseModel):
    qr_token: str
    condition_rating: str = "Good"
    pre_condition_notes: Optional[str] = ""

class ReturnConfirmRequest(BaseModel):
    qr_token: str
    condition_rating: str = "Good" # "Good", "Fair", "Damaged", "Missing Parts"
    damage_notes: Optional[str] = ""
    missing_parts: Optional[str] = ""
    staff_remarks: Optional[str] = ""

class BookingItemResponse(BaseModel):
    id: str
    booking_id: str
    resource_id: str
    resource_title: str
    resource_category: str
    resource_image: str
    owning_school_id: str
    owning_school_name: str
    student_id: str
    student_name: str
    student_email: str
    student_school: str
    student_grade: str
    status: str
    start_date: datetime
    due_date: datetime
    collection_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    qr_token: str
    qr_action: str
    rejection_reason: Optional[str] = None
    pre_collection_condition: Optional[str] = None
    post_return_condition: Optional[str] = None
    damage_notes: Optional[str] = None
    missing_parts: Optional[str] = None
    created_at: datetime

# Restriction Schema
class SchoolRestrictionCreate(BaseModel):
    restricted_category: str = "All"
    min_grade: Optional[str] = ""
    require_faculty_approval: bool = False
    rule_description: str

class SchoolRestrictionResponse(BaseModel):
    id: str
    school_id: str
    restricted_category: str
    min_grade: str
    require_faculty_approval: bool
    rule_description: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schema
class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[str]
    school_id: Optional[str]
    title: str
    message: str
    type: str
    is_read: bool
    link: str
    created_at: datetime

    class Config:
        from_attributes = True
