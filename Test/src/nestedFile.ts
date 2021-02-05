export const C_FOO = 123123;
export const I_BAR = "FOOOOOO";
export const K_PAP = "Lorem ipsum" + I_BAR;

const whyFunction = (number) => {
    const demo = number * 500 * Math.random();

    console.log("Wir sind die coolsten");
    return demo;
}

export const bar = 200 * whyFunction(300);

export const INTERNET_THINGS = bar;

class NestedFile {
    foo(value) {
        return value * 200;
    }
}

export default NestedFile;