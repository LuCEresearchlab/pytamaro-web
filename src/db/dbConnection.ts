import postgres from 'postgres';

const conn = postgres({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  debug: true,
});

export default conn;
