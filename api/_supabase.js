import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';

const landingDefaults = {
  hero_badge: 'IET Gorakhpur - Team Paradox',
  hero_title: 'Team Paradox',
  hero_tagline: 'Crafting digital solutions, one byte at a time',
  hero_description: 'We are a passionate team of student developers at IET Gorakhpur, building innovative projects, contributing to open source, and pushing the boundaries of technology.',
  about_title: 'Who We Are',
  mission_title: 'Our Mission',
  mission_description: 'To foster a collaborative environment where students can learn, build, and innovate together while making meaningful contributions to the tech community.',
  team_title: 'Our Team',
  team_description: 'The brilliant minds behind our projects and innovations.',
  achievements_title: 'Our Achievements',
  achievements_description: 'A live snapshot of team output from approved members, projects, repositories, and certifications.',
  contact_title: 'Get In Touch',
  contact_description: 'Interested in collaborating or joining the team? Reach out to us through the links below or create your profile to become part of the public directory.',
  contact_email: 'team@paradox.local',
  hero_stats: JSON.stringify([
    { label: 'Team Members', type: 'members' },
    { label: 'GitHub Profiles', type: 'github_profiles' },
    { label: 'Projects / Repos', type: 'projects_repos' },
    { label: 'Engineers', type: 'members' },
  ]),
  mission_cards: JSON.stringify([
    { icon: 'Github', title: 'Open Source', description: 'Active contribution culture with synced repositories and public code visibility.' },
    { icon: 'Lightbulb', title: 'Innovation', description: 'A shared space to prototype, ship, and improve products with measurable output.' },
    { icon: 'BookOpen', title: 'Learning', description: 'Profiles capture evolving skills, certifications, and technical growth over time.' },
    { icon: 'HeartHandshake', title: 'Community', description: 'The platform makes it easier to discover teammates, work, and areas of expertise.' },
  ]),
  core_stack_items: JSON.stringify(['React/Next.js', 'Node.js', 'TypeScript', 'Python/ML', 'Git/GitHub', 'UI/UX']),
  team_filter_labels: JSON.stringify(['All', 'Developers', 'GitHub Synced', 'Featured']),
  achievement_items: JSON.stringify([
    { date: 'Live Data', title: 'Approved member directory is active', description: 'Approved member profiles currently power the landing page.' },
    { date: 'GitHub Sync', title: 'Repository data is synced', description: 'Connected GitHub profiles and public repos are indexed from the database.' },
    { date: 'Projects', title: 'Project showcase is ready', description: 'Project records are available for member portfolios.' },
    { date: 'Certificates', title: 'Certification tracking is enabled', description: 'Certificate records are stored for verified team members.' },
  ]),
  contact_links: JSON.stringify([
    { label: 'GitHub', type: 'member_github', href: '' },
    { label: 'LinkedIn', type: 'member_linkedin', href: '' },
    { label: 'Twitter', type: 'member_twitter', href: '' },
    { label: 'Website', type: 'member_website', href: '' },
    { label: 'Email', type: 'email', href: '' },
  ]),
};

