import {
    Interaction,
    Collection,
    TextInputComponent,
    CommandInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    AutocompleteInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    ContextMenuCommandBuilder,
    ComponentData,
    SlashCommandSubcommandGroupBuilder
} from 'discord.js';
import { Application } from '#lib';

export type Category = '';

export interface ModalData {
    exists: boolean;
    name: string;
}

export type ComponentData = {
    exists: boolean;
    name: string;
    authorOnly: boolean;
};

export type BuilderTypes = {
    command: SlashCommandBuilder;
    subcommandGroup: SlashCommandSubcommandGroupBuilder;
    subcommand: SlashCommandSubcommandBuilder;
};

export abstract class Command<T extends 'command' | 'subcommandGroup' | 'subcommand'> {
    abstract onInteraction(
        client: Application,
        interaction: Interaction,
        value?: Collection<string, TextInputComponent> | string
    ): Promise<void>;

    abstract onCommand?(client: Application, interaction: CommandInteraction): Promise<void>;
    abstract onSlashCommand?(client: Application, interaction: ChatInputCommandInteraction): Promise<void>;
    abstract onContextMenuCommand?(client: Application, interaction: ContextMenuCommandInteraction): Promise<void>;
    abstract onComponent?(client: Application, interaction: MessageComponentInteraction, value?: string): Promise<void>;
    abstract onModal?: (
        client: Application,
        interaction: ModalSubmitInteraction,
        fields: Collection<string, TextInputComponent>
    ) => Promise<void>;
    abstract onAutocomplete?: (
        client: Application,
        interaction: AutocompleteInteraction,
        focusedName: string,
        focusedValue: string | number
    ) => Promise<void>;

    dev?: boolean;

    slashCommandData?: BuilderTypes[T];
    contextMenuCommandData?: ContextMenuCommandBuilder;

    category: Category;
    cooldown?: number;

    componentData?: ComponentData;
    modalData?: ModalData;
}
