import {
    Box,
    Container,
    TextField,
} from '@mui/material';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import { translationProps } from '../src/serverSideTranslationProps';
import PyTamaroDocumentation from "../components/PyTamaroDocumentation.tsx";
import {JsonConverter, language_string} from "../src/JsonAst/JsonConverter.ts";
import { Module } from '../src/JsonAst/Json_structure.ts';

export default function Documentation({English, Italian, French, German}:{English: Module[], Italian: Module[], French: Module[], German: Module[]}) {
    const [filterNameDesc, setFilterNameDesc] = useState('');
    const handleNewFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterNameDesc(e.target.value);
    };
    return (
        <div>
            <Head>
                <title>PyTamaro documentation</title>
            </Head>
            <Box>
                <NavigationBar />
                <Container maxWidth="md">
                    <PageTitle>PyTamaro documentation</PageTitle>
                    <TextField
                        fullWidth
                        label="Search by function name or description"
                        variant="outlined"
                        onChange={debounce(handleNewFilter, 100)}
                        sx={{ mb: 3 }}
                    />
                    <PyTamaroDocumentation functionFilterNameDesc={filterNameDesc} english={English} italian={Italian} german={German} french={French}/>
                </Container>
            </Box>
        </div>
    );
}

export async function getStaticProps() {
    const jsonConverter = new JsonConverter()
    await jsonConverter.init();
    return {
        props: {
            /*Eseguito server side prima del render*/
            English: jsonConverter.English,
            Italian: jsonConverter.Italian,
            French: jsonConverter.French,
            German: jsonConverter.German,
            ...await translationProps(),
        },
    };
}
