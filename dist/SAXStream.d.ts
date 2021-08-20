/// <reference types="node" />
import { Transform } from "stream";
import { NodeType, ENodeTypes } from './SAXParser.js';
export declare type SAXTagName = string;
export declare type SAXAttribute = {
    name: string;
    value: string;
};
export declare type SAXOpenTagStart = {
    name: SAXTagName;
};
export declare type SAXCloseTag = SAXTagName;
export declare type SAXOpenCData = {};
export declare type SAXCloseCData = {};
export declare type SAXTodo = {};
export declare type SAXTag = {
    name: string;
    attributes: {
        [key: string]: string;
    };
    isSelfClosing: boolean;
};
export declare type SAXText = string;
export declare type SAXCData = string;
export declare type SAXExtractedRawTag = string;
export declare type SAXDataEvent = {
    nodeType: ENodeTypes.attribute;
    data: SAXAttribute;
} | {
    nodeType: ENodeTypes.opentagstart;
    data: SAXOpenTagStart;
} | {
    nodeType: ENodeTypes.opentag;
    data: SAXTag;
} | {
    nodeType: ENodeTypes.closetag;
    data: SAXCloseTag;
} | {
    nodeType: ENodeTypes.text;
    data: SAXText;
} | {
    nodeType: ENodeTypes.cdata;
    data: SAXCData;
} | {
    nodeType: ENodeTypes.opencdata;
    data: SAXOpenCData;
} | {
    nodeType: ENodeTypes.closecdata;
    data: SAXCloseCData;
} | {
    nodeType: ENodeTypes.doctype;
    data: SAXTodo;
} | {
    nodeType: ENodeTypes.comment;
    data: SAXTodo;
} | {
    nodeType: ENodeTypes.processinginstruction;
    data: SAXTodo;
} | {
    nodeType: ENodeTypes.extractedrawtag;
    data: SAXExtractedRawTag;
} | {
    nodeType: ENodeTypes.sgmldeclaration;
    data: SAXTodo;
} | {
    nodeType: ENodeTypes.opennamespace;
    data: SAXTodo;
} | {
    nodeType: ENodeTypes.closenamespace;
    data: SAXTodo;
} | {
    nodeType: ENodeTypes.script;
    data: SAXTodo;
};
export declare class SAXStream extends Transform {
    private _parser;
    private buffer;
    private _decoder;
    private ended;
    constructor(strict?: boolean, opt?: any);
    emitNodeTypes(...nodeTypes: NodeType[]): void;
    emitAllNodeTypes(): void;
    private alsoEmit;
    _destroy(err: any, callback: any): void;
    _write(chunk: any, encoding: any, callback: any): void;
    _flush(callback: any): void;
    private __push;
}
//# sourceMappingURL=SAXStream.d.ts.map