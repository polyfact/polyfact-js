import { Buffer } from "buffer";
import { Memory } from "../memory";
import { transcribe } from "../transcribe";
import { splitString } from "../split";

import { InputClientOptions } from "../clientOpts";

interface MinimalStream {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

interface FetchReadableStream {
    getReader(): {
        read(): Promise<{ done: boolean; value?: Uint8Array | undefined }>;
    };
}

type LoaderFileInput = MinimalStream | Buffer | FetchReadableStream;

function stream2buffer(stream: MinimalStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buf: any[] = [];

        stream.on("data", (chunk) => buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(buf)));
        stream.on("error", (err) => reject(err));
    });
}

async function fetchStream2buffer(stream: FetchReadableStream): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    let done = false;
    let value: Uint8Array | undefined;
    while (!done) {
        // eslint-disable-next-line no-await-in-loop
        ({ done, value } = await reader.read());
        if (value) {
            chunks.push(value);
        }
    }

    return Buffer.concat(chunks);
}

async function loaderInputToBuffer(input: LoaderFileInput): Promise<Buffer> {
    if (input instanceof Buffer) {
        return input;
    }

    if ("on" in input) {
        return stream2buffer(input);
    }

    if ("getReader" in input) {
        return fetchStream2buffer(input);
    }

    return null as never;
}

// eslint-disable-next-line consistent-return
async function batchify<T extends Array<unknown>>(
    array: T,
    size: number,
    callback: (input: T) => Promise<void>,
): Promise<void> {
    if (array.length < size) {
        return callback(array);
    }
    await callback(array.slice(0, size) as T);
    await batchify(array.slice(size) as T, size, callback);
}

export type LoaderFunction = (memory: Memory, clientOptions: InputClientOptions) => Promise<void>;

export function TextFileLoader(file: LoaderFileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadPdfIntoMemory(
        memory: Memory,
        _clientOptions: InputClientOptions = {},
    ) {
        const fileBuffer = await loaderInputToBuffer(file);
        const splittedFile = splitString(fileBuffer.toString("utf8"), maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(batches.map(async (batch) => memory.add(batch)));
        }

        await batchify(splittedFile, 10, addBatchIntoMemory);
    };
}

export function StringLoader(str: string, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadPdfIntoMemory(
        memory: Memory,
        _clientOptions: InputClientOptions = {},
    ) {
        const splittedStr = splitString(str, maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(batches.map(async (batch) => memory.add(batch)));
        }

        await batchify(splittedStr, 10, addBatchIntoMemory);
    };
}

export function AudioLoader(file: LoaderFileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadAudioIntoMemory(
        memory: Memory,
        clientOptions: InputClientOptions = {},
    ) {
        const fileBuffer = await loaderInputToBuffer(file);
        const transcription = await transcribe(fileBuffer, clientOptions);
        const transcriptions = splitString(transcription, maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(batches.map(async (batch) => memory.add(batch)));
        }

        await batchify(transcriptions, 10, addBatchIntoMemory);
    };
}

export async function loaderToMemory(
    loaders: LoaderFunction | LoaderFunction[],
    clientOptions: InputClientOptions = {},
): Promise<Memory> {
    const memory = new Memory(clientOptions);

    if (typeof loaders === "function") {
        await loaders(memory, clientOptions);
    } else {
        await Promise.all(loaders.map((loader) => loader(memory, clientOptions)));
    }

    return memory;
}
