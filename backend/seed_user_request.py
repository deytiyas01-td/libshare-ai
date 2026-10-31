import sqlite3
import uuid
from datetime import datetime, timedelta

conn = sqlite3.connect('libshare.db')
c = conn.cursor()

user = c.execute("SELECT id, full_name, email FROM profiles WHERE email='deytiyas01@gmail.com'").fetchone()
if not user:
    # If not registered, create user
    student_id = str(uuid.uuid4())
    c.execute("""
        INSERT INTO profiles (id, email, full_name, role, school_id, grade, age, verification_status, document_type, document_url)
        VALUES (?, 'deytiyas01@gmail.com', 'Tiyas Dey', 'student', 'school-a', 'Grade 12 STEM', 17, 'Verified', 'School ID Card', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600')
    """, (student_id,))
else:
    student_id = user[0]

now = datetime.utcnow()
due = now + timedelta(days=7)
booking_id = str(uuid.uuid4())
bitem_id = str(uuid.uuid4())
qr_token = f"QR-TIYAS-LAPTOP-{uuid.uuid4().hex[:6].upper()}"

# Insert Booking
c.execute(
    "INSERT INTO bookings (id, student_id, total_items, notes, created_at) VALUES (?, ?, 1, 'Robotics and AI hackathon workspace usage', ?)",
    (booking_id, student_id, now)
)

# Insert BookingItem for res-a-03 (Dell Inspiron Core i7 Robotics Workstation, owned by school-a)
c.execute("""
    INSERT INTO booking_items (id, booking_id, resource_id, owning_school_id, student_id, status, start_date, due_date, qr_token, qr_action, pre_collection_condition, created_at)
    VALUES (?, ?, 'res-a-03', 'school-a', ?, 'Requested', ?, ?, ?, 'COLLECTION', 'Good', ?)
""", (bitem_id, booking_id, student_id, now, due, qr_token, now))

# Notification for School A
c.execute("""
    INSERT INTO notifications (id, school_id, title, message, type, link, created_at)
    VALUES (?, 'school-a', 'New Incoming Resource Request: Dell Inspiron Laptop', 'Tiyas Dey (Grade 12 STEM) submitted a borrow request for Dell Inspiron Core i7 Robotics Workstation.', 'booking_status', '/school/school-a/requests', ?)
""", (str(uuid.uuid4()), now))

# Notification for Student Tiyas Dey
c.execute("""
    INSERT INTO notifications (id, user_id, title, message, qr_token, type, link, created_at)
    VALUES (?, ?, 'Booking QR Pass: Dell Inspiron Core i7 Robotics Workstation', 'Request submitted for Dell Inspiron Core i7 Robotics Workstation. Your cryptographic QR code pass is generated and ready to view or download.', ?, 'booking_status', '/student/my-bookings', ?)
""", (str(uuid.uuid4()), student_id, qr_token, now))

conn.commit()
conn.close()
print(f"SUCCESS: Created Laptop Request for Tiyas Dey with QR token: {qr_token}")
