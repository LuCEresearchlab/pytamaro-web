import axios from 'axios';

export interface ExecutionResponse {
  type: string,
  content: any
}

export async function executeCode(source: string) {
  return (await axios.post('/api/execute', {
    code: source,
  })).data;
}
