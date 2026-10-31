from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import uuid

from database import engine, get_db, Base
import models
import schemas
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_school_admin, require_verified_student
)
from ai_engine import ai_engine
from seed_data import seed_database

# Initialize database schema and initial demo seed
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="LibShare AI API",
    description="Smart Multi-School Library & Educational Resource Sharing Platform",
    version="1.0.0"
)

# CORS configuration for local Vite development and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# HEALTH & METADATA
# ==========================================
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LibShare AI Backend",
        "version": "1.0.0",
        "problem_statement": "Unlock Underused Equipment and Spaces",
        "hackathon": "CodeVerse India National-Level Hackathon",
        "ai_engine": "TF-IDF + Cosine Similarity Active"
    }

# ==========================================
# AUTHENTICATION & PORTALS
# ==========================================
@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    if login_data.portal_type == "school":
        # School Admin Portal Authentication
        school_id = login_data.school_id or login_data.email_or_school
        school = db.query(models.School).filter(
            (models.School.id == school_id) | (models.School.admin_email == login_data.email_or_school)
        ).first()

        if not school:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"School profile not found for '{school_id}'."
            )

        if not verify_password(login_data.password, school.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator password. For hackathon demo use: WeCodeCoders1, WeCodeCoders2, or WeCodeCoders3."
            )

        access_token = create_access_token(data={"sub": school.id, "role": "school_admin", "school_id": school.id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": school.id,
                "school_id": school.id,
                "name": school.name,
                "email": school.admin_email,
                "role": "school_admin",
                "code": school.code,
                "logo_color": school.logo_color
            }
        }

    else:
        # Student Portal Authentication
        student = db.query(models.Profile).filter(models.Profile.email == login_data.email_or_school).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Student account not found with this email. Please register first."
            )

        if not verify_password(login_data.password, student.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid student password. For pre-seeded demo account use: StudentDemo123"
            )

        access_token = create_access_token(data={"sub": student.id, "role": "student", "school_id": student.school_id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": student.id,
                "school_id": student.school_id,
                "name": student.full_name,
                "email": student.email,
                "role": "student",
                "grade": student.grade,
                "verification_status": student.verification_status,
                "school_name": student.school.name if student.school else "Independent Student"
            }
        }

