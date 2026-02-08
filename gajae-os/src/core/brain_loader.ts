import * as fs from 'fs';
import * as path from 'path';
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
    
    // 단순 파싱 로직 (실제로는 마크다운 파서나 정규식으로 더 정교하게 할 수 있음)
    // 여기서는 파일 내용 전체를 persona.tone에 넣는 식으로 간소화하거나
    // 특정 섹션을 파싱한다고 가정.
    // 일단 전체 텍스트를 'description'으로 저장하고, 추후 고도화.
    
    // 한글 이름 매핑 (하드코딩 or 파일 내 메타데이터 파싱)
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
      'cs': '민원가재'
    };

    return {
      id,
      name: nameMap[id] || id.toUpperCase(),
      persona: {
        tone: 'Professional & Efficient', // 파일 내용에서 추출 필요
        core_values: []
      },
      responsibilities: {
        'ALL': content // 전체 내용을 통으로 넣음 (가장 확실한 컨텍스트)
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

// 직접 실행용 (CLI)
if (require.main === module) {
  // 워크스페이스 루트 추정 (gajae-os의 상위 폴더)
  const workspaceRoot = path.resolve(__dirname, '../../..');
  new BrainLoader(workspaceRoot).syncRoles().catch(console.error);
}
