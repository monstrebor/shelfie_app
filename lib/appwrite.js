import 'react-native-url-polyfill/auto';
import {
    Client,
    Avatars,
    Account,
    Databases
} from 'react-native-appwrite';

const DATABASE_ID = '6afc5ee10008965e6b52';
const COLLECTION_ID = '6afc5f0500348b77e84b';

export const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6af66a120008eee7d00d')
    .setPlatform('dev.monstrebor.shelfie');

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);

export const channel =
    `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
