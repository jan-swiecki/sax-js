/// <reference types="node" />
import { Transform } from "stream";
import { NodeType } from './SAXParser.js';
export declare type SAXDataEvent = {
    nodeType: NodeType;
    data?: any;
};
export declare class SAXStream extends Transform {
    private _parser;
    private buffer;
    private _decoder;
    constructor(strict?: boolean, opt?: {});
    emitNodeTypes(...nodeTypes: NodeType[]): void;
    emitAllNodeTypes(): void;
    private alsoEmit;
    _destroy(err: any, callback: any): void;
    _write(chunk: any, encoding: any, callback: any): void;
    _final(callback: any): void;
}
//# sourceMappingURL=SAXStream.d.ts.map