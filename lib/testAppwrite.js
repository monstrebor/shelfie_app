import { client } from './appwrite';

export async function testAppwriteConnection() {
  try {
    const result = await client.ping();

    console.log('Appwrite connection successful!');
    console.log(result);

    return true;
  } catch (error) {
    console.error('Appwrite connection failed:', error);
    return false;
  }
}
