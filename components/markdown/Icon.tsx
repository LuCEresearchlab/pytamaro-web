import theme from '../../src/theme';

function camelToSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([0-9])([a-zA-Z])/g, '_$1_$2')
    .toLowerCase();
}

export default function Icon({
  children,
  size = theme.typography.body1.fontSize?.valueOf(),
  color = 'black',
}: {
  children: string;
  size?: string | number;
  color?: string;
}) {
  const style = {
    fontFamily: 'Material Icons',
    fontSize: `${size}px`,
    color,
  };

  let childrenString: string;

  // Check to handle the case were children
  // was written with newlines, ecc. in the markdown
  if (
    typeof children === 'object'
    && children !== null
    && 'props' in children
  ) {
    childrenString = (children as any).props.children;
  } else {
    childrenString = children as string;
  }

  const parsedChildren = camelToSnakeCase(childrenString);

  return <span style={style}>{parsedChildren}</span>;
}
