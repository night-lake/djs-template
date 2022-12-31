import { lstat, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, type URL } from 'node:url';

type Child<T> = { name: string; data: T };
type RootFiles<T> = Child<T>;
type ParentFiles<T> = Child<T>;
type ChildFiles<T> = Child<T>;

/**
 * Call with `import.meta.url` to get the `__dirname` equivalent
 */
export function getDirname(url: URL | string) {
    return dirname(getFilename(url));
}

/**
 * Call with `import.meta.url` to get the `__filename` equivalent
 */
export function getFilename(url: URL | string) {
    return fileURLToPath(url);
}

export async function loadFile<T>(directory: string, file: string) {
    const [name] = file.split('.');
    const data: T = await import(`file:${join(directory, file)}`);

    return { name, data };
}

export async function loadParentDirectory<ParentT, ChildT>(relativePath: string) {
    const result: [Child<ParentT>[], Child<ChildT>[]] = [[], []];

    const parentDirectory = join(getDirname(import.meta.url), relativePath);
    const parentFiles = await readdir(parentDirectory);

    for (const parentFile of parentFiles) {
        if (parentFile.endsWith('.js') || parentFile.endsWith('.ts')) {
            result[0].push(await loadFile<ParentT>(parentDirectory, parentFile));
            continue;
        }

        const directory = join(parentDirectory, parentFile);
        const file = await lstat(directory);

        if (file.isDirectory()) {
            const relativeDirectory = join(relativePath, parentFile);

            result[1].push(
                ...(await loadDirectory<ChildT>(relativeDirectory)).map(data => ({
                    name: `${parentFile}/${data.name}`,
                    data: data.data
                }))
            );
        }
    }

    return result;
}

export async function loadDirectory<T>(relativePath: string) {
    const directory = join(getDirname(import.meta.url), relativePath);

    const files = (await readdir(directory)).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
    return Promise.all(files.map(async file => loadFile<T>(directory, file)));
}

export async function loadRootDirectory<RootT, ParentT, ChildT>(relativePath: string) {
    const result: [RootFiles<RootT>[], ParentFiles<ParentT>[], ChildFiles<ChildT>[]] = [[], [], []];

    const rootDirectory = join(getDirname(import.meta.url), relativePath);
    const rootFiles = await readdir(rootDirectory);

    for (const topLevelFile of rootFiles) {
        if (topLevelFile.endsWith('.js') || topLevelFile.endsWith('.ts')) {
            result[0].push(await loadFile<RootT>(rootDirectory, topLevelFile));
            continue;
        }

        const parentDirectory = join(rootDirectory, topLevelFile);
        const parentFile = await lstat(parentDirectory);

        if (parentFile.isDirectory()) {
            const parentFiles = await readdir(parentDirectory);

            for (const parentFile of parentFiles) {
                if (parentFile.endsWith('.js') || parentFile.endsWith('.ts')) {
                    const file = await loadFile<ParentT>(parentDirectory, parentFile);

                    result[1].push({
                        name: `${topLevelFile}/${file.name}`,
                        data: file.data
                    });
                    continue;
                }

                const childDirectory = join(parentDirectory, parentFile);
                const childFile = await lstat(childDirectory);

                if (childFile.isDirectory()) {
                    const childFiles = await readdir(childDirectory);

                    for (const childFile of childFiles) {
                        const file = await loadFile<ChildT>(childDirectory, childFile);

                        result[2].push({
                            name: `${topLevelFile}/${parentFile}/${file.name}`,
                            data: file.data
                        });
                    }
                }
            }
        }
    }

    return result;
}
