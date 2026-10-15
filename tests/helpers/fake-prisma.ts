/**
 * Mini-Prisma en mémoire pour les tests d'API.
 *
 * Objectif : que les tests prouvent l'ISOLEMENT entre utilisateurs. Le faux client applique donc
 * réellement les filtres `where` (égalité, AND/OR/NOT, startsWith, null, filtres de relation) :
 * une requête qui oublie `userId` renvoie bien la ressource d'un autre utilisateur, et le test échoue.
 * Comme Prisma, une valeur `undefined` dans un `where` est IGNORÉE (piège classique).
 * Tout opérateur non géré lève une erreur plutôt que de passer silencieusement.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const TABLES = [
  'user',
  'organization',
  'actionStatus',
  'activityLog',
  'audit',
  'auditResponse',
  'strategicAction',
  'complianceScore',
  'ebook',
  'ebookQuiz',
  'readingSession',
  'actionPlanItem',
  'actionReminder',
  'contact',
  'decisionLogEntry',
  'internalNote',
  'control',
  'evidence',
  'risk',
  'incidentCase',
  'clientVulnerability',
  'policyTemplate',
  'clientPolicyDocument',
] as const;
type Table = (typeof TABLES)[number];

const db: Record<Table, Row[]> = Object.fromEntries(TABLES.map((t) => [t, []])) as any;

// Relation « appartient à » (filtre where imbriqué + include)
const BELONGS_TO: Partial<Record<Table, Record<string, { table: Table; fk: string }>>> = {
  auditResponse: { audit: { table: 'audit', fk: 'auditId' } },
  ebookQuiz: { ebook: { table: 'ebook', fk: 'ebookId' } },
};
// Relation « a plusieurs » (include)
const HAS_MANY: Partial<Record<Table, Record<string, { table: Table; fk: string }>>> = {
  audit: {
    responses: { table: 'auditResponse', fk: 'auditId' },
    strategicActions: { table: 'strategicAction', fk: 'auditId' },
    complianceScores: { table: 'complianceScore', fk: 'auditId' },
  },
  organization: {
    contacts: { table: 'contact', fk: 'organizationId' },
    decisions: { table: 'decisionLogEntry', fk: 'organizationId' },
    internalNotes: { table: 'internalNote', fk: 'organizationId' },
    controls: { table: 'control', fk: 'organizationId' },
  },
  control: {
    evidences: { table: 'evidence', fk: 'controlId' },
  },
  ebook: {
    readingSessions: { table: 'readingSession', fk: 'ebookId' },
    quizzes: { table: 'ebookQuiz', fk: 'ebookId' },
  },
  actionPlanItem: {
    reminders: { table: 'actionReminder', fk: 'actionPlanItemId' },
  },
};

let counter = 0;
const newId = (prefix: string) => `${prefix}-${++counter}`;

function matches(table: Table, row: Row, where: Row | undefined): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, cond]) => {
    if (cond === undefined) return true; // comportement Prisma
    if (key === 'AND') return ([] as Row[]).concat(cond).every((w) => matches(table, row, w));
    if (key === 'OR') return ([] as Row[]).concat(cond).some((w) => matches(table, row, w));
    if (key === 'NOT') return !([] as Row[]).concat(cond).some((w) => matches(table, row, w));

    const rel = BELONGS_TO[table]?.[key];
    if (rel) {
      const related = db[rel.table].find((r) => r.id === row[rel.fk]);
      return !!related && matches(rel.table, related, cond);
    }

    if (cond === null) return row[key] == null;
    if (typeof cond === 'object' && !(cond instanceof Date)) {
      if ('startsWith' in cond) {
        return typeof row[key] === 'string' && row[key].startsWith(cond.startsWith);
      }
      throw new Error(`fake-prisma : opérateur non géré sur ${table}.${key} : ${JSON.stringify(cond)}`);
    }
    return row[key] === cond;
  });
}

/** Résout une relation (HAS_MANY ou BELONGS_TO) qu'elle soit déclarée via `select` ou `include` :
 * Prisma accepte les deux (`select: { responses: { select: {...} } }` fonctionne tout autant
 * qu'`include: { responses: {...} }`), donc le faux client doit traiter les deux pareil. */
function resolveRelation(table: Table, row: Row, key: string, opts: unknown): unknown {
  const many = HAS_MANY[table]?.[key];
  const one = BELONGS_TO[table]?.[key];
  const o = opts === true ? {} : (opts as Row);
  if (many) {
    return db[many.table]
      .filter((r) => r[many.fk] === row.id && matches(many.table, r, o.where))
      .map((r) => project(r, o.select, many.table));
  }
  if (one) {
    const related = db[one.table].find((r) => r.id === row[one.fk]);
    return related ? project(related, o.select, one.table) : null;
  }
  throw new Error(`fake-prisma : relation non gérée ${table}.${key}`);
}

function project(row: Row, select?: Row, table?: Table): Row {
  if (!select) return { ...row };
  const out: Row = {};
  for (const [key, val] of Object.entries(select)) {
    if (!val) continue;
    const isRelation = table && (HAS_MANY[table]?.[key] || BELONGS_TO[table]?.[key]);
    out[key] = isRelation ? resolveRelation(table!, row, key, val) : row[key];
  }
  return out;
}

