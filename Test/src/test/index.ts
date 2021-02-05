import * as Inspector from "inspector";
import * as path from "path";
import * as sourceMap from "source-map";
import * as SourceMapResolve from "source-map-resolve";
import * as fs from "fs";
import * as util from "util";

let foundScripts = {};
let breakpointBus = [];

/*
-> InspectorSession
    - Stores and maintain the Inspector Session
    - Static factory
    - Control debugger (Enable & Disable)

-> Script Handler
    -> Debugger.scriptParsed
    -> Blacklist check
    -> Subscription: On Script Found => Listener
        -> Init Script Container
        -> Call store on ScriptContainer instance
        -> call the callback function without any props

-> Breakpoint
    -> BreakpointBus
        -> add
            - Push only it to the pending breakpoints (breakpointID)
            -> filename
            -> line
            -> column
            -> breakpointID
                -> Create Breakpoint instance
                -> Push instance to RuntimeStore
            -> try registerOnLoadedScripts

        -> searchForMappingScript
            - Go through all scripts and check if there is a matching (pendingBreakpoints <=> scripts)

        -> registerOnLoadedScripts
            -> go through all breakpoints and get the filename
                -> searchForMappingScript
                    -> if found
                        -> activate Breakpoint
                        -> Delete from pending breakpoints

    -> BreakpointContainer
        Attributes:
            - v8BreakpointID

        -> Constructor (Init)
            - filename
            - line
            - column
            - breakpointID
        -> Activate
            - Parameter: ScriptContainer Instance
            -> Store the V8 ScriptID inside it
            -> Resolve breakpoint position over script container
            -> V8 Debugger.setBreakpointByURL
            -> Add it to RuntimeStore => HashMap => V8BreakpointID = this.Breakpoint
        -> Revoke
            - Check if it is on the pending breakpoints => Delete it
            - Remove it from the active breakpoints => Disable it
                -> V8 Debugger.removeBreakpoint
        -> addStackDump

    -> BreakpointHandler
        - Handles the data if a breakpoint was hit

        -> onHitting
            - takes callback if a breakpoint was hit -> call the callback (API call or what else)

        -> registerHandler
            -> Debugger.paused
                -> convert v8 breakpoint id into breakpointID
                -> Get Breakpoint instance
                -> Stack
                    -> overgive the Debugger.paused message - Stack class will enrich the data and get it
                    -> getStackDump - include the stacktrace and the frame dump
                    -> Frame
                    -> Trace
                    -> get the original location over the script container
                    -> add Stack dump to Breakpoint instance
                -> Overgive the breakpoint instance to the callback function
                -> Debugger.resume

-> Script Container
    -> Constructor
        -> V8ScriptID
        -> Filename
        -> SourceMapURL
    -> loadSourceMap
    -> store
        - Store instance in RuntimeStore under the ScriptID
    -> verifyFileMatch: Boolean
        -> if SourceMap
            -> go through all sources
        -> if no sourcemap
            -> check underlying script
    -> GetGeneratedPosition
        - check if is source map
    -> GetOriginalPosition
        - check if is source map

-> RuntimeStore
    - Static Store! Without promises!!

    -> RuntimeStore Interfaces
        -> Breakpoints
            -> pendingBreakpoints
                -> add
                -> delete
                -> get
            -> activeBreakpoints
                -> addBreakpointIDMapping = v8BreakpointID => breakpointID
                -> deleteBreakpointIDMapping = v8BreakpointID => breakpointID
                -> add (breakpointID, Breakpoint Instance)
                -> delete (breakpointID)
                -> get (breakpointID)
        -> Scripts
            -> loadedScripts
               -> Subscription function
               -> add
               -> get by ID

-> Log Notifications

-> SystemInformation

-> RuntimeConditions
    -> Is Electron App?
        -> Has it the inspector option available?
    -> Is AWS Lambda?
    -> Is Azure Function?

-> CodeRay Backend
    -> Init

-> index
    -> CodeRay Class
        -> init()
            -> Start V8 inspector
            -> Enable Debugger
            -> Enable Breakpoints
            -> Register ScriptHandler
            -> Register CodeRay Backend

        -> onHittingBreakpoint
            - define what to do if the breakpoint was hitted
                -> get back the BreakpointContainer instance
                -> enrich data with system information and send it all to the code-ray backend
 */


