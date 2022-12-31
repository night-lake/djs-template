import { Client } from 'discord.js';
import { inspect } from 'node:util';
import { loadRootDirectory } from 'utils';

type Root = { hi: string };
type Parent = { hello: string };
type Child = { bye: string };

export class Application extends Client {
    constructor() {
        super({
            intents: [],
            partials: [],
            allowedMentions: { repliedUser: false }
        });
    }

    async init() {
        const [rootCommands, parentCommands, childCommands] = await loadRootDirectory<Root, Parent, Child>(
            '../commands'
        );

        console.log('root: ', inspect(rootCommands, { depth: 3 }));
        console.log('\nparent: ', inspect(parentCommands, { depth: 3 }));
        console.log('\nchild: ', inspect(childCommands, { depth: 3 }));
        for (const cmd of rootCommands) {
            console.log(cmd.data.hi);
        }
    }
}
