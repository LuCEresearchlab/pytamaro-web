import postgres from 'postgres';

export async function storeRow(
  sql: postgres.TransactionSql,
  table: string,
  columnsvalues: object,
  returnId: boolean = true,
) : Promise<number> {
  const rows = await sql`INSERT INTO ${sql(table)} ${sql(columnsvalues)} ${returnId ? sql`RETURNING id` : sql``}`;
  return returnId ? rows[0].id : undefined;
}

export async function storeRowWithoutId(
  sql: postgres.TransactionSql,
  table: string,
  columnsvalues: object,
) {
  storeRow(sql, table, columnsvalues, false);
}

export async function storeOrRetrieveRow(
  sql: postgres.TransactionSql,
  table: string,
  columnsvalues: object,
) {
  const clauses = Object.entries(columnsvalues).map(([column, value]) => sql`${sql(column)} = ${value}`);
  const filters = clauses.reduce((acc, clause) => sql`${acc} AND ${clause}`);
  const rows = await sql`SELECT id FROM ${sql(table)} WHERE ${filters}`;
  if (rows.length > 0) {
    return rows[0].id;
  }
  return storeRow(sql, table, columnsvalues);
}
