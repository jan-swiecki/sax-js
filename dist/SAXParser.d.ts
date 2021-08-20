/// <reference types="node" />
import { EventEmitter } from 'stream';
import { SAXDataEvent } from './SAXStream';
declare type Attribute = {
    name: string;
    value: string;
    prefix: string;
    local: string;
    uri: string;
};
declare type Tag = {
    name: string;
    attributes: {
        [key: string]: Attribute | string;
    };
    local?: string;
    prefix?: string;
    uri?: string;
    isSelfClosing?: boolean;
    ns?: {
        [key: string]: string;
    };
};
export declare type NodeType = 'opencdata' | 'sgmldeclaration' | 'doctype' | 'comment' | 'closecdata' | 'processinginstruction' | 'opennamespace' | 'opentag' | 'extractedrawtag' | 'closetag' | 'closenamespace' | 'cdata' | 'script' | 'opentagstart' | 'attribute' | 'text';
export declare type EventType = NodeType | 'ready' | 'end' | 'error';
export declare const NodeTypes: NodeType[];
export declare enum ENodeTypes {
    'opencdata' = "opencdata",
    'sgmldeclaration' = "sgmldeclaration",
    'doctype' = "doctype",
    'comment' = "comment",
    'closecdata' = "closecdata",
    'processinginstruction' = "processinginstruction",
    'opennamespace' = "opennamespace",
    'opentag' = "opentag",
    'extractedrawtag' = "extractedrawtag",
    'closetag' = "closetag",
    'closenamespace' = "closenamespace",
    'cdata' = "cdata",
    'script' = "script",
    'opentagstart' = "opentagstart",
    'attribute' = "attribute",
    'text' = "text"
}
export declare const EventTypes: EventType[];
export declare const ENTITIES: {
    [key: string]: string | number;
};
declare type BufferName = 'comment' | 'sgmlDecl' | 'textNode' | 'tagName' | 'doctype' | 'procInstName' | 'procInstBody' | 'entity' | 'attribName' | 'attribValue' | 'cdata' | 'script';
export declare class SAXParser extends EventEmitter implements Record<BufferName, string> {
    private MAX_BUFFER_LENGTH;
    sawRoot: boolean;
    closedRoot: any;
    state: any;
    c: string;
    closed: boolean;
    q: string;
    bufferCheckPosition: any;
    opt: any;
    looseCase: string;
    tags: any[];
    tag: Tag;
    strict: boolean;
    noscript: boolean;
    strictEntities: any;
    ENTITIES: any;
    attribList: any[];
    rawTagTracking: boolean;
    rawTagExtract: string;
    path: any[];
    ns: any;
    trackPosition: boolean;
    position: number;
    line: number;
    column: number;
    error: Error;
    startTagPosition: number;
    cdata: string;
    script: string;
    procInstName: string;
    procInstBody: string;
    attribName: string;
    attribValue: string;
    entity: string;
    tagName: string;
    comment: string;
    doctype: string;
    sgmlDecl: string;
    textNode: string;
    saxDataEvents: SAXDataEvent[];
    constructor(strict: boolean, opt: any);
    private clearBuffers;
    setMaxBufferLength(value: number): void;
    reset(): void;
    end(): SAXParser;
    resume(): SAXParser;
    close(): void;
    flush(): void;
    private flushBuffers;
    private emitNode;
    private closeText;
    write(chunk: string | Buffer): SAXParser;
    openTag(selfClosing?: any): void;
    closeTag(): void;
    private checkBufferLength;
    private newTag;
    private _error;
    private strictFail;
    private attrib;
    private parseEntity;
    private beginWhiteSpace;
}
export {};
//# sourceMappingURL=SAXParser.d.ts.map