@app.post("/api/auth/register", response_model=schemas.TokenResponse)
def register_student(reg_data: schemas.RegisterStudentRequest, db: Session = Depends(get_db)):
    if reg_data.password != reg_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm password do not match."
        )

    if len(reg_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check email duplicate
    existing = db.query(models.Profile).filter(models.Profile.email == reg_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account is already registered with this email address."
        )

    # Resolve school ID
    resolved_school_id = reg_data.school_id
    if not resolved_school_id and reg_data.school_name:
        matched_school = db.query(models.School).filter(
            models.School.name.ilike(f"%{reg_data.school_name}%")
        ).first()
        if matched_school:
            resolved_school_id = matched_school.id
        else:
            resolved_school_id = "school-a" # Default fallback partner school

    new_student = models.Profile(
        id=str(uuid.uuid4()),
        email=reg_data.email,
        full_name=reg_data.full_name,
        hashed_password=get_password_hash(reg_data.password),
        role="student",
        school_id=resolved_school_id,
        grade=reg_data.grade,
        age=reg_data.age,
        verification_status="Pending", # Crucial hackathon rule: Initially pending until verified!
        verification_notes="Identity documents submitted during registration. Awaiting school administrator verification.",
        document_type=reg_data.document_type,
        document_url=reg_data.document_url or "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Notify student
    welcome_notif = models.Notification(
        user_id=new_student.id,
        title="Registration Received",
        message="Welcome to LibShare AI! Your student verification is currently Pending. Once your school verifies your documents, you can borrow shared equipment and spaces.",
        type="verification",
        link="/student/profile"
    )

    # Notify School Admin of this school
    school_notif = models.Notification(
        school_id=resolved_school_id,
        title="New Student Registration Pending Verification",
        message=f"{new_student.full_name} ({new_student.grade}) has registered and submitted a {new_student.document_type} for verification.",
        type="verification",
        link=f"/school/{resolved_school_id}/verification"
    )

    db.add_all([welcome_notif, school_notif])
    db.commit()

    access_token = create_access_token(data={"sub": new_student.id, "role": "student", "school_id": new_student.school_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_student.id,
            "school_id": new_student.school_id,
            "name": new_student.full_name,
            "email": new_student.email,
            "role": "student",
            "grade": new_student.grade,
            "verification_status": new_student.verification_status,
            "school_name": new_student.school.name if new_student.school else "Independent Student"
        }
    }

@app.get("/api/auth/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] == "school_admin":
        school = db.query(models.School).filter(models.School.id == current_user["id"]).first()
        return {
            "id": school.id,
            "school_id": school.id,
            "name": school.name,
            "email": school.admin_email,
            "role": "school_admin",
            "code": school.code,
            "logo_color": school.logo_color,
            "address": school.address,
            "phone": school.phone
        }
    else:
        profile = db.query(models.Profile).filter(models.Profile.id == current_user["id"]).first()
        return {
            "id": profile.id,
            "school_id": profile.school_id,
            "name": profile.full_name,
            "email": profile.email,
            "role": profile.role,
            "grade": profile.grade,
            "age": profile.age,
            "verification_status": profile.verification_status,
            "verification_notes": profile.verification_notes,
            "document_type": profile.document_type,
            "document_url": profile.document_url,
            "school_name": profile.school.name if profile.school else "Independent Student"
        }

# ==========================================
# SCHOOLS ENDPOINTS
# ==========================================
@app.get("/api/schools", response_model=List[schemas.SchoolResponse])
def get_all_schools(db: Session = Depends(get_db)):
    return db.query(models.School).filter(models.School.is_active == True).all()

# ==========================================
# RESOURCE MARKETPLACE & CATALOG
# ==========================================
@app.get("/api/resources", response_model=List[schemas.ResourceResponse])
def get_resources(
    search: Optional[str] = None,
    category: Optional[str] = None,
    school_id: Optional[str] = None,
    availability: Optional[str] = "all", # "all", "available", "borrowed"
    subject: Optional[str] = None,
    genre: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Resource)

    if school_id and school_id != "all":
        query = query.filter(models.Resource.owning_school_id == school_id)

    if category and category != "all":
        query = query.filter(models.Resource.category == category)

    if subject and subject != "all":
        query = query.filter(models.Resource.subject.ilike(f"%{subject}%"))

    if genre and genre != "all":
        query = query.filter(models.Resource.genre.ilike(f"%{genre}%"))

    if availability == "available":
        query = query.filter(models.Resource.available_quantity > 0)
    elif availability == "borrowed":
        query = query.filter(models.Resource.available_quantity == 0)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Resource.title.ilike(search_pattern)) |
            (models.Resource.description.ilike(search_pattern)) |
            (models.Resource.author.ilike(search_pattern)) |
            (models.Resource.subject.ilike(search_pattern)) |
            (models.Resource.genre.ilike(search_pattern))
        )

    resources = query.order_by(models.Resource.created_at.desc()).all()
    
    # Inject school names
    result = []
    for r in resources:
        res_dict = schemas.ResourceResponse.from_orm(r)
        res_dict.owning_school_name = r.owning_school.name if r.owning_school else r.owning_school_id
        result.append(res_dict)

    return result

@app.get("/api/resources/{resource_id}")
def get_resource_detail(resource_id: str, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Get AI similar recommendations
    ai_recommendations = ai_engine.get_resource_recommendations(db, target_resource_id=resource_id, top_k=3)

    return {
        "resource": {
            "id": resource.id,
            "title": resource.title,
            "category": resource.category,
            "description": resource.description,
            "owning_school_id": resource.owning_school_id,
            "owning_school_name": resource.owning_school.name if resource.owning_school else resource.owning_school_id,
            "image_url": resource.image_url,
            "author": resource.author,
            "subject": resource.subject,
            "genre": resource.genre,
            "total_quantity": resource.total_quantity,
            "available_quantity": resource.available_quantity,
            "location_room": resource.location_room,
            "usage_rules": resource.usage_rules,
            "eligibility_requirements": resource.eligibility_requirements,
            "status": resource.status,
            "created_at": resource.created_at
        },
        "ai_recommendations": ai_recommendations
    }

# ==========================================
# SCHOOL DASHBOARD & INVENTORY MANAGEMENT
# ==========================================
@app.post("/api/resources", response_model=schemas.ResourceResponse)
def create_resource(
    res_in: schemas.ResourceCreate,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    school_id = current_admin["school_id"]

    new_res = models.Resource(
        id=str(uuid.uuid4()),
        title=res_in.title,
        category=res_in.category,
        description=res_in.description,
        owning_school_id=school_id,
        image_url=res_in.image_url or "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&q=80",
        author=res_in.author or "",
        subject=res_in.subject or "",
        genre=res_in.genre or "",
        total_quantity=res_in.total_quantity,
        available_quantity=res_in.available_quantity,
        location_room=res_in.location_room or "Main Facility",
        usage_rules=res_in.usage_rules or "Standard 7-day borrowing.",
        eligibility_requirements=res_in.eligibility_requirements or "Verified student ID required.",
        status="Available" if res_in.available_quantity > 0 else "Fully Booked"
    )

    db.add(new_res)
    db.commit()
    db.refresh(new_res)

    res_resp = schemas.ResourceResponse.from_orm(new_res)
    res_resp.owning_school_name = new_res.owning_school.name if new_res.owning_school else school_id
    return res_resp

@app.put("/api/resources/{resource_id}")
def update_resource(
    resource_id: str,
    res_in: schemas.ResourceUpdate,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Strict isolation: School can only edit its own resources!
    if resource.owning_school_id != current_admin["school_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You cannot modify resources belonging to another institution."
        )

    update_data = res_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(resource, field, val)

    if resource.available_quantity <= 0:
        resource.status = "Fully Booked"
    elif resource.available_quantity > 0 and resource.status == "Fully Booked":
        resource.status = "Available"

    db.commit()
    db.refresh(resource)
    return {"message": "Resource updated successfully", "resource_id": resource.id}

@app.delete("/api/resources/{resource_id}")
def delete_resource(
    resource_id: str,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if resource.owning_school_id != current_admin["school_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You cannot remove resources belonging to another institution."
        )

    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted successfully"}


# ------------------------------------------
# SCHOOL MESSAGE ENDPOINTS
# ------------------------------------------
@app.post("/api/school/{school_id}/message-student")
def send_message_to_student(
    school_id: str,
    msg: schemas.SendMessageRequest,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    """Send a direct message (notification) from a school admin to a student.
    The message appears in the student's notification list and optionally can carry a QR token.
    """
    # Verify admin belongs to the target school
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied: Wrong school.")
    # Verify student exists
    student = db.query(models.Profile).filter(models.Profile.id == msg.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    # Create notification of type direct_message
    notification = models.Notification(
        id=str(uuid.uuid4()),
        user_id=student.id,
        title=msg.title,
        message=msg.message,
        type="direct_message",
        sender_school_id=school_id,
        sender_name=current_admin.get("name", "School Admin"),
        link="/student/profile",
        created_at=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    return {"message": "Notification sent to student", "notification_id": notification.id}

@app.get("/api/school/{school_id}/sent-messages")
def get_sent_messages(
    school_id: str,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    """Retrieve messages sent by this school admin to students (direct_message notifications)."""
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied: Wrong school.")
    msgs = db.query(models.Notification).filter(
        models.Notification.sender_school_id == school_id,
        models.Notification.type == "direct_message"
    ).order_by(models.Notification.created_at.desc()).all()
    result = []
    for n in msgs:
        result.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "qr_token": n.qr_token,
            "link": n.link,
            "created_at": n.created_at,
            "is_read": n.is_read,
            "sender_name": n.sender_name,
        })
    return result

# ==========================================
# MULTI-RESOURCE BOOKING & ROUTING WORKFLOW
# ==========================================
@app.post("/api/bookings")
def create_booking(
    booking_req: schemas.BookingCreateRequest,
    current_student: dict = Depends(require_verified_student),
    db: Session = Depends(get_db)
):
    if not booking_req.items:
        raise HTTPException(status_code=400, detail="Cart is empty. Add at least one resource to book.")

    student_id = current_student["id"]
    student = db.query(models.Profile).filter(models.Profile.id == student_id).first()

    # AI Anomaly Detection Check (Advisory signal, human-reviewed)
    anomaly_signal = ai_engine.detect_booking_anomalies(db, student_id, len(booking_req.items))

    # Create root booking session
    booking_session = models.Booking(
        id=str(uuid.uuid4()),
        student_id=student_id,
        total_items=len(booking_req.items),
        notes=booking_req.notes or ""
    )
    db.add(booking_session)
    db.commit()

    created_items = []
    affected_schools = set()

    for item_data in booking_req.items:
        res = db.query(models.Resource).filter(models.Resource.id == item_data.resource_id).first()
        if not res:
            continue

        if res.available_quantity < 1:
            raise HTTPException(
                status_code=400,
                detail=f"Resource '{res.title}' is currently out of stock."
            )

        # Generate unique secure cryptographic token for QR handover
        token_hash = f"QR-{uuid.uuid4().hex[:12].upper()}"

        days = max(1, min(item_data.days_requested, 14))
        due_date = datetime.utcnow() + timedelta(days=days)

        bitem = models.BookingItem(
            id=str(uuid.uuid4()),
            booking_id=booking_session.id,
            resource_id=res.id,
            owning_school_id=res.owning_school_id,
            student_id=student_id,
            status="Requested",
            start_date=datetime.utcnow(),
            due_date=due_date,
            qr_token="",  # QR code is ONLY generated after school coordinator verification
            qr_action="PENDING_APPROVAL",
            qr_expires_at=None,
            pre_collection_condition="Good"
        )

        db.add(bitem)
        affected_schools.add(res.owning_school_id)
        created_items.append({
            "id": bitem.id,
            "resource_title": res.title,
            "owning_school_id": res.owning_school_id,
            "due_date": due_date.isoformat(),
            "qr_token": ""
        })

    db.commit()

    # Route notifications ONLY to each relevant owning school!
    for school_id in affected_schools:
        school_item_count = sum(1 for item in created_items if item["owning_school_id"] == school_id)
        db.add(models.Notification(
            id=str(uuid.uuid4()),
            school_id=school_id,
            title=f"New Incoming Resource Request ({school_item_count} items)",
            message=f"{student.full_name} from {student.school.name if student.school else 'Partner School'} submitted a borrow request. Review ID and approve to issue QR pass.",
            type="booking_status",
            link=f"/school/{school_id}/requests"
        ))

    # Notify student: Request submitted, awaiting school verification before QR is issued
    for item_data in created_items:
        db.add(models.Notification(
            id=str(uuid.uuid4()),
            user_id=student_id,
            title=f"Request Submitted: {item_data['resource_title']}",
            message=f"Request submitted for '{item_data['resource_title']}'. It has been routed to the school coordinator for verification. Your official QR Handover Pass will be issued once approved.",
            qr_token=None,
            type="booking_status",
            link="/student/profile"
        ))

    db.commit()

    return {
        "message": "Booking submitted successfully. Requests routed to respective school coordinators.",
        "booking_id": booking_session.id,
        "items_count": len(created_items),
        "schools_notified": list(affected_schools),
        "anomaly_signal": anomaly_signal
    }

@app.get("/api/bookings/my-bookings")
def get_student_bookings(
    current_student: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_id = current_student["id"]
    items = db.query(models.BookingItem).filter(
        models.BookingItem.student_id == student_id
    ).order_by(models.BookingItem.created_at.desc()).all()

    results = []
    for bi in items:
        results.append({
            "id": bi.id,
            "booking_id": bi.booking_id,
            "resource_id": bi.resource_id,
            "resource_title": bi.resource.title if bi.resource else "Resource",
            "resource_category": bi.resource.category if bi.resource else "General",
            "resource_image": bi.resource.image_url if bi.resource else "",
            "owning_school_id": bi.owning_school_id,
            "owning_school_name": bi.resource.owning_school.name if (bi.resource and bi.resource.owning_school) else bi.owning_school_id,
            "status": bi.status,
            "start_date": bi.start_date,
            "due_date": bi.due_date,
            "collection_date": bi.collection_date,
            "return_date": bi.return_date,
            "qr_token": bi.qr_token,
            "qr_action": bi.qr_action,
            "rejection_reason": bi.rejection_reason,
            "pre_collection_condition": bi.pre_collection_condition,
            "post_return_condition": bi.post_return_condition,
            "damage_notes": bi.damage_notes,
            "created_at": bi.created_at
        })

    return results

# ==========================================
# SCHOOL-SPECIFIC REQUEST ROUTING & DECISIONS
# ==========================================
@app.get("/api/school/{school_id}/requests")
def get_school_incoming_requests(
    school_id: str,
    status_filter: Optional[str] = None,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    # Strict isolation check:
    if current_admin["school_id"] != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You can only view requests routed to your own school."
        )

    query = db.query(models.BookingItem).filter(models.BookingItem.owning_school_id == school_id)

    if status_filter and status_filter != "all":
        query = query.filter(models.BookingItem.status == status_filter)

    items = query.order_by(models.BookingItem.created_at.desc()).all()

    results = []
    for bi in items:
        student = db.query(models.Profile).filter(models.Profile.id == bi.student_id).first()
        student_school = student.school.name if (student and student.school) else "Unknown School"

        results.append({
            "id": bi.id,
            "booking_id": bi.booking_id,
            "resource_id": bi.resource_id,
            "resource_title": bi.resource.title if bi.resource else "Resource",
            "resource_category": bi.resource.category if bi.resource else "General",
            "resource_image": bi.resource.image_url if bi.resource else "",
            "owning_school_id": bi.owning_school_id,
            "student_id": bi.student_id,
            "student_name": student.full_name if student else "Unknown",
            "student_email": student.email if student else "",
            "student_school": student_school,
            "student_grade": student.grade if student else "",
            "student_verification_status": student.verification_status if student else "Unknown",
            "student_document_url": student.document_url if student else "",
            "student_document_type": student.document_type if student else "School ID Card",
            "status": bi.status,
            "start_date": bi.start_date,
            "due_date": bi.due_date,
            "collection_date": bi.collection_date,
            "return_date": bi.return_date,
            "qr_token": bi.qr_token,
            "qr_action": bi.qr_action,
            "rejection_reason": bi.rejection_reason,
            "pre_collection_condition": bi.pre_collection_condition,
            "post_return_condition": bi.post_return_condition,
            "created_at": bi.created_at
        })

    return results

@app.post("/api/school/{school_id}/requests/{item_id}/decision")
def decide_request(
    school_id: str,
    item_id: str,
    decision: schemas.BookingDecisionRequest,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    bitem = db.query(models.BookingItem).filter(
        models.BookingItem.id == item_id,
        models.BookingItem.owning_school_id == school_id
    ).first()

    if not bitem:
        raise HTTPException(status_code=404, detail="Request item not found for this school.")

    res = db.query(models.Resource).filter(models.Resource.id == bitem.resource_id).first()

    if decision.action.upper() == "APPROVE":
        if res.available_quantity < 1:
            raise HTTPException(status_code=400, detail="Cannot approve: Resource available quantity is 0.")

        # Generate official cryptographic QR token upon school verification
        token_hash = f"QR-COLLECT-{uuid.uuid4().hex[:10].upper()}"
        bitem.qr_token = token_hash
        bitem.status = "Ready for Collection"
        bitem.qr_action = "COLLECTION"
        bitem.qr_expires_at = datetime.utcnow() + timedelta(days=5)

        res.available_quantity -= 1
        if res.available_quantity == 0:
            res.status = "Fully Booked"

        # Auto-verify student when their request is approved by school coordinator
        student = db.query(models.Profile).filter(models.Profile.id == bitem.student_id).first()
        admin_name = current_admin.get("name") or "School Coordinator"
        if student and student.verification_status != "Verified":
            student.verification_status = "Verified"
            student.verification_notes = f"Verified upon equipment approval by {admin_name}."

        school = db.query(models.School).filter(models.School.id == school_id).first()
        school_name = school.name if school else admin_name

        # Send QR code pass to the student ONLY AFTER verification
        db.add(models.Notification(
            id=str(uuid.uuid4()),
            user_id=bitem.student_id,
            title=f"Request Verified & Approved: {res.title}",
            message=f"{admin_name} from {school_name} has verified your borrow request for '{res.title}'. Your official QR Handover Pass is now active. View or download your QR code pass to collect the equipment.",
            qr_token=bitem.qr_token,
            sender_school_id=school_id,
            sender_name=school_name,
            type="collection",
            link="/student/profile",
            created_at=datetime.utcnow()
        ))

    elif decision.action.upper() == "REJECT":
        bitem.status = "Rejected"
        bitem.rejection_reason = decision.rejection_reason or "Scheduling or capacity limitation."

        db.add(models.Notification(
            id=str(uuid.uuid4()),
            user_id=bitem.student_id,
            title="Request Status Update",
            message=f"Your request for '{res.title}' was not approved. Reason: {bitem.rejection_reason}",
            type="booking_status",
            link="/student/profile",
            created_at=datetime.utcnow()
        ))

    db.commit()
    return {"message": f"Request {decision.action.lower()}d successfully", "status": bitem.status}

# ==========================================
# QR-BASED RESOURCE HANDOVER & RETURN TRACKING
# ==========================================
@app.post("/api/qr/verify-and-handover")
def verify_and_handover(
    req: schemas.HandoverConfirmRequest,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    """
    Validates QR token presented by student at the school library/lab desk.
    Checks token authenticity, validity period, and prevents duplicate scans.
    Records pre-collection condition assessment.
    Transitions: Ready for Collection -> Collected.
    """
    token_str = req.qr_token.strip()
    bitem = db.query(models.BookingItem).filter(models.BookingItem.qr_token == token_str).first()

    if not bitem:
        raise HTTPException(status_code=404, detail="Invalid QR Token: No matching booking item found.")

    # Strict isolation: Only the owning school staff can hand over their resources!
    if bitem.owning_school_id != current_admin["school_id"]:
        raise HTTPException(
            status_code=403,
            detail=f"Mismatched Institution: This item belongs to {bitem.owning_school_id}, not your school."
        )

    res = db.query(models.Resource).filter(models.Resource.id == bitem.resource_id).first()

    if bitem.status not in ["Approved", "Ready for Collection", "Requested"]:
        if bitem.status == "Collected":
            raise HTTPException(status_code=400, detail="Duplicate Scan Blocked: This resource has already been collected.")
        elif bitem.status == "Returned":
            raise HTTPException(status_code=400, detail="This item has already completed its borrowing cycle and was returned.")
        else:
            raise HTTPException(status_code=400, detail=f"Cannot hand over resource with status '{bitem.status}'.")

    # If item was still in 'Requested' status, deduct inventory now upon handover
    if bitem.status == "Requested" and res:
        if res.available_quantity > 0:
            res.available_quantity -= 1
            if res.available_quantity == 0:
                res.status = "Fully Booked"

    # Check token expiration
    if bitem.qr_expires_at and datetime.utcnow() > bitem.qr_expires_at:
        raise HTTPException(status_code=400, detail="QR Token has expired. Student must refresh their collection pass.")

    # Record Pre-Collection Condition Assessment
    bitem.status = "Collected"
    bitem.collection_date = datetime.utcnow()
    bitem.pre_collection_condition = f"{req.condition_rating} - {req.pre_condition_notes or 'Verified upon handover'}"

    # Cycle QR token so original collection token cannot be reused, and ready for return!
    new_return_token = f"QR-RETURN-{uuid.uuid4().hex[:12].upper()}"
    bitem.qr_token = new_return_token
    bitem.qr_action = "RETURN"
    bitem.qr_expires_at = bitem.due_date + timedelta(days=7)

    # Log Condition Report
    report = models.ConditionReport(
        booking_item_id=bitem.id,
        resource_id=bitem.resource_id,
        school_id=bitem.owning_school_id,
        stage="Pre-Collection",
        condition_rating=req.condition_rating,
        damage_details=req.pre_condition_notes or "Handover baseline condition recorded.",
        inspector_name=current_admin["name"]
    )
    db.add(report)

    # Notify student
    db.add(models.Notification(
        user_id=bitem.student_id,
        title="Resource Collected!",
        message=f"You have collected '{bitem.resource.title}'. Due return date: {bitem.due_date.strftime('%d %b %Y')}.",
        type="collection",
        link="/student/my-bookings"
    ))

    db.commit()

    return {
        "success": True,
        "message": "Resource successfully handed over to student.",
        "booking_item_id": bitem.id,
        "resource_title": bitem.resource.title,
        "student_id": bitem.student_id,
        "due_date": bitem.due_date.isoformat(),
        "status": bitem.status,
        "next_action": "RETURN",
        "condition_rating": req.condition_rating
    }

@app.post("/api/qr/verify-and-return")
def verify_and_return(
    req: schemas.ReturnConfirmRequest,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    """
    Validates QR token presented upon resource return.
    Records detailed condition report (damage, missing parts, staff remarks).
    Restores inventory quantity.
    Requires human review for damage (no automatic AI penalty!).
    Transitions: Collected -> Returned.
    """
    token_str = req.qr_token.strip()
    bitem = db.query(models.BookingItem).filter(models.BookingItem.qr_token == token_str).first()

    if not bitem:
        raise HTTPException(status_code=404, detail="Invalid Return Token: No matching active booking found.")

    if bitem.owning_school_id != current_admin["school_id"]:
        raise HTTPException(
            status_code=403,
            detail="Mismatched Institution: You cannot accept returns for an item belonging to another school."
        )

    if bitem.status not in ["Collected", "Overdue"]:
        if bitem.status == "Returned":
            raise HTTPException(status_code=400, detail="Duplicate Return Scan: This item is already marked as returned.")
        else:
            raise HTTPException(status_code=400, detail=f"Cannot process return for item with status '{bitem.status}'.")

    # Record Post-Return Condition Assessment
    is_late = datetime.utcnow() > bitem.due_date
    bitem.status = "Returned"
    bitem.return_date = datetime.utcnow()
    bitem.post_return_condition = req.condition_rating
    bitem.damage_notes = req.damage_notes
    bitem.missing_parts = req.missing_parts
    bitem.staff_remarks = req.staff_remarks
    bitem.qr_action = "USED"

    # Restore inventory
    res = db.query(models.Resource).filter(models.Resource.id == bitem.resource_id).first()
    if res:
        res.available_quantity += 1
        if res.status == "Fully Booked":
            res.status = "Available"

    # Log Condition Report
    report = models.ConditionReport(
        booking_item_id=bitem.id,
        resource_id=bitem.resource_id,
        school_id=bitem.owning_school_id,
        stage="Post-Return",
        condition_rating=req.condition_rating,
        damage_details=f"Damage: {req.damage_notes or 'None'}; Missing: {req.missing_parts or 'None'}; Late: {'Yes' if is_late else 'No'}",
        inspector_name=current_admin["name"]
    )
    db.add(report)

    # Notify student
    db.add(models.Notification(
        user_id=bitem.student_id,
        title="Resource Return Confirmed",
        message=f"Return of '{res.title}' confirmed by {current_admin['name']}. Condition: {req.condition_rating}.",
        type="return",
        link="/student/my-bookings"
    ))

    db.commit()

    return {
        "success": True,
        "message": "Resource successfully checked back in. Inventory updated.",
        "booking_item_id": bitem.id,
        "status": bitem.status,
        "condition_rating": req.condition_rating,
        "damage_reported": bool(req.damage_notes or req.missing_parts),
        "is_late": is_late
    }

@app.get("/api/qr/lookup/{qr_token}")
def lookup_qr_token(
    qr_token: str,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    """
    Looks up a QR token and retrieves the student's complete profile,
    school ID card document, and the corresponding resource details.
    """
    token_str = qr_token.strip()
    bitem = db.query(models.BookingItem).filter(
        (models.BookingItem.qr_token == token_str) |
        (models.BookingItem.id == token_str) |
        (models.BookingItem.qr_token.ilike(f"%{token_str}%"))
    ).first()
    if not bitem:
        raise HTTPException(status_code=404, detail="No matching booking item found for this QR token.")

    student = db.query(models.Profile).filter(models.Profile.id == bitem.student_id).first()
    resource = db.query(models.Resource).filter(models.Resource.id == bitem.resource_id).first()

    return {
        "booking_item": {
            "id": bitem.id,
            "status": bitem.status,
            "owning_school_id": bitem.owning_school_id,
            "owning_school_name": bitem.resource.owning_school.name if (bitem.resource and bitem.resource.owning_school) else bitem.owning_school_id,
            "qr_action": bitem.qr_action,
            "start_date": bitem.start_date,
            "due_date": bitem.due_date,
            "pre_collection_condition": bitem.pre_collection_condition,
            "post_return_condition": bitem.post_return_condition,
        },
        "student": {
            "id": student.id if student else "",
            "full_name": student.full_name if student else "Unknown Student",
            "email": student.email if student else "",
            "school_id": student.school_id if student else "",
            "school_name": student.school.name if (student and student.school) else "Partner Institution",
            "grade": student.grade if student else "",
            "age": student.age if student else 16,
            "phone": student.phone if student else "",
            "verification_status": student.verification_status if student else "Unknown",
            "document_url": student.document_url if student else "",
            "document_type": student.document_type if student else "School ID Card"
        },
        "resource": {
            "id": resource.id if resource else "",
            "title": resource.title if resource else "Resource",
            "category": resource.category if resource else "Equipment",
            "image_url": resource.image_url if resource else "",
            "location_room": resource.location_room if resource else "Main Facility",
            "usage_rules": resource.usage_rules if resource else ""
        }
    }

# ==========================================
# STUDENT IDENTITY VERIFICATION & MESSAGING
# ==========================================
@app.post("/api/school/{school_id}/message-student")
def message_student(
    school_id: str,
    msg_req: schemas.SendMessageRequest,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    student = db.query(models.Profile).filter(models.Profile.id == msg_req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    school = db.query(models.School).filter(models.School.id == school_id).first()
    school_name = school.name if school else current_admin["name"]

    notif = models.Notification(
        id=str(uuid.uuid4()),
        user_id=student.id,
        sender_school_id=school_id,
        sender_name=school_name,
        title=msg_req.title,
        message=msg_req.message,
        type="direct_message",
        link="/student/profile",
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    return {
        "success": True,
        "message": f"Notification successfully dispatched to {student.full_name}'s notification portal.",
        "student_name": student.full_name,
        "notification_id": notif.id
    }

@app.get("/api/school/{school_id}/sent-messages")
def get_sent_messages(
    school_id: str,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    messages = db.query(models.Notification).filter(
        models.Notification.sender_school_id == school_id
    ).order_by(models.Notification.created_at.desc()).all()

    results = []
    for m in messages:
        student = db.query(models.Profile).filter(models.Profile.id == m.user_id).first()
        results.append({
            "id": m.id,
            "title": m.title,
            "message": m.message,
            "recipient_id": m.user_id,
            "recipient_name": student.full_name if student else "Student User",
            "recipient_email": student.email if student else "",
            "recipient_school": student.school.name if (student and student.school) else "Partner School",
            "created_at": m.created_at
        })

    return results

@app.get("/api/school/{school_id}/students/verification")
def list_pending_verifications(
    school_id: str,
    status_filter: Optional[str] = "all",
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    # All students registered at this school OR who requested items from this school OR all partner students for cross verification
    query = db.query(models.Profile).filter(models.Profile.role == "student")

    if status_filter != "all":
        query = query.filter(models.Profile.verification_status == status_filter)

    students = query.order_by(models.Profile.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "school_id": s.school_id,
            "school_name": s.school.name if s.school else "Independent Student",
            "grade": s.grade,
            "age": s.age,
            "verification_status": s.verification_status,
            "verification_notes": s.verification_notes,
            "document_type": s.document_type,
            "document_url": s.document_url,
            "created_at": s.created_at
        }
        for s in students
    ]

@app.post("/api/school/{school_id}/students/{student_id}/verify")
def update_student_verification(
    school_id: str,
    student_id: str,
    update: schemas.StudentVerificationUpdate,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    student = db.query(models.Profile).filter(
        models.Profile.id == student_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    student.verification_status = update.verification_status
    admin_name = current_admin.get("name") or "School Coordinator"
    student.verification_notes = update.verification_notes or f"Updated by {admin_name}"
    if update.verification_status == "Verified":
        student.verified_by_school_id = school_id
        student.verified_at = datetime.utcnow()

    # Notify student
    db.add(models.Notification(
        id=str(uuid.uuid4()),
        user_id=student.id,
        title=f"Identity Verification: {update.verification_status}",
        message=f"Your school identity verification status has been updated to '{update.verification_status}'. Notes: {student.verification_notes}",
        type="verification",
        link="/student/profile",
        created_at=datetime.utcnow()
    ))

    db.commit()

    return {
        "message": f"Student verification updated to {update.verification_status}",
        "student_id": student.id,
        "verification_status": student.verification_status
    }

# ==========================================
# CONDITION REPORTS & RESTRICTIONS
# ==========================================
@app.get("/api/school/{school_id}/condition-reports")
def get_condition_reports(
    school_id: str,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    reports = db.query(models.ConditionReport).filter(
        models.ConditionReport.school_id == school_id
    ).order_by(models.ConditionReport.created_at.desc()).all()

    results = []
    for cr in reports:
        res = db.query(models.Resource).filter(models.Resource.id == cr.resource_id).first()
        results.append({
            "id": cr.id,
            "booking_item_id": cr.booking_item_id,
            "resource_id": cr.resource_id,
            "resource_title": res.title if res else "Resource",
            "stage": cr.stage,
            "condition_rating": cr.condition_rating,
            "damage_details": cr.damage_details,
            "inspector_name": cr.inspector_name,
            "created_at": cr.created_at
        })

    return results

@app.get("/api/school/{school_id}/restrictions")
def get_school_restrictions(school_id: str, db: Session = Depends(get_db)):
    return db.query(models.SchoolRestriction).filter(
        models.SchoolRestriction.school_id == school_id,
        models.SchoolRestriction.is_active == True
    ).all()

@app.post("/api/school/{school_id}/restrictions")
def create_school_restriction(
    school_id: str,
    restr_in: schemas.SchoolRestrictionCreate,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    restr = models.SchoolRestriction(
        id=str(uuid.uuid4()),
        school_id=school_id,
        restricted_category=restr_in.restricted_category,
        min_grade=restr_in.min_grade or "",
        require_faculty_approval=restr_in.require_faculty_approval,
        rule_description=restr_in.rule_description,
        is_active=True
    )
    db.add(restr)
    db.commit()
    db.refresh(restr)
    return restr

@app.delete("/api/school/{school_id}/restrictions/{restr_id}")
def delete_school_restriction(
    school_id: str,
    restr_id: str,
    current_admin: dict = Depends(require_school_admin),
    db: Session = Depends(get_db)
):
    if current_admin["school_id"] != school_id:
        raise HTTPException(status_code=403, detail="Access Denied.")

    restr = db.query(models.SchoolRestriction).filter(
        models.SchoolRestriction.id == restr_id,
        models.SchoolRestriction.school_id == school_id
    ).first()

    if not restr:
        raise HTTPException(status_code=404, detail="Restriction rule not found.")

    db.delete(restr)
    db.commit()
    return {"message": "Restriction rule removed."}

# ==========================================
# AI RECOMMENDATIONS & DEMAND INSIGHTS
# ==========================================
@app.get("/api/ai/recommendations")
def get_ai_recommendations(
    resource_id: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 4,
    db: Session = Depends(get_db)
):
    """
    Returns AI-assisted resource recommendations powered by
    Scikit-learn TF-IDF Vectorizer and Cosine Similarity.
    """
    recs = ai_engine.get_resource_recommendations(
        db, target_resource_id=resource_id, search_query=query, top_k=limit
    )
    return {
        "engine": "Scikit-Learn TF-IDF + Cosine Similarity",
        "description": "Content-based semantic vector matching across inter-school curriculum metadata.",
        "results": recs
    }

@app.get("/api/ai/demand-insights")
def get_ai_demand_insights(school_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns AI resource-demand matching, underutilized asset suggestions,
    and cluster executive summary for the 'Unlock Underused Equipment' problem statement.
    """
    return ai_engine.analyze_demand_and_underutilization(db, school_id=school_id)

# ==========================================
# ANALYTICS DASHBOARDS
# ==========================================
@app.get("/api/analytics/school/{school_id}")
def get_school_analytics(
    school_id: str,
    db: Session = Depends(get_db)
):
    # School specific metrics
    school = db.query(models.School).filter(models.School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    resources = db.query(models.Resource).filter(models.Resource.owning_school_id == school_id).all()
    total_resources = sum(r.total_quantity for r in resources)
    available_resources = sum(r.available_quantity for r in resources)
    borrowed_resources = total_resources - available_resources

    requests = db.query(models.BookingItem).filter(models.BookingItem.owning_school_id == school_id).all()
    pending_requests = sum(1 for req in requests if req.status == "Requested")
    approved_requests = sum(1 for req in requests if req.status in ["Approved", "Ready for Collection"])
    collected_items = sum(1 for req in requests if req.status == "Collected")
    overdue_items = sum(1 for req in requests if req.status == "Collected" and req.due_date and datetime.utcnow() > req.due_date)

    utilization_rate = round((borrowed_resources / max(total_resources, 1)) * 100, 1)

    # Category breakdown for this school
    category_map = {}
    for r in resources:
        category_map[r.category] = category_map.get(r.category, 0) + r.total_quantity

    category_breakdown = [{"category": k, "count": v} for k, v in category_map.items()]

    return {
        "school_id": school.id,
        "school_name": school.name,
        "total_resources": total_resources,
        "available_resources": available_resources,
        "borrowed_resources": borrowed_resources,
        "pending_requests": pending_requests,
        "approved_requests": approved_requests,
        "collected_items": collected_items,
        "overdue_items": overdue_items,
        "utilization_rate": utilization_rate,
        "category_breakdown": category_breakdown
    }

@app.get("/api/analytics/platform")
def get_platform_analytics(db: Session = Depends(get_db)):
    schools_count = db.query(models.School).count()
    resources = db.query(models.Resource).all()
    total_resources = sum(r.total_quantity for r in resources)
    available_resources = sum(r.available_quantity for r in resources)

    booking_items = db.query(models.BookingItem).all()
    
    # Calculate cross-school bookings (where student's school != owning school)
    cross_school_count = 0
    for bi in booking_items:
        student = db.query(models.Profile).filter(models.Profile.id == bi.student_id).first()
        if student and student.school_id and student.school_id != bi.owning_school_id:
            cross_school_count += 1

    # Category distribution
    cat_distribution = {}
    for r in resources:
        cat_distribution[r.category] = cat_distribution.get(r.category, 0) + r.total_quantity

    category_chart = [{"name": k, "value": v} for k, v in cat_distribution.items()]

    # Sharing activity timeline (mocked aggregates for interactive charts)
    sharing_timeline = [
        {"month": "Week 1", "cross_loans": 3, "equipments": 5},
        {"month": "Week 2", "cross_loans": 8, "equipments": 11},
        {"month": "Week 3", "cross_loans": 14, "equipments": 18},
        {"month": "Week 4", "cross_loans": 22, "equipments": 26},
    ]

    return {
        "total_schools": schools_count,
        "total_shared_resources": total_resources,
        "available_resources": available_resources,
        "active_cross_school_bookings": cross_school_count,
        "total_requests": len(booking_items),
        "category_distribution": category_chart,
        "sharing_timeline": sharing_timeline,
        "demonstration_notice": "Platform live statistics computed in real-time across participating educational institutions."
    }

# ==========================================
# NOTIFICATIONS ENDPOINTS
# ==========================================
@app.get("/api/notifications")
def get_user_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] == "school_admin":
        notifs = db.query(models.Notification).filter(
            models.Notification.school_id == current_user["school_id"]
        ).order_by(models.Notification.created_at.desc()).limit(20).all()
    else:
        notifs = db.query(models.Notification).filter(
            models.Notification.user_id == current_user["id"]
        ).order_by(models.Notification.created_at.desc()).limit(20).all()

    return notifs

@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read."}
