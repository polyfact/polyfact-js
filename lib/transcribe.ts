import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { Readable } from "readable-stream";
import * as t from "polyfact-io-ts";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

const ResultType = t.type({
    text: t.string,
});

export async function transcribe(
    file: Buffer | Readable,
    clientOptions: InputClientOptions = {},
): Promise<string> {
    try {
        const { token, endpoint } = await defaultOptions(clientOptions);

        const formData = new FormData();
        formData.append("file", file, {
            contentType: "audio/mp3",
            filename: "file.mp3",
        });

        const res = await axios.post(`${endpoint}/transcribe`, formData, {
            headers: {
                "X-Access-Token": token,
            },
        });

        if (!ResultType.is(res.data)) {
            throw new ApiError({
                code: "mismatched_response",
                message: "The response from the API does not match the expected format",
            });
        }

        return res.data.text;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export type TranscribeClient = {
    transcribe: (file: Buffer | Readable) => Promise<string>;
};

export default function client(clientOptions: InputClientOptions = {}): TranscribeClient {
    return {
        transcribe: (file: Buffer | Readable) => transcribe(file, clientOptions),
    };
}
