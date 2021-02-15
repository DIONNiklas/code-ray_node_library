import {CodeRayLambdaHandler} from "../../../Library";
import {v1 as uuidv1} from "uuid";
import {Test} from "../Internet";
process.env.APPSYNC_DOMAIN_ID = "ajn4wp3fpnaffgifb257lsyrum";
process.env.AWS_REGION = "eu-west-1";
process.env.APPSYNC_API_KEY = "da2-6gzaj4bnmnhgveizlali7fprha";

export const handler = CodeRayLambdaHandler((event, context) => {
    const uuid = uuidv1();

    return Test(event);
}, ["2V9FvE0oSoGla8zVgNFACZcFVUsyaW6dYZYY0qJp1zirsCMLnXbuY0IBr4ZL5veUqJSuxJWDMKCjVPF85pdfe74d6J4y7QztunNsH24vc="]);