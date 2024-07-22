import {
    Box,
    Container, Stack, styled,
    TextField, Tooltip, tooltipClasses, TooltipProps, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {debounce} from 'lodash';
import Head from 'next/head';
import {ChangeEvent, Fragment, useEffect, useState} from 'react';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import {translationProps} from '../src/serverSideTranslationProps';
import DocumentationGrid from "../components/documentation/DocumentationGrid.tsx";
import {DividedModule, JsonConverter, language_string} from "../src/JsonAst/JsonConverter";
import useLocalTranslation from "../src/localStorage/useLocalTranslation";
import SelectAll from '../components/SelectAll';
import useLocalToolbox from "../src/localStorage/useLocalToolbox.ts";


export default function Documentation({English, Italian, French, German}: {
    English: DividedModule,
    Italian: DividedModule,
    French: DividedModule,
    German: DividedModule
}) {
    const {t, i18n} = useLocalTranslation()
    const [filterNameDesc, setFilterNameDesc] = useState('');
    const handleNewFilter = (e: ChangeEvent<HTMLInputElement>) => {
        setFilterNameDesc(e.target.value);
    };

    let names: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }

    const typeOption = [
        {id: "function", label: "Function"},
        {id: "type", label: "Type"},
        {id: "constant", label: "Constant"},
        {id: "toolbox", label: "Toolbox function"}]
    const languageOption = [
        {id: "en", label: "English", obj: English},
        {id: "it", label: "Italian", obj: Italian},
        {id: "ge", label: "German", obj: German},
        {id: "fr", label: "French", obj: French}
    ]

    const {list, deleteFunction} = useLocalToolbox();

    const initialLanguage = [languageOption.find(lang => lang.id == i18n.language) || languageOption[0]]
    const [allowedTypes, setAllowedTypes] = useState<string[]>(typeOption.map(opt => opt.id));
    const [allowedLanguages, setAllowedLanguages] = useState<string[]>(initialLanguage.map(lang => lang.id));
    const [filteredNames, setFilteredNames] = useState<DividedModule>(names);
    const [showToolbox, setShowToolbox] = useState<boolean>(allowedTypes.includes(typeOption[3].id));
    // let showToolbox = true;
    const toolboxFunctions = list();

    useEffect(() => {
        names.functions = []
        names.types = []
        names.variables = []

        for (let lang of allowedLanguages) {
            let obj = languageOption.find(opt => opt.id == lang)?.obj
            if (obj) {
                if (allowedTypes.includes(typeOption[0].id)) {
                    names.functions.push(...obj.functions)
                }
                if (allowedTypes.includes(typeOption[1].id)) {
                    names.types.push(...obj.types)
                }
                if (allowedTypes.includes(typeOption[2].id)) {
                    names.variables.push(...obj.variables)
                }
            } else {
                console.error("ERROR IN LANGUAGE SELECTION")
            }
        }

        // showToolbox = allowedTypes.includes(typeOption[3].id);
        // console.log(showToolbox);

        setShowToolbox(allowedTypes.includes(typeOption[3].id));

        setFilteredNames(names);
    }, [names, allowedLanguages, allowedTypes, showToolbox]);

    return (
        <Stack spacing={2}>
            <NavigationBar/>
            <PageTitle>{t("PyTamaroDocumentation")}</PageTitle>

            <Grid container spacing={2}>
                {/*justifyContent="center" alignItems="center"*/}
                <Grid xs={12} lg={4}>
                    <SelectAll
                        title="Kind"
                        placeholder="Kind"
                        options={typeOption}
                        initialSelection={typeOption}
                        onSelectionChange={setAllowedTypes}
                        maxTagsShown={3}
                    />
                </Grid>
                <Grid xs={12} lg={4}>
                    <Tooltip arrow placement="bottom"
                        title={
                            <Fragment>
                                <Typography>There is two possibility to search:</Typography>
                                <ul>
                                    <li> By utilizing the <b>name</b> or a portion thereof, a function, constant, class,
                                        or function saved in the toolbox
                                    </li>
                                    <li> By utilizing the <b>function signature</b> with this structure <i>(parameter
                                        type, parameter type, ...) -{'>'} return type</i></li>
                                </ul>

                            </Fragment>
                        }
                    >
                        <TextField
                            fullWidth
                            label="Search by name or signature"
                            variant="outlined"
                            onChange={debounce(handleNewFilter, 100)}
                        />
                    </Tooltip>
                </Grid>
                <Grid xs={12} lg={4}>
                    <SelectAll
                        title="Languages"
                        placeholder="Language"
                        options={languageOption}
                        initialSelection={initialLanguage}
                        onSelectionChange={setAllowedLanguages}
                        maxTagsShown={3}
                    />
                </Grid>
            </Grid>
            <DocumentationGrid filterNameDesc={filterNameDesc}
                               names={filteredNames}
                               showToolbox={showToolbox}
                               toolboxFunctions={toolboxFunctions}/>
        </Stack>
    );
}

export async function getStaticProps() {
    const jsonConverter = new JsonConverter()
    await jsonConverter.init();
    return {
        props: {
            English: jsonConverter.languageDividedByType(language_string.English),
            Italian: jsonConverter.languageDividedByType(language_string.Italian),
            French: jsonConverter.languageDividedByType(language_string.French),
            German: jsonConverter.languageDividedByType(language_string.German),
            ...await translationProps(),
        },
    };
}