const tableMeta = {
  team_members: {
    bool: new Set(['is_approved', 'is_featured']),
    json: new Set(['skills', 'github_data']),
  },
  projects: {
    bool: new Set(['is_featured']),
    json: new Set(['technologies']),
  },
  experience: {
    bool: new Set(['is_current']),
    json: new Set(),
  },
  education: {
    bool: new Set(),
    json: new Set(),
  },
  certificates: {
    bool: new Set(),
    json: new Set(),
  },
  landing_settings: {
    bool: new Set(['sync_on_profile_save']),
    json: new Set(['hero_stats', 'mission_cards', 'core_stack_items', 'team_filter_labels', 'achievement_items', 'contact_links']),
  },
  auth_users: {
    bool: new Set(['email_verified']),
    json: new Set(),
  },
  pending_registrations: {
    bool: new Set(),
    json: new Set(),
  },
  auth_sessions: {
    bool: new Set(),
    json: new Set(),
  },
};

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 1,
    email_verification_token TEXT NOT NULL DEFAULT '',
    email_verification_expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS pending_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    verification_token TEXT NOT NULL DEFAULT '',
    expires_at TEXT NOT NULL,
    otp_hash TEXT NOT NULL DEFAULT '',
    otp_expires_at TEXT,
    otp_attempts INTEGER NOT NULL DEFAULT 0,
    otp_last_sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'member',
    bio TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    github_username TEXT NOT NULL DEFAULT '',
    linkedin_url TEXT NOT NULL DEFAULT '',
    twitter_handle TEXT NOT NULL DEFAULT '',
    dribbble_url TEXT NOT NULL DEFAULT '',
    resume_url TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '[]',
    github_data TEXT,
    is_approved INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    joined_date TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    institution TEXT NOT NULL DEFAULT '',
    degree TEXT NOT NULL DEFAULT '',
    field TEXT NOT NULL DEFAULT '',
    start_date TEXT,
    end_date TEXT,
    grade TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    project_url TEXT NOT NULL DEFAULT '',
    repo_url TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    technologies TEXT NOT NULL DEFAULT '[]',
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    issuer TEXT NOT NULL DEFAULT '',
    issue_date TEXT,
    expiry_date TEXT,
    credential_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS landing_settings (
    id INTEGER PRIMARY KEY,
    hero_badge TEXT NOT NULL DEFAULT 'IET Gorakhpur - Team Paradox',
    hero_title TEXT NOT NULL DEFAULT 'Team Paradox',
    hero_tagline TEXT NOT NULL DEFAULT 'Crafting digital solutions, one byte at a time',
    hero_description TEXT NOT NULL DEFAULT 'We are a passionate team of student developers at IET Gorakhpur, building innovative projects, contributing to open source, and pushing the boundaries of technology.',
    about_title TEXT NOT NULL DEFAULT 'Who We Are',
    mission_title TEXT NOT NULL DEFAULT 'Our Mission',
    mission_description TEXT NOT NULL DEFAULT 'To foster a collaborative environment where students can learn, build, and innovate together while making meaningful contributions to the tech community.',
    team_title TEXT NOT NULL DEFAULT 'Our Team',
    team_description TEXT NOT NULL DEFAULT 'The brilliant minds behind our projects and innovations.',
    achievements_title TEXT NOT NULL DEFAULT 'Our Achievements',
    achievements_description TEXT NOT NULL DEFAULT 'A live snapshot of team output from approved members, projects, repositories, and certifications.',
    contact_title TEXT NOT NULL DEFAULT 'Get In Touch',
    contact_description TEXT NOT NULL DEFAULT 'Interested in collaborating or joining the team? Reach out to us through the links below or create your profile to become part of the public directory.',
    contact_email TEXT NOT NULL DEFAULT 'team@paradox.local',
    hero_stats TEXT NOT NULL DEFAULT '[]',
    mission_cards TEXT NOT NULL DEFAULT '[]',
    core_stack_items TEXT NOT NULL DEFAULT '[]',
    team_filter_labels TEXT NOT NULL DEFAULT '[]',
    achievement_items TEXT NOT NULL DEFAULT '[]',
    contact_links TEXT NOT NULL DEFAULT '[]',
    sync_mode TEXT NOT NULL DEFAULT 'manual',
    sync_on_profile_save INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_members_slug ON team_members(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_members_user_id ON team_members(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth_sessions(expires_at)`,
];

const useTurso = Boolean(process.env.TURSO_DATABASE_URL);
const localDbPath = process.env.SQLITE_DB_PATH || './data/paradox.sqlite';
const resolvedDbPath = path.isAbsolute(localDbPath) ? localDbPath : path.resolve(process.cwd(), localDbPath);

let sqlite = null;
let turso = null;

if (useTurso) {
  turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} else {
  fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });
  sqlite = new Database(resolvedDbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
}

async function execStatement(sql, args = []) {
  if (turso) {
    return turso.execute({ sql, args });
  }
  const stmt = sqlite.prepare(sql);
  const upper = sql.trim().toUpperCase();
  if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA')) {
    const rows = stmt.all(...args);
    return { rows, lastInsertRowid: null };
  }
  const info = stmt.run(...args);
  return { rows: [], lastInsertRowid: info.lastInsertRowid };
}

async function initializeDatabase() {
  for (const sql of schemaStatements) {
    await execStatement(sql);
  }

  for (const column of [
    ['hero_stats', `TEXT NOT NULL DEFAULT '[]'`],
    ['mission_cards', `TEXT NOT NULL DEFAULT '[]'`],
    ['core_stack_items', `TEXT NOT NULL DEFAULT '[]'`],
    ['team_filter_labels', `TEXT NOT NULL DEFAULT '[]'`],
    ['achievement_items', `TEXT NOT NULL DEFAULT '[]'`],
    ['contact_links', `TEXT NOT NULL DEFAULT '[]'`],
  ]) {
    const pragma = await execStatement(`PRAGMA table_info(landing_settings)`);
    const exists = (pragma.rows || []).some((row) => row.name === column[0]);
    if (!exists) {
      await execStatement(`ALTER TABLE landing_settings ADD COLUMN ${column[0]} ${column[1]}`);
    }
  }

  for (const column of [
    ['email_verified', `INTEGER NOT NULL DEFAULT 1`],
    ['email_verification_token', `TEXT NOT NULL DEFAULT ''`],
    ['email_verification_expires_at', `TEXT`],
  ]) {
    const pragma = await execStatement(`PRAGMA table_info(auth_users)`);
    const exists = (pragma.rows || []).some((row) => row.name === column[0]);
    if (!exists) {
      await execStatement(`ALTER TABLE auth_users ADD COLUMN ${column[0]} ${column[1]}`);
    }
  }

  for (const column of [
    ['verification_token', `TEXT NOT NULL DEFAULT ''`],
    ['otp_hash', `TEXT NOT NULL DEFAULT ''`],
    ['otp_expires_at', `TEXT`],
    ['otp_attempts', `INTEGER NOT NULL DEFAULT 0`],
    ['otp_last_sent_at', `TEXT`],
  ]) {
    const pragma = await execStatement(`PRAGMA table_info(pending_registrations)`);
    const exists = (pragma.rows || []).some((row) => row.name === column[0]);
    if (!exists) {
      await execStatement(`ALTER TABLE pending_registrations ADD COLUMN ${column[0]} ${column[1]}`);
    }
  }

  await execStatement(`UPDATE auth_users SET email_verified = 1 WHERE email_verified IS NULL`);
  await execStatement(`DELETE FROM pending_registrations WHERE expires_at <= ?`, [new Date().toISOString()]);

  await execStatement('INSERT OR IGNORE INTO landing_settings (id) VALUES (1)');
  await execStatement(
    `UPDATE landing_settings SET
      hero_badge = COALESCE(NULLIF(hero_badge, ''), ?),
      hero_title = COALESCE(NULLIF(hero_title, ''), ?),
      hero_tagline = COALESCE(NULLIF(hero_tagline, ''), ?),
      hero_description = COALESCE(NULLIF(hero_description, ''), ?),
      about_title = COALESCE(NULLIF(about_title, ''), ?),
      mission_title = COALESCE(NULLIF(mission_title, ''), ?),
      mission_description = COALESCE(NULLIF(mission_description, ''), ?),
      team_title = COALESCE(NULLIF(team_title, ''), ?),
      team_description = COALESCE(NULLIF(team_description, ''), ?),
      achievements_title = COALESCE(NULLIF(achievements_title, ''), ?),
      achievements_description = COALESCE(NULLIF(achievements_description, ''), ?),
      contact_title = COALESCE(NULLIF(contact_title, ''), ?),
      contact_description = COALESCE(NULLIF(contact_description, ''), ?),
      contact_email = COALESCE(NULLIF(contact_email, ''), ?),
      hero_stats = COALESCE(NULLIF(hero_stats, ''), ?),
      mission_cards = COALESCE(NULLIF(mission_cards, ''), ?),
      core_stack_items = COALESCE(NULLIF(core_stack_items, ''), ?),
      team_filter_labels = COALESCE(NULLIF(team_filter_labels, ''), ?),
      achievement_items = COALESCE(NULLIF(achievement_items, ''), ?),
      contact_links = COALESCE(NULLIF(contact_links, ''), ?)
    WHERE id = 1`,
    [
      landingDefaults.hero_badge,
      landingDefaults.hero_title,
      landingDefaults.hero_tagline,
      landingDefaults.hero_description,
      landingDefaults.about_title,
      landingDefaults.mission_title,
      landingDefaults.mission_description,
      landingDefaults.team_title,
      landingDefaults.team_description,
      landingDefaults.achievements_title,
      landingDefaults.achievements_description,
      landingDefaults.contact_title,
      landingDefaults.contact_description,
      landingDefaults.contact_email,
      landingDefaults.hero_stats,
      landingDefaults.mission_cards,
      landingDefaults.core_stack_items,
      landingDefaults.team_filter_labels,
      landingDefaults.achievement_items,
      landingDefaults.contact_links,
    ],
  );
}

await initializeDatabase();

function prepareValue(table, column, value) {
  const meta = tableMeta[table];
  if (!meta) return value;
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (meta.bool.has(column)) return value ? 1 : 0;
  if (meta.json.has(column)) {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }
  return value;
}

function hydrateRow(table, row) {
  if (!row) return row;
  const meta = tableMeta[table];
  if (!meta) return row;
  const hydrated = { ...row };
  for (const col of meta.bool) {
    if (col in hydrated) hydrated[col] = Boolean(hydrated[col]);
  }
  for (const col of meta.json) {
    if (col in hydrated && typeof hydrated[col] === 'string' && hydrated[col] !== '') {
      try {
        hydrated[col] = JSON.parse(hydrated[col]);
      } catch {
        hydrated[col] = col === 'github_data' ? null : [];
      }
    } else if (col in hydrated && hydrated[col] == null) {
      hydrated[col] = col === 'github_data' ? null : [];
    }
  }
  return hydrated;
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.action = 'select';
    this.filters = [];
    this.orders = [];
    this.selectCols = '*';
    this.returningCols = '*';
    this.expectSingle = false;
    this.payload = null;
  }

  select(cols = '*') {
    if (this.action === 'insert' || this.action === 'update') {
      this.returningCols = cols || '*';
      return this;
    }
    this.action = 'select';
    this.selectCols = cols || '*';
    return this;
  }

  insert(payload) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, op: '=', value });
    return this;
  }

  gt(column, value) {
    this.filters.push({ column, op: '>', value });
    return this;
  }

  order(column, options = {}) {
    this.orders.push({ column, ascending: options.ascending !== false });
    return this;
  }

  single() {
    this.expectSingle = true;
    return this;
  }

  then(resolve, reject) {
    this.execute().then(resolve, reject);
  }

  async execute() {
    try {
      if (this.action === 'select') return this.execSelect();
      if (this.action === 'insert') return this.execInsert();
      if (this.action === 'update') return this.execUpdate();
      if (this.action === 'delete') return this.execDelete();
      return { data: null, error: new Error('Unsupported action') };
    } catch (error) {
      return { data: null, error };
    }
  }

  buildWhere() {
    if (!this.filters.length) return { sql: '', params: [] };
    const clauses = [];
    const params = [];
    for (const filter of this.filters) {
      clauses.push(`${filter.column} ${filter.op} ?`);
      params.push(prepareValue(this.table, filter.column, filter.value));
    }
    return { sql: ` WHERE ${clauses.join(' AND ')}`, params };
  }

  normalizeSelectCols(cols) {
    if (!cols || cols === '*') return '*';
    return cols.split(',').map((c) => c.trim()).filter(Boolean).join(', ');
  }

  async execSelect() {
    const where = this.buildWhere();
    const cols = this.normalizeSelectCols(this.selectCols);
    let sql = `SELECT ${cols} FROM ${this.table}${where.sql}`;
    if (this.orders.length) {
      sql += ` ORDER BY ${this.orders.map((o) => `${o.column} ${o.ascending ? 'ASC' : 'DESC'}`).join(', ')}`;
    }
    if (this.expectSingle) sql += ' LIMIT 1';
    const result = await execStatement(sql, where.params);
    const rows = (result.rows || []).map((row) => hydrateRow(this.table, row));
    return { data: this.expectSingle ? (rows[0] || null) : rows, error: null };
  }

  async execInsert() {
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
    const insertedIds = [];
    for (const row of rows) {
      const filtered = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
      const columns = Object.keys(filtered);
      if (!columns.length) continue;
      const values = columns.map((column) => prepareValue(this.table, column, filtered[column]));
      const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
      const info = await execStatement(sql, values);
      insertedIds.push(Number(info.lastInsertRowid));
    }

    if (!insertedIds.length) return { data: this.expectSingle ? null : [], error: null };
    const cols = this.normalizeSelectCols(this.returningCols);
    const rowsOut = [];
    for (const id of insertedIds) {
      const selected = await execStatement(`SELECT ${cols} FROM ${this.table} WHERE id = ?`, [id]);
      const row = selected.rows?.[0];
      if (row) rowsOut.push(hydrateRow(this.table, row));
    }
    return { data: this.expectSingle ? (rowsOut[0] || null) : rowsOut, error: null };
  }

  async execUpdate() {
    const filtered = Object.fromEntries(Object.entries(this.payload || {}).filter(([, value]) => value !== undefined));
    const setColumns = Object.keys(filtered);
    if (!setColumns.length) return { data: this.expectSingle ? null : [], error: null };
    const setSql = setColumns.map((column) => `${column} = ?`).join(', ');
    const setParams = setColumns.map((column) => prepareValue(this.table, column, filtered[column]));
    const where = this.buildWhere();
    await execStatement(`UPDATE ${this.table} SET ${setSql}${where.sql}`, [...setParams, ...where.params]);
    let selectSql = `SELECT ${this.normalizeSelectCols(this.returningCols)} FROM ${this.table}${where.sql}`;
    if (this.expectSingle) selectSql += ' LIMIT 1';
    const selected = await execStatement(selectSql, where.params);
    const rows = (selected.rows || []).map((row) => hydrateRow(this.table, row));
    return { data: this.expectSingle ? (rows[0] || null) : rows, error: null };
  }

  async execDelete() {
    const where = this.buildWhere();
    await execStatement(`DELETE FROM ${this.table}${where.sql}`, where.params);
    return { data: null, error: null };
  }
}

const supabase = {
  from(table) {
    return new QueryBuilder(table);
  },
};

export default supabase;
