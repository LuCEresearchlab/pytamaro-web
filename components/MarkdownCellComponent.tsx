import { Box, Stack } from '@mui/material';
import { MDXRemote } from 'next-mdx-remote';
import { ReactNode } from 'react';
import { ActivityVariant, MarkdownCell, NotebookCell } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';
import InlineAPI from './documentation/InlineAPI';
import { STRICT_PYTHON3_LANG_ID } from './editor/strictPython3';
import { COLORIZE_CLASSNAME } from './editor/utils';
import ActivityLink from './markdown/ActivityLink';
import DoNowBox from './markdown/DoNowBox';
import TaskBox from './markdown/TaskBox';
import ResponsiveReactPlayer from './ResponsiveReactPlayer';

function imgSourceTransformer(
  src: string,
  cell: NotebookCell,
  authorSlug: string,
  activitySlug: string,
) {
  const attachmentPrefix = 'attachment:';
  if (src.startsWith(attachmentPrefix)) {
    const name = src.substring(attachmentPrefix.length);
    const attachment = cell.attachments[name];
    const mimeType = Object.keys(attachment)[0];
    const data = attachment[mimeType];
    return `data:${mimeType};base64,${data}`;
  }
  try {
    return new URL(src).href;
  } catch {
    return activityAssetPathname(authorSlug, activitySlug, src);
  }
}

function imgComponent(props: any, cell: NotebookCell, authorSlug: string, activitySlug: string) {
  const imgStyle = {
    ...props.style,
    // For mobile devices
    maxWidth: '100%',
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      component="span"
    >
      <picture>
        <img
        // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          alt={props.alt}
          src={imgSourceTransformer(props.src, cell, authorSlug, activitySlug)}
          style={imgStyle}
        />
      </picture>
    </Box>
  );
}

function InlineAPIComponent(
  name: string,
  activityVariant: ActivityVariant,
  lang?: string,
  module?: string,
) {
  return (
    <InlineAPI name={name} activityVariant={activityVariant} language={lang} module={module} />
  );
}

function codeComponent(props: any) {
  const codeProps : Record<string, string> = {};
  if (props.className === 'language-python') {
    codeProps['data-lang'] = STRICT_PYTHON3_LANG_ID;
    codeProps.className = COLORIZE_CLASSNAME;
  }
  let source = props.children;
  if (typeof source === 'string') {
    source = source.trim();
  }
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <code {...codeProps}>
      {source}
    </code>
  );
}

export default function MarkdownCellComponent({ cell, activityVariant } :
{ cell: MarkdownCell, activityVariant: ActivityVariant }) {
  const adHocComponents = {
    img: (props: any) => (
      imgComponent(props, cell, activityVariant.authorSlug, activityVariant.activitySlug)
    ),
    code: codeComponent,
    ReactPlayer: ResponsiveReactPlayer,
    Stack,
    API: ({ lang, module, children: name } :
    { lang?: string, module?: string, children: string }) => (
      InlineAPIComponent(name, activityVariant, lang, module)
    ),
    Activity: ActivityLink,
    DoNow: ({ id, requireAnswer = false, children } :
    { id: string, requireAnswer?: boolean, children: ReactNode }) => (
      DoNowBox({
        id, requireAnswer, children, activityVariant,
      })
    ),
    Task: ({ children }: { children: ReactNode }) => (
      TaskBox({ children })
    ),
  };
  return (
    <MDXRemote
    // eslint-disable-next-line react/jsx-props-no-spreading
      {...cell.mdxSource}
      key={cell.id}
      components={adHocComponents}
    />
  );
}
