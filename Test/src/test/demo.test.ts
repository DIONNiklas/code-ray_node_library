import {CodeRay} from "coderay";
import * as util from "util";
import * as Pohui from "./index";
import * as os from "os";

describe("Hallo", () => {
    test("Hallo", async () => {
        const codeRay = new CodeRay();
        codeRay.init();
        codeRay.registerNewBreakpoint();

        await codeRay.test();

        const data = require("../../dist/bundle");
    });

    test("Internet", async () => {
        const engine = new Pohui.Engine();
        await engine.enable();
        const script = new Pohui.Position(engine);
        script.onScriptParsed();
        const breakpoint = new Pohui.Breakpoint();
        await breakpoint.add("src/index.ts", 6, 0);

        const data = require("../../dist/bundle");
    });
});