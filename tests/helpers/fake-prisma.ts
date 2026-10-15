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
  ebook: {
    readingSessions: { table: 'readingSession', fk: 'ebookId' },
    quizzes: { table: 'ebookQuiz', fk: 'ebookId' },
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

function project(row: Row, select?: Row): Row {
  if (!select) return { ...row };
  return Object.fromEntries(Object.keys(select).filter((k) => select[k]).map((k) => [k, row[k]]));
}

function withIncludes(table: Table, row: Row, include?: Row): Row {
  const out = { ...row };
  for (const [key, opts] of Object.entries(include ?? {})) {
    const many = HAS_MANY[table]?.[key];
    const one = BELONGS_TO[table]?.[key];
    const o = opts === true ? {} : (opts as Row);
    if (many) {
      out[key] = db[many.table]
        .filter((r) => r[many.fk] === row.id && matches(many.table, r, o.where))
        .map((r) => project(r, o.select));
    } else if (one) {
      const related = db[one.table].find((r) => r.id === row[one.fk]);
      out[key] = related ? project(related, o.select) : null;
    } else {
      throw new Error(`fake-prisma : include non géré ${table}.${key}`);
    }
  }
  return out;
}

function model(table: Table) {
  const find = (args: Row = {}) => db[table].filter((r) => matches(table, r, args.where));
  return {
    async findFirst(args: Row = {}) {
      let rows = find(args);
      if (args.orderBy?.createdAt) {
        const dir = args.orderBy.createdAt === 'desc' ? -1 : 1;
        rows = [...rows].sort((a, b) => dir * (a.createdAt - b.createdAt));
      }
      const row = rows[0];
      return row ? withIncludes(table, project(row, args.select), args.include) : null;
    },
    async findUnique(args: Row) {
      return model(table).findFirst(args);
    },
    async findMany(args: Row = {}) {
      let rows = find(args);
      if (args.orderBy?.createdAt) {
        const dir = args.orderBy.createdAt === 'desc' ? -1 : 1;
        rows = [...rows].sort((a, b) => dir * (a.createdAt - b.createdAt));
      }
      return rows.map((r) => withIncludes(table, project(r, args.select), args.include));
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
      return withIncludes(table, project(row, select), include);
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
  async $transaction(ops: Array<Promise<unknown>>) {
    return Promise.all(ops);
  },
};

/** Accès direct aux tables pour préparer les données et vérifier l'état final. */
export const tables = db;

export function resetDb() {
  for (const t of TABLES) db[t] = [];
}
