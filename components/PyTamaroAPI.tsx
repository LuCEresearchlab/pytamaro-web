/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import {
    Container, Popover, Typography, useTheme,
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useState} from 'react';
import logAnalyticsEvent, {AnalyticsEventName} from '../src/analyticsEvent';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import names from '../src/pytamaroNames';
import {ActivityVariant} from '../src/schemas/activitySchema';
import {EventName, storeDbEvent} from '../src/storeDbEvent';
import {JsonConverter} from "../src/JsonAst/JsonConverter.ts";
import ToolboxFunctionCardContent from "./ToolboxFunctionCardContent.tsx";

export default function PyTamaroAPI({
                                        name, language = undefined, activityVariant, smallerFont = false,
                                    }:
                                        {
                                            name: string,
                                            language?: string | undefined,
                                            activityVariant: ActivityVariant,
                                            smallerFont?: boolean
                                        }) {
    // When not provided explicitly, the language is inferred from the activity variant.
    const nameWithLang = `${language || activityVariant.language}.${name}`;
    const nameInfo = names[nameWithLang];

    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();
    const {metadata} = useLocalProfile();

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        // When the popover is open for at least 2 seconds, track the event.
        setTimeoutId(setTimeout(() => {
            logAnalyticsEvent(AnalyticsEventName.APIDocsPopover, {name: nameWithLang});
            storeDbEvent(EventName.APILookup, metadata, {activityVariant, name});
        }, 2000));
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    };

    const open = Boolean(anchorEl);

    // const {isLoading, error, data} = useQuery({
    //     queryKey: [`docs-${nameWithLang}`],
    //     queryFn: () => axios.get(`https://readthedocs.org/api/v3/embed/?${new URLSearchParams({
    //         url: `https://pytamaro.readthedocs.io/en/stable/${nameInfo.url}.html`,
    //     })}`)
    //         .then((response) => {
    //             // We climb up the DOM tree one level to find the element that contains both
    //             // <dt> and <dd> (term and description).
    //             const tmpElement = document.createElement('div');
    //             tmpElement.innerHTML = response.data.content;
    //             const node = tmpElement.querySelector(`[id="${nameInfo.fqname}"]`)?.parentElement;
    //             return node?.outerHTML || '';
    //         }),
    // });

    const {isLoading, error, data} = useQuery({
        queryKey: [`docs-${nameWithLang}`],
        queryFn: () => axios.get(`/api/json_doc?name=${name}&language=${language || activityVariant.language}`
        )
            .then((response) => {
                // We climb up the DOM tree one level to find the element that contains both
                // <dt> and <dd> (term and description).
                return response.data
            }),
    });

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'baseline',
        }}
        >
      <img
          src="/favicon.ico"
          style={{
              height: smallerFont ? '0.8em' : '1em',
              width: 'auto',
              display: 'inline-block',
              transform: `translateY(.${smallerFont ? '1' : '2'}em)`,
              paddingRight: '.1em',
          }}
          alt="PyTamaro icon"
      />
      <Typography
          component="span"
          aria-owns={open ? 'mouse-over-popover' : undefined}
          aria-haspopup="true"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          style={{
              color: theme.pytamaro.redColor,
              fontSize: smallerFont ? '0.8em' : '1em',
              fontFamily: theme.pytamaro.monospaceFontFamily,
          }}
      >
        {name}
      </Typography>
      <Popover
          id="mouse-over-popover"
          sx={{
              pointerEvents: 'none',
              ml: 0.5,
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
          }}
          transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
      >
        {isLoading ? <Typography component="span">Loading the documentation...</Typography> : null}
          {error ? <Typography component="span">Failed to load the documentation.</Typography> : null}
          {/*{data ?<Container disableGutters maxWidth="md" className="rst-content"*/}
          {/*                                                   sx={{p: 1}}*/}
          {/*                                                   dangerouslySetInnerHTML={{__html: data}}/> : null}*/}
          {/*    TODO: add <ToolboxFunctionCardContent fn={fn} /> in the popover*/}
          {/*{data ? <div> <p>{JSON.stringify(data)}</p> </div>: null}*/}
          {data ? <ToolboxFunctionCardContent fn={data.obj} from_pyTamaro={true} obj_type={data.obj_type}/> : null}
      </Popover>
    </span>
    );
}
