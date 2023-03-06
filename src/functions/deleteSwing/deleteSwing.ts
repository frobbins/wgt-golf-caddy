import { APIGatewayProxyHandler } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk';
import AWS from 'aws-sdk';

const dynamodb = AWSXRay.captureAWSClient(new AWS.DynamoDB.DocumentClient());

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const segment = AWSXRay.getSegment();

  const { id } = event.pathParameters;

  const params = {
    TableName: 'my-table',
    Key: {
      id,
    },
  };

  const subsegment = segment.addNewSubsegment('dynamodb
