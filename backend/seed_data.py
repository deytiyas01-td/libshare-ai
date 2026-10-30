from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
import models
from auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing_schools = db.query(models.School).count()
    if existing_schools >= 3:
        print("Database already contains schools. Skipping initial seed.")
        db.close()
        return

    print("Seeding LibShare AI database with schools, demo accounts, and catalog...")

    # 1. Schools
    school_a = models.School(
        id="school-a",
        name="Greenwood High School (School A)",
        code="SCH-A",
        admin_email="admin@schoola.edu",
        hashed_password=get_password_hash("WeCodeCoders1"),
        address="Sector 14, Educational Enclave, New Delhi",
        phone="+91 11 2789 4401",
        logo_color="teal",
        is_active=True
    )
    school_b = models.School(
        id="school-b",
        name="St. Xavier Academy (School B)",
        code="SCH-B",
        admin_email="admin@schoolb.edu",
        hashed_password=get_password_hash("WeCodeCoders2"),
        address="12 Park Street, Heritage Zone, New Delhi",
        phone="+91 11 2789 4402",
        logo_color="blue",
        is_active=True
    )
    school_c = models.School(
        id="school-c",
        name="Delhi Model Senior Secondary (School C)",
        code="SCH-C",
        admin_email="admin@schoolc.edu",
        hashed_password=get_password_hash("WeCodeCoders3"),
        address="Plot 5B, Science City Road, New Delhi",
        phone="+91 11 2789 4403",
        logo_color="cyan",
        is_active=True
    )

    db.add_all([school_a, school_b, school_c])
    db.commit()

    # 2. Student Demo Profiles
    # Student 1: Verified (School C student wishing to borrow from School A & B)
    student_arjun = models.Profile(
        id="student-arjun-01",
        email="student.arjun@demo.edu",
        full_name="Arjun Mehta",
        hashed_password=get_password_hash("StudentDemo123"),
        role="student",
        school_id="school-c",
        grade="Class 11 - Science",
        age=17,
        phone="+91 98765 43210",
        verification_status="Verified",
        verification_notes="Identity verified against Delhi Model Senior Secondary admission registry.",
        document_type="School ID Card",
        document_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
        verified_by_school_id="school-c",
        verified_at=datetime.utcnow() - timedelta(days=10)
    )

    # Student 2: Pending Verification (To test student approval workflow in School Admin portal!)
    student_priya = models.Profile(
        id="student-priya-02",
        email="student.priya@demo.edu",
        full_name="Priya Sharma",
        hashed_password=get_password_hash("StudentDemo123"),
        role="student",
        school_id="school-a",
        grade="Class 10 - Section A",
        age=16,
        phone="+91 98765 43211",
        verification_status="Pending",
        verification_notes="Awaiting administrator review of uploaded Admission Receipt.",
        document_type="Admission Receipt",
        document_url="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80",
    )

    # Student 3: Verified (School B student)
    student_rohan = models.Profile(
        id="student-rohan-03",
        email="student.rohan@demo.edu",
        full_name="Rohan Das",
        hashed_password=get_password_hash("StudentDemo123"),
        role="student",
        school_id="school-b",
        grade="Class 12 - Informatics",
        age=18,
        phone="+91 98765 43212",
        verification_status="Verified",
        verification_notes="Verified by St. Xavier Registrar.",
        document_type="School ID Card",
        document_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        verified_by_school_id="school-b",
        verified_at=datetime.utcnow() - timedelta(days=5)
    )

    db.add_all([student_arjun, student_priya, student_rohan])
    db.commit()

    # 3. Rich Catalog of Resources across the 3 Schools
    resources_data = [
        # School A Resources
        models.Resource(
            id="res-a-01",
            title="Concepts of Modern Physics (Arthur Beiser)",
            category="Books",
            description="Comprehensive textbook covering special relativity, quantum mechanics, and nuclear physics. Recommended for high school competitive physics preparation.",
            owning_school_id="school-a",
            image_url="https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&q=80",
            author="Arthur Beiser",
            subject="Physics",
            genre="Academic Reference",
            total_quantity=5,
            available_quantity=3,
            location_room="Central Library, Shelf 4B",
            usage_rules="14-day standard checkout. No highlighting in original copy.",
            eligibility_requirements="Open to all partner school students Grades 10-12.",
            status="Available"
        ),
        models.Resource(
            id="res-a-02",
            title="Compound Binocular Research Microscope 1000x",
            category="Science laboratory equipment",
            description="High precision optical microscope with LED illumination, oil immersion 100x lens, and mechanical stage. Ideal for microbiology and histology labs.",
            owning_school_id="school-a",
            image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
            author="Olympus Labs",
            subject="Biology",
            genre="Laboratory Apparatus",
            total_quantity=3,
            available_quantity=2,
            location_room="Biology Lab Room 102",
            usage_rules="Requires on-site supervision or certified faculty sign-off. Return with lens clean.",
            eligibility_requirements="Verified Grade 11-12 Biology or STEM club members.",
            status="Available"
        ),
        models.Resource(
            id="res-a-03",
            title="Dell Inspiron Core i7 Robotics Workstation",
            category="Computers and laptops",
            description="Pre-configured with ROS, Python 3.11, VS Code, and Arduino IDE. Dedicated Nvidia GPU for machine learning and CAD modeling.",
            owning_school_id="school-a",
            image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
            author="Dell Technologies",
            subject="Computer Science",
            genre="Computing Hardware",
            total_quantity=8,
            available_quantity=6,
            location_room="Computer Lab B, Terminal 12",
            usage_rules="7-day borrowing. Do not wipe OS or install non-approved drivers.",
            eligibility_requirements="Verified students with valid School ID.",
            status="Available"
        ),
        models.Resource(
            id="res-a-04",
            title="Acoustic Robotics Innovation Studio & Arena",
            category="Study spaces",
            description="Sound-dampened 600 sq ft innovation hub equipped with competition matting, soldering stations, test benches, and safety goggles.",
            owning_school_id="school-a",
            image_url="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
            author="Greenwood Innovation Wing",
            subject="Robotics & Engineering",
            genre="Facility / Space",
            total_quantity=1,
            available_quantity=1,
            location_room="Tech Wing, Ground Floor Studio 4",
            usage_rules="Slot booking in 2-hour increments. Max 10 students per team.",
            eligibility_requirements="Partner school teams registered with Hackathon/RoboCup.",
            status="Available"
        ),
        models.Resource(
            id="res-a-05",
            title="Vernier LabQuest 3 Sensor Sensor Data Collection Suite",
            category="Educational tools and devices",
            description="Standalone wireless digital interface with high-accuracy temperature, pH, pressure, and photogate sensors for real-time field experiments.",
            owning_school_id="school-a",
            image_url="https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80",
            author="Vernier Software & Technology",
            subject="General Science",
            genre="Digital Sensors",
            total_quantity=4,
            available_quantity=4,
            location_room="Physics Prep Room A",
            usage_rules="Handle probes with care. Return battery charged to 100%.",
            eligibility_requirements="Grades 9-12 students.",
            status="Available"
        ),

        # School B Resources
        models.Resource(
            id="res-b-01",
            title="Introduction to Algorithms (CLRS 4th Edition)",
            category="Books",
            description="The definitive global standard algorithms reference textbook covering dynamic programming, graph algorithms, NP-completeness, and data structures.",
            owning_school_id="school-b",
            image_url="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
            author="Cormen, Leiserson, Rivest, Stein",
            subject="Computer Science",
            genre="Algorithms & Theory",
            total_quantity=4,
            available_quantity=2,
            location_room="Senior Library Reference Stacks",
            usage_rules="10-day checkout. Available for inter-school student loan.",
            eligibility_requirements="All registered partner school students.",
            status="Available"
        ),
        models.Resource(
            id="res-b-02",
            title="Celestron NexStar 8SE Computerized Telescope",
            category="Science laboratory equipment",
            description="8-inch Schmidt-Cassegrain optics with automated StarPointer finder and SkyAlign technology. Perfect for night sky observation and astrophotography.",
            owning_school_id="school-b",
            image_url="https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&q=80",
            author="Celestron",
            subject="Astronomy",
            genre="Optical Equipment",
            total_quantity=2,
            available_quantity=1,
            location_room="Rooftop Observatory Storage",
            usage_rules="Must be transported in padded case. Staff inspection mandatory upon return.",
            eligibility_requirements="High school astronomy club or physics students with faculty mentor.",
            status="Available"
        ),
        models.Resource(
            id="res-b-03",
            title="Lenovo ThinkPad P14s Mobile Coding Unit",
            category="Computers and laptops",
            description="AMD Ryzen 7 PRO with 32GB RAM and dual-boot Linux/Windows. Optimized for data science, web development, and simulations.",
            owning_school_id="school-b",
            image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
            author="Lenovo",
            subject="Information Technology",
            genre="Mobile Workstation",
            total_quantity=6,
            available_quantity=4,
            location_room="Xavier IT Desk",
            usage_rules="5-day checkout for coding competitions and project sprints.",
            eligibility_requirements="Verified students with good return standing.",
            status="Available"
        ),
        models.Resource(
            id="res-b-04",
            title="Soundproof Collaborative Seminar Pod 2A",
            category="Study spaces",
            description="Four-person acoustic study pod with 4K display, Apple TV screen mirroring, whiteboards, and ergonomic seating for debate or project planning.",
            owning_school_id="school-b",
            image_url="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80",
            author="St. Xavier Learning Hub",
            subject="General Academic",
            genre="Collaboration Facility",
            total_quantity=2,
            available_quantity=2,
            location_room="2nd Floor Library West Wing",
            usage_rules="2-hour slot bookings. Clean up whiteboard markers after use.",
            eligibility_requirements="Any verified student group (2-4 persons).",
            status="Available"
        ),
        models.Resource(
            id="res-b-05",
            title="Arduino Ultimate Microcontroller STEM Kit (Pack of 5)",
            category="Educational tools and devices",
            description="Includes Arduino Uno R3, ultrasonic distance sensors, servo motors, LCD displays, breadboards, resistors, and jumper wires.",
            owning_school_id="school-b",
            image_url="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&q=80",
            author="Arduino Official",
            subject="Electronics",
            genre="Maker Hardware",
            total_quantity=5,
            available_quantity=3,
            location_room="Makerspace Locker 14",
            usage_rules="All components must be counted and returned in compartmentalized box.",
            eligibility_requirements="Open to all partner school students.",
            status="Available"
        ),

        # School C Resources
        models.Resource(
            id="res-c-01",
            title="Principles of Organic Chemistry (Morrison & Boyd)",
            category="Books",
            description="Classic organic chemistry masterwork covering reaction mechanisms, stereochemistry, synthesis, and spectroscopic analysis.",
            owning_school_id="school-c",
            image_url="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
            author="Robert T. Morrison, Robert N. Boyd",
            subject="Chemistry",
            genre="Academic Reference",
            total_quantity=6,
            available_quantity=5,
            location_room="School C Science Library Bay 3",
            usage_rules="14-day loan period. Free renewal if no pending waitlist.",
            eligibility_requirements="Verified partner students.",
            status="Available"
        ),
        models.Resource(
            id="res-c-02",
            title="Digital UV-Vis Spectrophotometer 190-1100nm",
            category="Science laboratory equipment",
            description="Split-beam spectrophotometer with quartz cuvettes for biochemical assays, protein quantification, and chemical kinetics experiments.",
            owning_school_id="school-c",
            image_url="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80",
            author="Shimadzu Scientific",
            subject="Chemistry & Biotech",
            genre="Spectroscopy",
            total_quantity=2,
            available_quantity=1,
            location_room="Advanced Chemistry Lab 201",
            usage_rules="On-site laboratory access only. Qualified instructor oversight required.",
            eligibility_requirements="Verified Grade 11-12 Chemistry students.",
            status="Available"
        ),
        models.Resource(
            id="res-c-03",
            title="Apple iPad Air 10.9-inch with Apple Pencil 2",
            category="Computers and laptops",
            description="Equipped with GoodNotes, Procreate, Desmos Graphing, and GeoGebra 3D for digital art, mathematical modeling, and lecture note taking.",
            owning_school_id="school-c",
            image_url="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
            author="Apple Inc.",
            subject="Digital Arts & Mathematics",
            genre="Tablet Device",
            total_quantity=5,
            available_quantity=3,
            location_room="Media Center Charging Cart 1",
            usage_rules="7-day loan. Return in protective smart folio case with stylus.",
            eligibility_requirements="Verified students with zero damage history.",
            status="Available"
        ),
        models.Resource(
            id="res-c-04",
            title="Digital Multimedia Podcast & Audio Production Suite",
            category="Study spaces",
            description="Broadcasting room with Shure SM7B studio microphones, Rodecaster Pro mixing console, sound-treated walls, and editing workstation.",
            owning_school_id="school-c",
            image_url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
            author="Delhi Model Media Department",
            subject="Journalism & Communications",
            genre="Audio Studio",
            total_quantity=1,
            available_quantity=1,
            location_room="Block C, Media Studio 104",
            usage_rules="2-hour bookable session. Do not reconfigure hardware cabling.",
            eligibility_requirements="Partner school student editors and podcast hosts.",
            status="Available"
        ),
        models.Resource(
            id="res-c-05",
            title="Texas Instruments TI-84 Plus CE Color Graphing Calculators (Set of 10)",
            category="Educational tools and devices",
            description="Full-color backlit display with rechargeable battery. Approved for AP Calculus, Statistics, and Physics examinations.",
            owning_school_id="school-c",
            image_url="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&q=80",
            author="Texas Instruments",
            subject="Mathematics",
            genre="Computational Tools",
            total_quantity=10,
            available_quantity=8,
            location_room="Math Department Reserve",
            usage_rules="Single unit or classroom pack checkout for tests and study camps.",
            eligibility_requirements="All partner school students.",
            status="Available"
        )
    ]

    db.add_all(resources_data)
    db.commit()

    # 4. Sample Cross-School Bookings with QR Codes (Pre-seeded for instant demo testing!)
    # Arjun (School C) requested:
    # Item 1 from School A: "Concepts of Modern Physics" (Approved & Ready for Collection with QR!)
    # Item 2 from School B: "Celestron NexStar Telescope" (Requested - Awaiting School B approval)
    demo_booking = models.Booking(
        id="book-demo-01",
        student_id="student-arjun-01",
        total_items=2,
        notes="Preparing for Inter-School Science Olympiad & Astrophysics Project."
    )
    db.add(demo_booking)
    db.commit()

    booking_item_1 = models.BookingItem(
        id="bitem-demo-01",
        booking_id="book-demo-01",
        resource_id="res-a-01",
        owning_school_id="school-a",
        student_id="student-arjun-01",
        status="Ready for Collection",
        start_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=7),
        qr_token="QR-SECURE-COLLECT-SCHA-78912",
        qr_action="COLLECTION",
        qr_expires_at=datetime.utcnow() + timedelta(days=2),
        pre_collection_condition="Excellent - Clean binding, no torn pages"
    )

    booking_item_2 = models.BookingItem(
        id="bitem-demo-02",
        booking_id="book-demo-01",
        resource_id="res-b-02",
        owning_school_id="school-b",
        student_id="student-arjun-01",
        status="Requested",
        start_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=5),
        qr_token="QR-PENDING-SCHB-55410",
        qr_action="COLLECTION",
        qr_expires_at=datetime.utcnow() + timedelta(days=3)
    )

    # Rohan (School B) previously borrowed an item from School A that is now Collected (ready to test Return scan!)
    demo_booking_2 = models.Booking(
        id="book-demo-02",
        student_id="student-rohan-03",
        total_items=1,
        notes="Robotics project coding work."
    )
    db.add(demo_booking_2)
    db.commit()

    booking_item_3 = models.BookingItem(
        id="bitem-demo-03",
        booking_id="book-demo-02",
        resource_id="res-a-03", # Dell Laptop
        owning_school_id="school-a",
        student_id="student-rohan-03",
        status="Collected",
        start_date=datetime.utcnow() - timedelta(days=4),
        due_date=datetime.utcnow() + timedelta(days=3),
        collection_date=datetime.utcnow() - timedelta(days=4),
        qr_token="QR-SECURE-RETURN-SCHA-43210",
        qr_action="RETURN",
        qr_expires_at=datetime.utcnow() + timedelta(days=5),
        pre_collection_condition="Good - minor scratch on exterior case, battery 98%"
    )

    db.add_all([booking_item_1, booking_item_2, booking_item_3])
    db.commit()

    # 5. Notifications
    notif_student = models.Notification(
        user_id="student-arjun-01",
        school_id=None,
        title="Resource Request Approved!",
        message="Greenwood High (School A) approved your request for 'Concepts of Modern Physics'. Your QR Collection Pass is ready.",
        type="collection",
        is_read=False,
        link="/student/my-bookings"
    )

    notif_school_a = models.Notification(
        user_id=None,
        school_id="school-a",
        title="New Student Verification Pending",
        message="Student Priya Sharma has submitted an admission receipt for enrollment verification.",
        type="verification",
        is_read=False,
        link="/school/school-a/verification"
    )

    notif_school_b = models.Notification(
        user_id=None,
        school_id="school-b",
        title="Cross-School Borrow Request",
        message="Arjun Mehta (from Delhi Model Senior Secondary) requested Celestron NexStar Telescope.",
        type="booking_status",
        is_read=False,
        link="/school/school-b/requests"
    )

    db.add_all([notif_student, notif_school_a, notif_school_b])
    db.commit()

    # 6. School Specific Restrictions
    restriction_a = models.SchoolRestriction(
        school_id="school-a",
        restricted_category="Science laboratory equipment",
        min_grade="Class 10",
        require_faculty_approval=True,
        rule_description="Laboratory optical devices require verified student status and teacher endorsement."
    )
    db.add(restriction_a)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
