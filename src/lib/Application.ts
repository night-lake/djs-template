import { Client } from 'discord.js';

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
