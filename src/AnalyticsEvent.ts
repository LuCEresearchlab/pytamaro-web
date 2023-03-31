export enum EventName {
  CodeExecution = 'CodeExecution',
  APIDocsPopover = 'APIDocsPopover',
}

export default function logEvent(eventName: EventName, props: any) {
  // Log for analytics (`plausible` is added globally in the browser by `plausible-next`
  // in a production environment)
  // @ts-ignore
  if (typeof plausible !== 'undefined') {
    // @ts-ignore
    plausible(eventName, { props });
  }
}
