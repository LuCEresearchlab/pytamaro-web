import axios from 'axios';
import { Metadata } from './localStorage/schema';

export enum EventName {
  CodeExecution = 'code_execution',
  APILookup = 'api_lookup',
  UserFeedback = 'user_feedback',
  AddToolboxFunction = 'add_toolbox_function',
  DeleteToolboxFunction = 'delete_toolbox_function',
  DoNowCompleted = 'do_now_completed',
  CurriculumNavigation = 'curriculum_navigation',
}

export async function alwaysStoreDbEvent(
  event_name: EventName,
  metadata: Metadata,
  payload: object,
) {
  try {
    await axios.post(`/api/events/${event_name}`, {
      uuid: metadata.userUuid,
      experimentKey: metadata.experimentKey,
      semanticChecksEnabled: metadata.semanticChecksEnabled,
      ...payload,
    });
    return true;
  } catch {
    return false;
  }
}

export function storeDbEvent(
  event_name: EventName,
  metadata: Metadata,
  payload: object,
) {
  if (metadata.allowSharingAnonData) {
    alwaysStoreDbEvent(event_name, metadata, payload);
  }
}
