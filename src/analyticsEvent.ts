export enum AnalyticsEventName {
  CodeExecution = 'CodeExecution',
  APIDocsPopover = 'APIDocsPopover',
  RecommendedActivity = 'RecommendedActivity',
}

export default function logAnalyticsEvent(eventName: AnalyticsEventName, props: any) {
  // Log for analytics (`plausible` is added globally in the browser by `plausible-next`
  // in a production environment)
  // @ts-ignore
  if (typeof plausible !== 'undefined') {
    // @ts-ignore
    plausible(eventName, { props });
  }
}
