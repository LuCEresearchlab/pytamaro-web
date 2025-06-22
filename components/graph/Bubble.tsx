import '../../style/bubble.css';

export function ErrorBubble(props: React.PropsWithChildren<{}>) {
  const { children } = props;

  return (
    <div className='error-bubble'>
      {children}
      <div className='quote' />
    </div>
  );
}
