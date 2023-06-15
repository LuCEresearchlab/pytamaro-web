import { Box, Stack } from '@mui/material';
import { MDXRemote } from 'next-mdx-remote';
import { ReactNode } from 'react';
import { ActivityVariant, MarkdownCell, NotebookCell } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';
import ActivityLink from './ActivityLink';
import DoNowBox from './DoNowBox';
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
        />
      </picture>
    </Box>
  );
}

function PyTamaroAPIComponent(
  name: string,
  activityVariant: ActivityVariant,
) {
  return (
    <PyTamaroAPI name={name} activityVariant={activityVariant} />
  );
}

export default function MarkdownCellComponent({ cell, activityVariant } :
{ cell: MarkdownCell, activityVariant: ActivityVariant }) {
  const adHocComponents = {
    img: (props: any) => (
      imgComponent(props, cell, activityVariant.authorSlug, activityVariant.activitySlug)
    ),
    ReactPlayer: ResponsiveReactPlayer,
    Stack,
    API: ({ children: name }: { children: string }) => (
      PyTamaroAPIComponent(name, activityVariant)
    ),
    Activity: ActivityLink,
    DoNow: ({ id, children } : { id: string, children: ReactNode }) => (
      DoNowBox({ id, children, activityVariant })
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
