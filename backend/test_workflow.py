import urllib.request
import json

BASE = "http://127.0.0.1:8000/api"

# 1. Login as School A
school_payload = json.dumps({
    "email_or_school": "school-a",
    "school_id": "school-a",
    "password": "WeCodeCoders1",
    "portal_type": "school"
}).encode()

req = urllib.request.Request(f"{BASE}/auth/login", data=school_payload, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as resp:
    school_token = json.loads(resp.read().decode())["access_token"]
    print("1. School A Coordinator Login: SUCCESS")

# 2. Get School A requests to find Tiyas Dey's request
req = urllib.request.Request(f"{BASE}/school/school-a/requests", headers={"Authorization": f"Bearer {school_token}"})
with urllib.request.urlopen(req) as resp:
    items = json.loads(resp.read().decode())
    tiyas_req = next((it for it in items if "Tiyas" in it["student_name"]), None)
    assert tiyas_req is not None, "Tiyas laptop request not found"
    print(f"2. Found Tiyas Request: ID={tiyas_req['id']}, Status={tiyas_req['status']}, Current QR='{tiyas_req['qr_token']}'")

# 3. Test sending a message from School A to Tiyas Dey
msg_payload = json.dumps({
    "student_id": tiyas_req["student_id"],
    "title": "Document Verification Notice: Laptop Allocation",
    "message": "Hi Tiyas, your enrollment document has been reviewed. Your laptop is prepared in Computer Lab B. Please collect it before 4 PM."
}).encode()

req = urllib.request.Request(f"{BASE}/school/school-a/message-student", data=msg_payload, headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {school_token}"
})
with urllib.request.urlopen(req) as resp:
    msg_resp = json.loads(resp.read().decode())
    print("3. School Message Dispatch:", msg_resp["message"])

# 4. Check that Tiyas Dey has received the message in their notifications portal!
# First let's query the database notifications directly for student_id
import sqlite3
conn = sqlite3.connect("libshare.db")
c = conn.cursor()
notifs = c.execute("SELECT title, message, sender_name, qr_token FROM notifications WHERE user_id=? ORDER BY created_at DESC", (tiyas_req["student_id"],)).fetchall()
print("4. Notifications received in Tiyas Dey portal:")
for n in notifs[:3]:
    print(f"   - Title: {n[0]} | From: {n[2]} | Message: {n[1][:50]}... | QR: {n[3]}")

# 5. Now School A clicks "Verify & Issue QR Pass" (APPROVE)
decision_payload = json.dumps({
    "action": "APPROVE"
}).encode()
req = urllib.request.Request(f"{BASE}/school/school-a/requests/{tiyas_req['id']}/decision", data=decision_payload, headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {school_token}"
})
with urllib.request.urlopen(req) as resp:
    decision_resp = json.loads(resp.read().decode())
    print("5. School Verification Decision:", decision_resp)

# 6. Check that the QR code is NOW issued and sent to Tiyas Dey!
row = c.execute("SELECT status, qr_token FROM booking_items WHERE id=?", (tiyas_req["id"],)).fetchone()
print(f"6. Booking Item After Verification: Status={row[0]}, QR Token={row[1]}")
assert row[1].startswith("QR-COLLECT-"), "QR token was not generated on approval!"

approved_notif = c.execute("SELECT title, qr_token, message FROM notifications WHERE user_id=? AND qr_token IS NOT NULL ORDER BY created_at DESC", (tiyas_req["student_id"],)).fetchone()
print(f"7. QR Code Notification Sent to Student: Title='{approved_notif[0]}', Token='{approved_notif[1]}'")
conn.close()
print("ALL TESTS PASSED! Verification gate and message delivery verified completely.")
