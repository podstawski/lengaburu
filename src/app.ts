"use strict";

import { Family } from "./family";
import { RESOURCES_DIR, ERRORS } from './definitions';
import fs from 'fs';

export class App {
    protected family: Family;
    protected needSave: boolean = false;

    constructor(dbName: string) {
        this.family = new Family(dbName);
    }

    protected usage() {
        console.warn('Usage parameters:\n',
            "'import' to import Artur's family\n",
            "'clean' to clean local data\n",
            "'test <filename>' to send commands to the application\n");
    }

    public async run(params: string[]) {
        if (params.length===0) {
            return this.usage();
        }
        await this.family.open();
        switch (params[0]) {
            case 'import':
                console.log('Importing data...');
                const tree = require(RESOURCES_DIR+'/arthur.json');
                await this.family.import(tree);
                this.needSave = true;
                console.log('DONE');
                break;
            case 'clean':
                console.log('Cleaning data...');
                this.family.clean();
                this.needSave = true;
                console.log('DONE');
                break;
            case 'test':
                if (params.length===1) {
                    return this.usage();
                }
                if (!fs.existsSync(params[1])) {
                    console.warn('File %s does not exist\n', params[1]);
                    break
                }
                const commands = fs.readFileSync(params[1],{encoding: 'utf-8'});
                await this.evaluateCommands(commands.split('\n'));
                break;
            default:
                return this.usage();

        }

    }

    protected async evaluateCommands(commands: string[]) {
        for (let i=0; i<commands.length; i++) {
            const commandLine=commands[i];

            if (commandLine.trim().length===0) {
                return;
            }
            const command = commandLine.split(/ +/);
            try {
                switch (command[0]) {
                    case 'ADD_CHILD':
                        if (command.length<4)
                            throw ERRORS.NOT_ENOUGH_PARAMETERS;
                        const child=this.family.addChild(command[1],command[2],command[3]);
                        if (child && child.getName && child.getName()===command[2]) {
                            console.log('CHILD_ADDED');
                            this.needSave = true;
                        }
                        break;
                    case 'GET_RELATIONSHIP':
                        if (command.length<3)
                            throw ERRORS.NOT_ENOUGH_PARAMETERS;
                        const result = await this.family.getRelationship(command[1],command[2]);
                        console.log(result.join(' '));
                        break;
                    default:
                        throw ERRORS.COMMAND_NOT_FOUND;
                }
            } catch (err) {
                console.error(err.short || err);
            }

        };
    }

    public async save() {
        return this.needSave && this.family.save();
    }
}