function withIncludes(table: Table, row: Row, include?: Row): Row {
  const out = { ...row };
  for (const [key, opts] of Object.entries(include ?? {})) {
    const many = HAS_MANY[table]?.[key];
    const one = BELONGS_TO[table]?.[key];
    if (many || one) {
      out[key] = resolveRelation(table, row, key, opts);
    } else {
      throw new Error(`fake-prisma : include non géré ${table}.${key}`);
    }
  }
  return out;
}

/** Compare deux valeurs pour un tri : null/undefined toujours placés en dernier, quel que soit le sens. */
function compareValues(a: unknown, b: unknown, dir: 1 | -1): number {
  const aNull = a === null || a === undefined;
  const bNull = b === null || b === undefined;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  if (a instanceof Date || b instanceof Date) return dir * (+(a as Date) - +(b as Date));
  if (a === b) return 0;
  return dir * (a! > b! ? 1 : -1);
}

function sortRows(rows: Row[], orderBy: unknown): Row[] {
  if (!orderBy) return rows;
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const clause of clauses as Row[]) {
      for (const [key, dir] of Object.entries(clause)) {
        const cmp = compareValues(a[key], b[key], dir === 'desc' ? -1 : 1);
        if (cmp !== 0) return cmp;
      }
    }
    return 0;
  });
}

function model(table: Table) {
  const find = (args: Row = {}) => db[table].filter((r) => matches(table, r, args.where));
  return {
    async findFirst(args: Row = {}) {
      const rows = sortRows(find(args), args.orderBy);
      const row = rows[0];
      return row ? withIncludes(table, project(row, args.select, table), args.include) : null;
    },
    async findUnique(args: Row) {
      return model(table).findFirst(args);
    },
    async findMany(args: Row = {}) {
      const rows = sortRows(find(args), args.orderBy);
      return rows.map((r) => withIncludes(table, project(r, args.select, table), args.include));
    },
    async create(args: Row) {
      const { data, include, select } = args;
      const nested: Array<[Table, string, Row[]]> = [];
      const row: Row = { id: newId(table), createdAt: new Date(), updatedAt: new Date() };
      for (const [k, v] of Object.entries(data as Row)) {
        const many = HAS_MANY[table]?.[k];
        if (many && v && typeof v === 'object' && 'create' in (v as Row)) {
          nested.push([many.table, many.fk, (v as Row).create]);
        } else {
          row[k] = v;
        }
      }
      db[table].push(row);
      for (const [childTable, fk, items] of nested) {
        for (const item of items) db[childTable].push({ id: newId(childTable), ...item, [fk]: row.id });
      }
      return withIncludes(table, project(row, select, table), include);
    },
    async createMany(args: Row) {
      const dataArr: Row[] = Array.isArray(args.data) ? args.data : [args.data];
      for (const d of dataArr) {
        db[table].push({ id: newId(table), createdAt: new Date(), updatedAt: new Date(), ...d });
      }
      return { count: dataArr.length };
    },
    async update(args: Row) {
      const row = find({ where: args.where })[0];
      if (!row) throw new Error(`fake-prisma : update sans ligne correspondante sur ${table}`);
      Object.assign(row, args.data, { updatedAt: new Date() });
      return withIncludes(table, project(row, args.select, table), args.include);
    },
    async upsert(args: Row) {
      // where : { userId_actionId: { userId, actionId } } -> on aplatit la clé composite
      const where = Object.fromEntries(
        Object.entries(args.where).flatMap(([k, v]) => (v && typeof v === 'object' ? Object.entries(v as Row) : [[k, v]]))
      );
      const row = find({ where })[0];
      if (row) {
        Object.assign(row, args.update, { updatedAt: new Date() });
        return { ...row };
      }
      return model(table).create({ data: args.create });
    },
    async updateMany(args: Row) {
      const rows = find(args);
      for (const r of rows) Object.assign(r, args.data, { updatedAt: new Date() });
      return { count: rows.length };
    },
    async deleteMany(args: Row = {}) {
      const doomed = new Set(find(args));
      db[table] = db[table].filter((r) => !doomed.has(r));
      return { count: doomed.size };
    },
  };
}

export const fakePrisma = {
  user: model('user'),
  organization: model('organization'),
  actionStatus: model('actionStatus'),
  activityLog: model('activityLog'),
  complianceScore: model('complianceScore'),
  audit: model('audit'),
  auditResponse: model('auditResponse'),
  strategicAction: model('strategicAction'),
  ebook: model('ebook'),
  ebookQuiz: model('ebookQuiz'),
  readingSession: model('readingSession'),
  actionPlanItem: model('actionPlanItem'),
  actionReminder: model('actionReminder'),
  contact: model('contact'),
  decisionLogEntry: model('decisionLogEntry'),
  internalNote: model('internalNote'),
  control: model('control'),
  evidence: model('evidence'),
  risk: model('risk'),
  incidentCase: model('incidentCase'),
  clientVulnerability: model('clientVulnerability'),
  policyTemplate: model('policyTemplate'),
  clientPolicyDocument: model('clientPolicyDocument'),
  async $transaction(ops: Array<Promise<unknown>>) {
    return Promise.all(ops);
  },
};

/** Accès direct aux tables pour préparer les données et vérifier l'état final. */
export const tables = db;

export function resetDb() {
  for (const t of TABLES) db[t] = [];
}
