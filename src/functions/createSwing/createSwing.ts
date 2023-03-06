import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { captureAWSClient } from 'aws-xray-sdk-core';
import AWS from 'aws-sdk';
import Database from '../libs/db';

const db = new Database(process.env.DATABASE_URL);

const XAWS = captureAWSClient(AWS);

export const createSwing: APIGatewayProxyHandler = async (event) => {
  const { body } = event;
  const id = uuid();
  const timestamp = new Date().toISOString();

  const item = {
    id,
    timestamp,
    ...JSON.parse(body),
  };

  await db.connect();

  const queryResult = await db.query('INSERT INTO swings (id, timestamp, name, location, length, weight) VALUES ($1, $2, $3, $4, $5, $6)', [
    item.id,
    item.timestamp,
    item.name,
    item.location,
    item.length,
    item.weight,
  ]);

  await db.disconnect();

  const createdItem = {
    id: queryResult.rows[0].id,
    timestamp: queryResult.rows[0].timestamp,
    name: queryResult.rows[0].name,
    location: queryResult.rows[0].location,
    length: queryResult.rows[0].length,
    weight: queryResult.rows[0].weight,
  };

  const subsegment = new XAWS.Segment('createSwing');
  subsegment.addMetadata('item', createdItem);

  return {
    statusCode: 201,
    body: JSON.stringify(createdItem),
  };
};
