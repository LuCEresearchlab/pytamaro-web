export enum AnalyticsEventName {
  CodeExecution = 'CodeExecution',
  APIDocsPopover = 'APIDocsPopover',
  RecommendedActivity = 'RecommendedActivity',
  ActivityLink = 'ActivityLink',
  AddToolboxFunction = 'AddToolboxFunction',
  DeleteToolboxFunction = 'DeleteToolboxFunction',
  DoNowCompleted = 'DoNowCompleted',
  CodeExecutionInput = 'CodeExecutionInput',
  ExternalVideo = 'ExternalVideo',
}

export default function logAnalyticsEvent(
  eventName: AnalyticsEventName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
) {
  // Log for analytics (`plausible` is added globally in the browser by `plausible-next`
  // in a production environment)
  // @ts-expect-error check if `plausible` is defined
  if (typeof plausible !== 'undefined') {
    // @ts-expect-error `plausible` is defined by `plausible-next`
    plausible(eventName, { props });
  }
}
