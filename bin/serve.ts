#!/usr/bin/env node
import { argv } from 'yargs';
import { existsSync, readFileSync } from 'fs'
import { TestxServer } from '../src';

async function startServer(model: string) {
    const server = new TestxServer({
        schema: model
    });

    // start the server
    await server.start();
    // retrieve the server url
    console.log(`Running on ${await server.httpUrl()}`);
}


if (argv.model) {
    const modelLocation = argv.model as string;
    if (existsSync(modelLocation)) {
        const fileContent = readFileSync(modelLocation, { encoding: 'utf8' });
        startServer(fileContent);
    }

} else {
    console.log('Provide path to your model file. For example --model=./model');
}