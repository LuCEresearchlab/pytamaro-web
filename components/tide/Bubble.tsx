export function ErrorBubble(props: React.PropsWithChildren) {
  const { children } = props;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '15px 25px 20px',
        color: 'black',
        background: '#ffe600',
        borderRadius: '25px',
        transform: 'translateY(-100%) translateY(-40px) translateX(-60%)',
        filter: 'drop-shadow(0px 0px 4px black) drop-shadow(0px 0px 2px black)',
        fontSize: '32px',
      }}
    >
      {children}
      <div
        style={{
          content: '',
          position: 'absolute',
          top: '100%',
          right: '40%',
          borderWidth: '30px 0px 0 30px',
          borderStyle: 'solid',
          borderColor: '#ffe600 transparent',
        }}
      ></div>
    </div>
  );
}
