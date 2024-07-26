/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import {
    Card,
    ClickAwayListener,
    Popover, Tooltip, Typography, useTheme,
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useState} from 'react';
import logAnalyticsEvent, {AnalyticsEventName} from '../src/analyticsEvent';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import {ActivityVariant} from '../src/schemas/activitySchema';
import {EventName, storeDbEvent} from '../src/storeDbEvent';
import DocumentationCardContent from "./documentation/DocumentationCardContent.tsx";
import Popup from "./Popup.tsx";
import useLocalTranslation from "../src/localStorage/useLocalTranslation.ts";



export default function PyTamaroAPI({
                                        name, language = undefined, activityVariant, smallerFont = false,
                                    }:
                                        Readonly<{
                                            name: string,
                                            language?: string | undefined,
                                            activityVariant: ActivityVariant,
                                            smallerFont?: boolean
                                        }>) {
    // When not provided explicitly, the language is inferred from the activity variant.
    const nameWithLang = `${language ?? activityVariant.language}.${name}`;
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();
    const {metadata} = useLocalProfile();

    const { t } = useLocalTranslation();

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

    const {isLoading, error, data} = useQuery({
        queryKey: [`docs-${nameWithLang}`],
        queryFn: () => axios.get(`/api/json_doc?name=${name}&language=${language ?? activityVariant.language}`
        )
            .then((response) => {
                return response.data
            }),
    });

    return (
        <ClickAwayListener onClickAway={handlePopoverClose}>
            <span style={{
                display: 'inline-flex',
                alignItems: 'baseline',
            }}>
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
                <Tooltip title={t("documentationPopUp.clickToSeeMore")} arrow placement="bottom">
                    <Typography
                        component="span"
                        aria-owns={open ? 'mouse-onclick-popover' : undefined}
                        aria-haspopup="true"
                        onClick={handlePopoverOpen}
                        style={{
                            color: theme.pytamaro.redColor,
                            fontSize: smallerFont ? '0.8em' : '1em',
                            fontFamily: theme.pytamaro.monospaceFontFamily,
                        }}
                    >
                        {name}
                    </Typography>
                </Tooltip>
                <Popup id="mouse-onclick-popover" anchorEl={anchorEl} open={open} placement="right">
                    <Card>
                        {isLoading ? <Typography component="span">{t("documentationPopUp.loading")}</Typography> : null}
                        {error ? <Typography component="span">{t("documentationPopUp.failed")}</Typography> : null}
                        {data ? <DocumentationCardContent obj={data.obj} obj_type={data.obj_type} library={data.library}/> : null}
                    </Card>
                </Popup>
            </span>
        </ClickAwayListener>
    );
}
