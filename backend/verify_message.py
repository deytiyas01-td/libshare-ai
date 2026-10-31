import requests

BASE = 'http://127.0.0.1:8000'

# 1. Login School A
res = requests.post(f'{BASE}/api/auth/login', json={
    'email_or_school': 'school-a',
    'password': 'WeCodeCoders1',
    'portal_type': 'school'
})
assert res.status_code == 200, res.text
school_token = res.json()['access_token']
headers_school = {'Authorization': f'Bearer {school_token}'}
print('1. School A Login: OK')

# 2. Get students pending or registered
res = requests.get(f'{BASE}/api/school/school-a/students/verification', headers=headers_school)
students = res.json()
target_student = next((s for s in students if 'tiyas' in s['email'].lower() or 'tiyas' in s['full_name'].lower()), students[0])
print(f'2. Target Student: {target_student["full_name"]} ({target_student["id"]})')

# 3. School A messages the student
msg_payload = {
    'student_id': target_student['id'],
    'title': 'Official Notice from School A Library Desk',
    'message': 'Hello Tiyas, your borrow request has been pre-screened. Please carry your student ID card when visiting Lab B.'
}
res = requests.post(f'{BASE}/api/school/school-a/message-student', json=msg_payload, headers=headers_school)
assert res.status_code == 200, res.text
print('3. Dispatch message from School A: OK ->', res.json())

# 4. Login Student
res = requests.post(f'{BASE}/api/auth/login', json={
    'email_or_school': target_student['email'],
    'password': 'password123',
    'portal_type': 'student'
})
assert res.status_code == 200, res.text
student_token = res.json()['access_token']
headers_student = {'Authorization': f'Bearer {student_token}'}
print('4. Student Login: OK')

# 5. Fetch student notifications (Notification Portal)
res = requests.get(f'{BASE}/api/notifications', headers=headers_student)
assert res.status_code == 200, res.text
notifs = res.json()
direct_msgs = [n for n in notifs if n.get('type') == 'direct_message']
print(f'5. Student Notification Portal received {len(notifs)} total notifications, {len(direct_msgs)} direct messages!')
latest = direct_msgs[0]
print(f'   Latest Direct Message: "{latest["title"]}" - "{latest["message"]}" from "{latest["sender_name"]}"')
assert latest['title'] == msg_payload['title']
assert latest['message'] == msg_payload['message']
print('>>> ALL VERIFICATIONS PASSED SUCCESSFULLY! <<<')
