import axios from 'axios';

export interface ExecutionResponse {
  type: string,
  content: any
}

export async function executeCode(previousCellsSource: string, currentCellSource: string)
  : Promise<ExecutionResponse | undefined> {
  try {
    return (await axios.post('/api/execute', {
      previousCellsSource,
      currentCellSource,
    })).data;
  } catch (e) {
    return undefined;
  }
}
