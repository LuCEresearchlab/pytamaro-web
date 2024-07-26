import {Box, Button, FormControlLabel, FormGroup, Switch, Typography,} from '@mui/material';
import Link from 'next/link';
import {useState} from 'react';
import {ToolboxFunction} from '../../src/localStorage/schema';
import {toolboxActivityVariant} from '../../src/specialActivities';
import {activityVariantPathname, toolboxFunctionPathname} from '../../src/urlUtils';
import useReadOnlyTemporaryActivity from '../../src/useReadOnlyTemporaryActivity';
import CodeEditor from '../CodeEditor';
import SolitaryCodeCell, {initialStateSingleCell} from '../SolitaryCodeCell';
import {json_obj_type, library_string, translateToFunction} from '../../src/JsonAst/Json_structure';
import DocumentationCardContent from "./DocumentationCardContent";
import {TFunction} from "i18next";
import useLocalTranslation from "../../src/localStorage/useLocalTranslation";

let t: TFunction<string[], undefined>

export default function ToolboxFunctionCardContent(
    {
        fn,
        summary = false
    }:
        Readonly<{
            fn: ToolboxFunction
            summary?: boolean
        }>,
) {
    const translated = translateToFunction(fn)
    t = useLocalTranslation().t;

    return (
        <DocumentationCardContent obj={translated} obj_type={json_obj_type.function} library={library_string.Toolbox}
                                  ImplementationAndUsage={ImplementationAndUsage(fn, summary)}
                                  LinkButton={LinkButton(fn, summary)}
                                  showTypeInitial={true}/>
    );
}

function LinkButton(fn: ToolboxFunction, summary: boolean): JSX.Element {
    return <Button
        component={Link}
        href={summary ? toolboxFunctionPathname(fn.name) : activityVariantPathname(fn.originalActivity)}
        target="_blank"
        variant="outlined"
        size="small"
        sx={{ml: 'auto'}}
    >
        {summary ? t('documentationPopUp.viewDetails') : t('documentationPopUp.viewOriginalActivity')}
    </Button>
}

function ImplementationAndUsage(fn: ToolboxFunction, summary: boolean) {
    const [showSource, setShowSource] = useState(false);
    const [showUsage, setShowUsage] = useState(summary);
    const toggleShowSource = () => setShowSource(!showSource);
    const toggleShowUsage = () => setShowUsage(!showUsage);
    const usageCodeCells = initialStateSingleCell(fn.usage);
    const activityVariant = toolboxActivityVariant(fn.name);
    const activity = useReadOnlyTemporaryActivity(usageCodeCells, activityVariant);

    return <>{!summary && (
        <Box sx={{my: 2}}>
            <Typography color="text.secondary" fontWeight="bold" component="span">
                {t("documentationPopUp.implementation")}
            </Typography>
            <FormGroup sx={{
                display: 'inline',
                marginLeft: 2
            }}>
                <FormControlLabel
                    control={<Switch checked={showSource} onChange={toggleShowSource}/>}
                    label={<Typography
                        color="text.secondary">{showSource ? t('hide') : t('show')}</Typography>}
                />
            </FormGroup>
            {showSource && (
                <CodeEditor
                    initialSource={fn.source}
                    currentSource={fn.source}
                    readOnly
                />
            )}
        </Box>
    )}
        <Typography color="text.secondary" fontWeight="bold" component="span" gutterBottom>
            {t("documentationPopUp.usage")}
        </Typography>
        {!summary && (
            <FormGroup sx={{
                display: 'inline',
                marginLeft: 2
            }}>
                <FormControlLabel
                    control={<Switch checked={showUsage} onChange={toggleShowUsage}/>}
                    label={<Typography
                        color="text.secondary">{showUsage ? t('hide') : t('show')}</Typography>}
                />
            </FormGroup>
        )}
        {showUsage && (
            <SolitaryCodeCell
                activity={activity}
                activityVariant={activityVariant}
                readOnly
            />
        )}</>
}


