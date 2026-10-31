import sqlite3

conn = sqlite3.connect('libshare.db')
c = conn.cursor()

# Set Tiyas Dey laptop request to Requested with NO QR token yet
c.execute("""
    UPDATE booking_items 
    SET qr_token='', status='Requested', qr_action='PENDING_APPROVAL' 
    WHERE resource_id='res-a-03' AND student_id IN (SELECT id FROM profiles WHERE email='deytiyas01@gmail.com')
""")

# Clear premature QR token from notifications for Tiyas
c.execute("""
    UPDATE notifications 
    SET qr_token=NULL 
    WHERE user_id IN (SELECT id FROM profiles WHERE email='deytiyas01@gmail.com')
""")

conn.commit()
print("UPDATED: Tiyas Dey Laptop item is in Requested status with no QR token. School A can now click 'Verify & Issue QR Pass'!")

# Verify
row = c.execute("""
    SELECT b.id, b.status, b.qr_token, p.full_name, r.title 
    FROM booking_items b 
    JOIN profiles p ON b.student_id=p.id 
    JOIN resources r ON b.resource_id=r.id 
    WHERE p.email='deytiyas01@gmail.com'
""").fetchone()
print("Verified Row:", row)
conn.close()
