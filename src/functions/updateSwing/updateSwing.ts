import { APIGatewayProxyHandler } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk';
import AWS from 'aws-sdk';

const dynamodb = AWSXRay.captureAWSClient(new AWS.DynamoDB.DocumentClient());

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const segment = AWSXRay.getSegment();

  const { id } = event.pathParameters;
  const { name } = JSON.parse(event.body);

  const params = {
    TableName: 'my-table',
    Key: {
      id,
    },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': name,
    },
  };

  const subsegment = segment.addNewSubsegment('dynamodb.update');
  await dynamodb.update(params).promise();
  subsegment.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Data updated successfully',
    }),
  };
};
