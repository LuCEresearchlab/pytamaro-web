import axios from 'axios';

export interface ExecutionResponse {
  type: string,
  content: any
}

export async function executeCode(source: string) : Promise<ExecutionResponse | undefined> {
  try {
    return (await axios.post('/api/execute', {
      code: source,
    })).data;
  } catch (e) {
    return undefined;
  }
}
