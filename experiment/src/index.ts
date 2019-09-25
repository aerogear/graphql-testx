import { TestxServer } from "./testx-server/index";
import { readFileSync } from 'fs';

const server =  new TestxServer(readFileSync('./src/model/Note.graphql', 'utf8'));