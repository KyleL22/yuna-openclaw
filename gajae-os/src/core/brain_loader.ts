import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from './firebase';
import { SystemRole } from '../types/system_role.interface';

/**
 * Brain Loader
 * docs/core/role/*.md 파일들을 읽어서 Firestore /system/roles 컬렉션에 동기화합니다.
 */
export class BrainLoader {
  private readonly rolesDir: string;

  constructor(workspaceRoot: string) {
    this.rolesDir = path.join(workspaceRoot, 'docs', 'core', 'role');
  }

  // 1. MD 파일 파싱
  private parseRoleFile(filePath: string): SystemRole {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath, '.md'); // ROLE_DEV
    
    // ID 추출: ROLE_DEV -> dev
    const id = filename.replace('ROLE_', '').toLowerCase();
    
    // 한글 이름 매핑
    const nameMap: Record<string, string> = {
      'biseo': '비서가재',
      'pm': '매니저가재',
      'po': '기획가재',
      'ba': '분석가재',
      'ux': '디자인가재',
      'dev': '개발가재',
      'qa': '품질가재',
      'hr': '인사가재',
      'marketing': '마케팅가재',
      'legal': '변호사가재',
      'cs': '민원가재',
      'attendant': '비서가재' // attendant -> biseo로 매핑 (파일이 아직 ROLE_ATTENDANT.md라면)
    };

    return {
      id,
      name: nameMap[id] || id.toUpperCase(),
      persona: {
        tone: 'Professional & Efficient', 
        core_values: []
      },
      responsibilities: {
        'ALL': content // 전체 내용을 통으로 넣음
      }
    };
  }

  // 2. Firestore 업로드
  async syncRoles() {
    if (!fs.existsSync(this.rolesDir)) {
      console.error(`❌ Roles directory not found: ${this.rolesDir}`);
      return;
    }

    const files = fs.readdirSync(this.rolesDir).filter(f => f.endsWith('.md'));
    console.log(`🧠 Found ${files.length} role files. Syncing to Firestore...`);

    const batch = db.batch();

    for (const file of files) {
      const roleData = this.parseRoleFile(path.join(this.rolesDir, file));
      const docRef = db.collection('system').doc('roles').collection('items').doc(roleData.id);
      
      batch.set(docRef, roleData, { merge: true });
      console.log(`   - Prepare: ${roleData.name} (${roleData.id})`);
    }

    await batch.commit();
    console.log('✅ Brain Sync Complete!');
  }
}

// 직접 실행용 (CLI) - ESM Compatible
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // gajae-os/src/core -> gajae-os/src -> gajae-os -> yuna-openclaw
  const workspaceRoot = path.resolve(__dirname, '../../..');
  
  new BrainLoader(workspaceRoot).syncRoles().catch(console.error);
}
