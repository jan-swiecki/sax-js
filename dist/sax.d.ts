import { EventTypes, SAXParser, ENTITIES } from "./SAXParser.js";
import { SAXDataEvent, SAXStream, SAXTag, SAXTagName, SAXText } from './SAXStream.js';
import { ENodeTypes } from './SAXParser';
export { SAXParser, SAXStream, EventTypes, ENTITIES, SAXDataEvent, SAXTag, SAXTagName, SAXText, ENodeTypes };
declare const _default: {
    SAXParser: typeof SAXParser;
    SAXStream: typeof SAXStream;
    EventTypes: import("./SAXParser.js").EventType[];
    ENTITIES: {
        [key: string]: string | number;
    };
    ENodeTypes: typeof ENodeTypes;
};
export default _default;
//# sourceMappingURL=sax.d.ts.map