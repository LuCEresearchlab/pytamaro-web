import {
    Box, Button, Card, CardActions,
    CardContent, ClickAwayListener, Tooltip,
    Typography
} from '@mui/material';
import theme from '../../src/theme';
import {Function, json_obj_type, translateToFunction, Type, Variable} from '../../src/JsonAst/Json_structure';
import React, {useState} from "react";
import useLocalTranslation from "../../src/localStorage/useLocalTranslation";
import {TFunction} from "i18next";
import {functionSignature} from "../../src/JsonAst/Json_structure";
import Popup from "../Popup.tsx";
import DocumentationCardContent from "./DocumentationCardContent.tsx";
import ToolboxFunctionCardContent from "./ToolboxFunctionCardContent.tsx";
import {ToolboxFunction} from "../../src/localStorage/schema.ts";
import {toolboxFunctionAnchor} from "../../src/urlUtils.ts";
import EditToolboxFunctionButton from "../EditToolboxFunctionButton.tsx";
import {useConfirm} from "material-ui-confirm";
import logAnalyticsEvent, {AnalyticsEventName} from "../../src/analyticsEvent.ts";
import {EventName, storeDbEvent} from "../../src/storeDbEvent.ts";
import useLocalProfile from "../../src/localStorage/useLocalProfile.ts";
import useLocalToolbox from "../../src/localStorage/useLocalToolbox.ts";

let t: TFunction<string[], undefined>

export default function SmallDocumentationCard({
                                                   obj,
                                                   obj_type = json_obj_type.function,
                                               }: Readonly<{
    obj: Function | Type | Variable | ToolboxFunction,
    obj_type?: json_obj_type,
}>) {
    t = useLocalTranslation().t;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const confirm = useConfirm();
    const {metadata} = useLocalProfile();
    const {list, deleteFunction} = useLocalToolbox();

    const askDeleteToolboxFunction = (fn: ToolboxFunction) => {
        confirm({
            description:
                <>
                    <Typography gutterBottom>
                        Deleting the function
                        {' '}
                        <Typography fontFamily={theme.pytamaro.monospaceFontFamily}
                                    component="span">{fn.name}</Typography>
                        {' '}
                        will break every activity and every other toolbox function that imports it.
                    </Typography>
                    <Typography gutterBottom>
                        If no activity and no other toolbox function uses this function,
                        then it is perfectly fine to delete it.
                    </Typography>
                    <Typography gutterBottom>
                        You can change all the details of this function (except for its name) using the Edit button.
                    </Typography>
                </>,
            title: 'Are you sure you want to delete this function?',
            confirmationText: 'I understand, Delete',

        }).then(() => {
            logAnalyticsEvent(AnalyticsEventName.DeleteToolboxFunction, {name: fn.name});
            storeDbEvent(EventName.DeleteToolboxFunction, metadata, {fn});
            deleteFunction(fn);
        });
    };

    return (
        <ClickAwayListener onClickAway={handlePopoverClose}>
            <span style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                width: "100%"
            }}>
                <Tooltip title={t("documentationPopUp.clickToSeeMore")} arrow placement="bottom" sx={{minWidth: '100%'}}>
                    <Card key={obj.name + "-" + obj_type + "-"} id={obj.name} sx={{overflow: 'visible', minWidth: '100%'}}>
                    <CardContent sx={{pb: 1, maxWidth: '100ch'}} onClick={handlePopoverOpen}>
                        <Box display="block" sx={{alignContent: 'center'}}>
                             <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold"
                                         alignContent="center">
                                {t("documentationPopUp." + obj_type?.toLowerCase())}
                            </Typography>
                            <Typography color="text.secondary" component="span" mr="1ch"
                                        alignContent="center">
                                from {(obj_type == json_obj_type.toolbox) ? "toolbox" : "pytamaro"}
                            </Typography>
                        </Box>
                        <Box display="block" sx={{alignContent: 'center'}}>
                            <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}
                                        bgcolor="#e7f2fa"
                                        borderTop="3px solid #6ab0de" alignContent="center">
                                {(obj_type == json_obj_type.function) ? functionSignature((obj as Function), true, true) :
                                    (obj_type == json_obj_type.toolbox) ? functionSignature(translateToFunction((obj as ToolboxFunction)), true, true)
                                        : obj.name}
                            </Typography>
                    </Box>
                    </CardContent>
                    </Card>
                </Tooltip>
                <Popup id="mouse-onclick-popover" anchorEl={anchorEl} open={open} placement="right">
                        {(obj_type == json_obj_type.toolbox) ?
                            <Card key={obj.name} id={toolboxFunctionAnchor(obj.name)} className="anchor"
                                  sx={{overflow: 'visible'}}>
                                <ToolboxFunctionCardContent fn={obj as ToolboxFunction}/>
                                <CardActions sx={{justifyContent: 'center'}}>
                                    <EditToolboxFunctionButton toolboxFunction={obj as ToolboxFunction}/>
                                    <Button
                                        onClick={() => askDeleteToolboxFunction(obj as ToolboxFunction)}
                                        color="error"
                                        variant="contained"
                                    >
                                        Delete Function
                                    </Button>
                                </CardActions>
                            </Card>
                            :
                            <Card key={obj.name} id={obj_type + obj.name}>
                                <DocumentationCardContent obj={(obj as Function | Type | Variable)}
                                                          obj_type={obj_type}/>
                            </Card>}
                </Popup>
                            </span>
        </ClickAwayListener>
    );
}






