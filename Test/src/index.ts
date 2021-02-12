import NestedFile from "./nestedFile";
import * as path from "path";

//global["Internet"] = "Hello World";
const foo = "Hello world";
const bar = 200 * 300;
const nestedFileClass = new NestedFile();

export const INTERNET_THINGS = bar;

const functionFoo = (number) => {
    return number * 500 * nestedFileClass.foo(number);
}

const functionTest = function (concatString) {
    return foo + " " + concatString;
}

console.log(functionFoo(12));
console.log(functionTest(", we are interested in compiled versions!!"));

export {functionFoo, functionTest};