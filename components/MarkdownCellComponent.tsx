import { Box, Stack } from '@mui/material';
import type GithubSlugger from 'github-slugger';
import { MDXRemote } from 'next-mdx-remote';
import { ReactNode, createElement } from 'react';
import { ActivityVariant, MarkdownCell, NotebookCell } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';
import { COLORIZE_CLASSNAME } from './CodeEditor';
import ActivityLink from './markdown/ActivityLink';
import DoNowBox from './markdown/DoNowBox';
import TaskBox from './markdown/TaskBox';
import Icon from './markdown/Icon';
import PyTamaroAPI from './PyTamaroAPI';
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

function PyTamaroAPIComponent(
  name: string,
  activityVariant: ActivityVariant,
  lang?: string,
) {
  return (
    <PyTamaroAPI name={name} activityVariant={activityVariant} language={lang} />
  );
}

function codeComponent(props: any) {
  const codeProps : Record<string, string> = {};
  if (props.className === 'language-python') {
    codeProps['data-lang'] = 'python';
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

function headerComponent(slugger: GithubSlugger, props: any, level: string) {
  const id = slugger.slug(props.children);
  return createElement(
    level,
    { id: `header-${id}` },
    props.children,
  );
}

export default function MarkdownCellComponent({ slugger, cell, activityVariant } :
{ slugger: GithubSlugger, cell: MarkdownCell, activityVariant: ActivityVariant }) {
  const adHocComponents = {
    img: (props: any) => (
      imgComponent(props, cell, activityVariant.authorSlug, activityVariant.activitySlug)
    ),
    code: codeComponent,
    ReactPlayer: ResponsiveReactPlayer,
    Stack,
    API: ({ lang, children: name }: { lang?: string, children: string }) => (
      PyTamaroAPIComponent(name, activityVariant, lang)
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
    Icon: ({ children, size = 24, color = 'black' }: { children: string, name: string, size?: number, color?: string }) => (
      Icon({ children, size, color })
    ),
    h1: (props: any) => headerComponent(slugger, props, 'h1'),
    h2: (props: any) => headerComponent(slugger, props, 'h2'),
    h3: (props: any) => headerComponent(slugger, props, 'h3'),
    h4: (props: any) => headerComponent(slugger, props, 'h4'),
    h5: (props: any) => headerComponent(slugger, props, 'h5'),
    h6: (props: any) => headerComponent(slugger, props, 'h6'),
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
