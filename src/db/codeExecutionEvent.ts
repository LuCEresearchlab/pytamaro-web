import conn from './dbConnection';

const EVENT_NAME = 'code_execution';

export default async function saveCodeExecutionEvent(
  code: string,
  activity_variant: string,
  docker_image: string,
  user_uuid: string,
) : Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const [event] = await sql`
        INSERT INTO events (
          user_uuid,
          event_type
        ) VALUES (
          ${user_uuid},
          ${EVENT_NAME}
        ) RETURNING id
      `;

      await sql`
        INSERT INTO events_code_execution (
          id,
          docker_image,
          activity_variant,
          source
        ) VALUES (
          ${event.id},
          ${docker_image},
          ${activity_variant},
          ${code}
        )
      `;
    });
    return true;
  } catch {
    return false;
  }
}
