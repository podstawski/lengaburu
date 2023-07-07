"use strict";
import {App} from './app';
const app=new App('db.json');
app.run(process.argv.slice(2)).then(() => app.save());