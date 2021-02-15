import {CodeRayLambdaHandler} from "../../../Library";
import {v1 as uuidv1} from "uuid";
process.env.APPSYNC_DOMAIN_ID = "ajn4wp3fpnaffgifb257lsyrum";
process.env.AWS_REGION = "eu-west-1";
process.env.APPSYNC_API_KEY = "da2-6gzaj4bnmnhgveizlali7fprha";

export const handler = CodeRayLambdaHandler((event, context) => {
    const uuid = uuidv1();

    return uuid;
});