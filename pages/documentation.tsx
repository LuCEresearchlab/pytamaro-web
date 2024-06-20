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

export default function Documentation() {
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
                    {/*<PyTamaroDocumentation functionFilterNameDesc={filterNameDesc}/>*/}
                </Container>
            </Box>
        </div>
    );
}

export async function getStaticProps() {
    return {
        props: {
            ...await translationProps(),
        },
    };
}
