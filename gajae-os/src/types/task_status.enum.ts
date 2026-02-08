/**
 * Task Status Enum (v2.0 - 5-Step Process)
 */
export enum TaskStatus {
  // 1. Inbox (Task Entry)
  INBOX = 'INBOX',
  BACKLOG = 'BACKLOG',

  // 2. Planning (기획) - PO
  // Goal: Requirement Analysis, PRD (1-Pager)
  // Gate: CEO Approval
  PLAN = 'PLAN',

  // 3. Design (디자인) - UX
  // Goal: UI/UX Design, Design Spec
  // Gate: CEO Approval
  DESIGN = 'DESIGN',

  // 4. Development (개발) - DEV
  // Goal: Implementation, Tech Spec, Code
  // Gate: Code Review / CEO Approval
  DEV = 'DEV',

  // 5. Testing (테스트) - QA
  // Goal: QA, Bug Fixes
  // Gate: Release Sign-off
  TEST = 'TEST',

  // 6. Release (배포) - PO
  // Goal: Deployment, Announcement
  RELEASE = 'RELEASE',

  // 7. Done
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED'
}
