import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { captureAWSClient } from 'aws-xray-sdk-core';
import AWS from 'aws-sdk';
import Database from '../libs/db';

const db = new Database(process.env.DATABASE_URL);

const XAWS = captureAWSClient(AWS);

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const segment = AWSXRay.getSegment();

  const { id } = event.pathParameters;

  const params = {
    TableName: 'my-table',
    Key: {
      id,
    },
  };

  const subsegment = segment.addNewSubsegment('dynamodb.get');

  await db.connect();

  const result = await db.get(params).promise();
  subsegment.close();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Data not found',
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};
