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
import {DividedModule, JsonConverter} from "../src/JsonAst/JsonConverter";
import useLocalTranslation from "../src/localStorage/useLocalTranslation";
import SelectAll from '../components/SelectAll';
import useLocalToolbox from "../src/localStorage/useLocalToolbox.ts";
import {language_string} from "../src/JsonAst/Json_structure.ts";

export default function Documentation({
                                          English,
                                          Italian,
                                          French,
                                          German
                                      }: {
    English: DividedModule,
    Italian: DividedModule,
    French: DividedModule,
    German: DividedModule
}) {
    const {
        t,
        i18n
    } = useLocalTranslation()
    const [filterNameDesc, setFilterNameDesc] = useState('');
    const handleNewFilter = (e: ChangeEvent<HTMLInputElement>) => {
        setFilterNameDesc(e.target.value);
    };

    let names: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }

    let filteredEnglish: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }
    let filteredItalian: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }
    let filteredGerman: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }
    let filteredFrench: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }

    const typeOption = [
        {
            id: "function",
            label: "Function"
        },
        {
            id: "type",
            label: "Type"
        },
        {
            id: "constant",
            label: "Constant"
        },
        {
            id: "toolbox",
            label: "Toolbox function"
        }]
    const languageOption = [
        {
            id: "en",
            label: "English",
            source: English,
            target: filteredEnglish
        },
        {
            id: "it",
            label: "Italian",
            source: Italian,
            target: filteredItalian
        },
        {
            id: "ge",
            label: "German",
            source: German,
            target: filteredGerman
        },
        {
            id: "fr",
            label: "French",
            source: French,
            target: filteredFrench
        }
    ]

    const {
        list,
        deleteFunction
    } = useLocalToolbox();

    const initialLanguage = [languageOption.find(lang => lang.id == i18n.language) || languageOption[0]]
    const [allowedTypes, setAllowedTypes] = useState<string[]>(typeOption.map(opt => opt.id));
    const [allowedLanguages, setAllowedLanguages] = useState<string[]>(initialLanguage.map(lang => lang.id));
    const [filteredNames, setFilteredNames] = useState<DividedModule[]>([filteredEnglish, filteredItalian, filteredGerman, filteredFrench]);
    const [showToolbox, setShowToolbox] = useState<boolean>(allowedTypes.includes(typeOption[3].id));
    const toolboxFunctions = list();

    useEffect(() => {
        for (let obj of languageOption) {
            obj.target.functions = []
            obj.target.types = []
            obj.target.variables = []
        }

        for (let lang of allowedLanguages) {
            let source = languageOption.find(opt => opt.id == lang)?.source;
            let target = languageOption.find(opt => opt.id == lang)?.target;
            if (source && target) {
                if (allowedTypes.includes(typeOption[0].id)) {
                    target.functions.push(...source.functions)
                }
                if (allowedTypes.includes(typeOption[1].id)) {
                    target.types.push(...source.types)
                }
                if (allowedTypes.includes(typeOption[2].id)) {
                    target.variables.push(...source.variables)
                }
            } else {
                console.error("ERROR IN LANGUAGE SELECTION")
            }
        }

        setShowToolbox(allowedTypes.includes(typeOption[3].id));

        setFilteredNames([filteredEnglish, filteredItalian, filteredGerman, filteredFrench]);
    }, [filteredEnglish, filteredItalian, filteredGerman, filteredFrench, allowedLanguages, allowedTypes, showToolbox]);

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
                                         <li> By utilizing the <b>name</b> or a portion thereof, a
                                             function, constant, class,
                                             or function saved in the toolbox
                                         </li>
                                         <li> By utilizing the <b>function signature</b> with this
                                             structure <i>(parameter
                                                 type, parameter type, ...) -{'>'} return type</i>
                                         </li>
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
                               English={filteredNames[0]}
                               Italian={filteredNames[1]}
                               German={filteredNames[2]}
                               French={filteredNames[3]}
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
