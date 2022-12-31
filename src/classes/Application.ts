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

    async init() {}
}