const injectorScript = `
    function copyStack(breakpointIndex) {
        process[breakpointIndex] = this;
    }
`;

export class Engine {
    private _session: Inspector.Session;

    constructor() {
        this._session = new Inspector.Session();

        try {
            this._session.connect();
        } catch (e) {
            console.log(e);
        }
    }

    public async enable() {
        this._session.post("Debugger.enable");
        this._session.post("Debugger.setBreakpointsActive", {active: true});
        this.onBreakpointHit();
    }

    public async onBreakpointHit() {
        this._session.on("Debugger.paused", message => {
            //console.log(util.inspect(message.params, false, 10));
            console.log(message.params.callFrames[0].scopeChain[0].object.objectId);

            //console.log(message.params.callFrames[0].location);

            this._session.post('Runtime.callFunctionOn', {
                objectId: message.params.callFrames[0].scopeChain[0].object.objectId,
                functionDeclaration: injectorScript,
                arguments: [{
                    value: "sdjfaksdlkfjlksadjf"
                }]
            }, e => {
                //error = e;
            });

            console.log(process["sdjfaksdlkfjlksadjf"]);

            //console.log(foundScripts[message.params.callFrames[0].location.scriptId])

            //console.log(message.params.callFrames[0].location.lineNumber, message.params.callFrames[0].location.columnNumber);
            const data = foundScripts[message.params.callFrames[0].location.scriptId].getOriginalPosition(message.params.callFrames[0].location.lineNumber + 1, message.params.callFrames[0].location.columnNumber - 1);
            //console.log(data);

            //console.log(foundScripts);
            this._session.post("Debugger.resume");
        });
    }

    get session() {
        return this._session;
    }
}

export class SetBreakpoint {
    private V8Session: Inspector.Session;

    constructor(engine: Inspector.Session) {
        this.V8Session = engine;
    }

    private urlParse(aUrl) {
        var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
        var match = aUrl.match(urlRegexp);

        if (!match) {
            return null;
        }

        return {
            scheme: match[1],
            auth: match[2],
            host: match[3],
            port: match[4],
            path: match[5]
        };
    }

    private urlGenerate(aParsedUrl) {
        var url = '';

        if (aParsedUrl.scheme) {
            url += aParsedUrl.scheme + ':';
        }

        url += '//';

        if (aParsedUrl.auth) {
            url += aParsedUrl.auth + '@';
        }

        if (aParsedUrl.host) {
            url += aParsedUrl.host;
        }

        if (aParsedUrl.port) {
            url += ":" + aParsedUrl.port;
        }

        if (aParsedUrl.path) {
            url += aParsedUrl.path;
        }

        return url;
    }

    private normalize(aPath) {
        var path = aPath;
        var url = this.urlParse(aPath);

        if (url) {
            if (!url.path) {
                return aPath;
            }

            path = url.path;
        }

        var isAbsolute = path.charAt(0) === '/' || /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/.test(path);
        var parts = path.split(/\/+/);

        for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
            part = parts[i];

            if (part === '.') {
                parts.splice(i, 1);
            } else if (part === '..') {
                up++;
            } else if (up > 0) {
                if (part === '') {
                    // The first part is blank if the path is absolute. Trying to go
                    // above the root is a no-op. Therefore we can remove all '..' parts
                    // directly after the root.
                    parts.splice(i + 1, up);
                    up = 0;
                } else {
                    parts.splice(i, 2);
                    up--;
                }
            }
        }

        path = parts.join('/');

        if (path === '') {
            path = isAbsolute ? '/' : '.';
        }

        if (url) {
            url.path = path;
            return this.urlGenerate(url);
        }

        return path;
    }

    public async set(matchInfo: any, line: number, column: number) {
        let lineNumber = line;
        let columnNumber = column;

        if(matchInfo.inSourceMap) {
            const positon = matchInfo.script.getGeneratedPosition(this.normalize(matchInfo["filename"]), lineNumber, columnNumber);
            lineNumber = positon.line;
            columnNumber = positon.column;
        }

        this.V8Session.post("Debugger.setBreakpointByUrl", {
            url: "file://" + this.normalize(matchInfo["script"]["filename"]),
            lineNumber: lineNumber - 1,
            columnNumber: columnNumber + 1,
        }, (err, params) => {

            console.log(params.breakpointId);
        });
    }
}

