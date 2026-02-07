import firebase_admin
from firebase_admin import credentials, firestore
import re
import uuid
import sys
import os
from datetime import datetime

# [가재 컴퍼니] Standard Intelligence Logger (Python v6.0 - High Fidelity)
# 의도: 파이썬 환경에서도 개별 발언을 'High-Fidelity 카드'로 박제함.

SERVICE_ACCOUNT_PATH = '/Users/openclaw-kong/.openclaw/workspace/firebase-service-account.json'

profile_map = {
    'CEO': 'https://api.dicebear.com/7.x/bottts/svg?seed=CEO&backgroundColor=ff9800',
    'PO': 'https://api.dicebear.com/7.x/bottts/svg?seed=PO&backgroundColor=2196f3',
    'PM': 'https://api.dicebear.com/7.x/bottts/svg?seed=PM&backgroundColor=4caf50',
    'DEV': 'https://api.dicebear.com/7.x/bottts/svg?seed=DEV&backgroundColor=673ab7',
    'UX': 'https://api.dicebear.com/7.x/bottts/svg?seed=UX&backgroundColor=e91e63',
    'QA': 'https://api.dicebear.com/7.x/bottts/svg?seed=QA&backgroundColor=00bcd4',
    'BA': 'https://api.dicebear.com/7.x/bottts/svg?seed=BA&backgroundColor=ffc107',
    'MARKETING': 'https://api.dicebear.com/7.x/bottts/svg?seed=MARKETING&backgroundColor=ff5722',
    'LEGAL': 'https://api.dicebear.com/7.x/bottts/svg?seed=LEGAL&backgroundColor=607d8b',
    'HR': 'https://api.dicebear.com/7.x/bottts/svg?seed=HR&backgroundColor=795548',
    'CS': 'https://api.dicebear.com/7.x/bottts/svg?seed=CS&backgroundColor=cddc39',
    'HOST': 'https://api.dicebear.com/7.x/bottts/svg?seed=HOST&backgroundColor=9e9e9e',
    'Attendant': 'https://api.dicebear.com/7.x/bottts/svg?seed=Attendant&backgroundColor=3f51b5',
}

def init_firebase():
    if not firebase_admin._apps:
        if os.path.exists(SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app(options={'projectId': 'gajae-company-bip'})

def parse_turn(content):
    def extract(pattern):
        match = re.search(pattern, content)
        return match.group(1).strip() if match else ""
    
    return {
        'intent': extract(r'(?:\d\. |### 1\. )\*\*의도\s?\(Intention\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)'),
        'psychology': extract(r'(?:\d\. |### 2\. )\*\*심리\s?\(Psychology\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)'),
        'thought': extract(r'(?:\d\. |### 3\. )\*\*생각\s?\(Thought\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)'),
        'action': extract(r'(?:\d\. |### 4\. )\*\*행동\s?\(Action\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)'),
        'response': extract(r'(?:\d\. |### 5\. )\*\*답변\s?\(Response.*?\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)'),
    }

def log_to_firestore(log_type, title, author, content):
    init_firebase()
    db = firestore.client()
    
    now = datetime.now()
    date_key = now.strftime("%Y%m%d")
    time_str = now.strftime("%H:%M:%S")
    
    meeting_id = f"session-{str(uuid.uuid4())}"
    activity_id = str(uuid.uuid4())
    author_id = author.split('_')[0].replace('[', '').split(']')[0]

    meeting_data = {
        'id': meeting_id,
        'type': 'command_session' if log_type == 'command' else ('report_session' if '보고' in title else 'collaboration'),
        'topic': title,
        'date': date_key,
        'startTime': time_str,
        'status': 'closed',
        'createdAt': firestore.SERVER_TIMESTAMP
    }

    activity_data = {
        'id': activity_id,
        'meetingId': meeting_id,
        'type': 'command' if log_type == 'command' else ('report' if '보고' in title else 'utterance'),
        'authorId': author_id,
        'authorName': author,
        'profileUrl': profile_map.get(author_id, profile_map['Attendant']),
        'time': time_str,
        'createdAt': firestore.SERVER_TIMESTAMP,
        **parse_turn(content)
    }

    if log_type == 'command':
        match = re.search(r'##\s📜\s지시\s내용\s\(Command\)\n([\s\S]*?)(?=\n---|$)', content)
        activity_data['instruction'] = match.group(1).strip() if match else content

    db.collection('meetings').document(meeting_id).set(meeting_data)
    db.collection('activities').document(activity_id).set(activity_data)
    print(f"✅ High-Fidelity Atomic log persisted: {activity_id}")

if __name__ == "__main__":
    if len(sys.argv) >= 5:
        log_to_firestore(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print("Usage: python3 scripts/logger.py <command|meeting|pulse> <title> <author> <content>")