export class Position {
    private V8Session: Inspector.Session;

    constructor(engine: Engine) {
        this.V8Session = engine.session;
        this.onScriptParsed();
    }

    private isOnBlacklist(scriptURL: string): boolean {
        if(scriptURL.length === 0) {
            return true;
        }

        if(scriptURL.startsWith("node:")) {
            return true;
        }

        if(scriptURL.includes("node_modules")) {
            return true;
        }

        if(scriptURL.includes("evalmachine")) {
            return true;
        }

        return false;
    }

    onScriptParsed() {
        this.V8Session.on("Debugger.scriptParsed", message => {
            if(this.isOnBlacklist(message.params.url)) {
                return;
            }

            this.V8Session.post("Debugger.getScriptSource", {
                scriptId: message.params.scriptId
            }, (err, params) => {
                const scriptWrapper = new ScriptWrapper(message.params.scriptId, params.scriptSource, message.params.url, message.params.sourceMapURL);
                foundScripts[message.params.scriptId] = scriptWrapper;

                breakpointBus.forEach(value => {
                    try {
                        const info = scriptWrapper.getMatchInfo(value.filename);
                        const breakPoint = new SetBreakpoint(this.V8Session);
                        breakPoint.set(info, value.line, value.column)
                    } catch (e) {
                        return;
                    }
                })
            })

        });
    }
}

export class ScriptWrapper {
    private v8ScriptID: string;
    private filename: string;
    private sourceMapURL: string;
    private sourceFiles = [];
    private sourceContent: string;
    private mapConsumer: any;

    constructor(v8ScriptID: string, content: string, filename: string, sourceMapURL: string) {
        this.v8ScriptID = v8ScriptID;
        this.sourceMapURL = sourceMapURL;
        this.filename = filename;
        this.sourceContent = content;

        if(this.filename.startsWith("file://")) {
            this.filename = this.filename.replace("file://", "");
        }

        this.analyze();
    }

    private canonizeFileName(filename: string) {
        return path.normalize(filename.replace(/[\\\/]/g, '/'));
    }

    public async analyze() {
        if(!this.sourceMapURL) {
            return;
        }

        const sourceMapResolved = SourceMapResolve.resolveSourceMapSync(this.sourceContent, this.filename, fs.readFileSync);
        this.mapConsumer = new sourceMap.SourceMapConsumer(sourceMapResolved.map);

        sourceMapResolved.map.sources.forEach(value => {
            this.sourceFiles.push({
                normalizedPath : this.canonizeFileName(value),
                rawPath: value
            });
        });
    }

    private arePathsConverging(path1, path2) {
        // Find longest match
        let i = path1.length - 1;
        let j = path2.length - 1;

        while (i >= 0 && j >= 0 && path1[i] === path2[j]) {
            --i;
            --j;
        } // Check that at least one of the strings has ended and the other is at a directory boundary


        return i === -1 && path2[j] === path.sep || j === -1 && path1[i] === path.sep || i === -1 && j === -1;
    }

    public getMatchInfo(filename) {
        for(let sourceFile of this.sourceFiles) {
            if(!this.arePathsConverging(sourceFile.normalizedPath, filename)) {
                continue;
            }

            return {
                script: this,
                inSourceMap: true,
                filename: sourceFile.rawPath
            }
        }

        if(!this.arePathsConverging(this.filename, filename)) {
            throw "NOT found!!!"
        }

        return {
            script: this,
            inSourceMap: false,
            filename: this.filename
        }
    }

    public getGeneratedPosition(filename: string, line: number, column: number) {
        const positon = this.mapConsumer.generatedPositionFor({
            source: filename,
            line: line,
            column: column,
            bias: sourceMap.SourceMapConsumer.LEAST_UPPER_BOUND
        });

        console.log(positon);

        return positon;
    }

    public getOriginalPosition(line: number, column: number) {
        return this.mapConsumer.originalPositionFor({
            line: line,
            column: column
        });
    }

}

export class Breakpoint {
    public async add(filename: string, line: number, column: number) {
        breakpointBus.push({
            filename: filename,
            line: line,
            column: column
        });
    }
}