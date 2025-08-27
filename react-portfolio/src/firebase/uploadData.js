import { database } from './config.js';
import { ref, set } from 'firebase/database';
import fs from 'fs';

// Read the example Firebase data
const exampleData = JSON.parse(fs.readFileSync('../../example-firebase.json', 'utf8'));

async function uploadData() {
  try {
    // Upload all the data to Firebase
    await set(ref(database, '/'), exampleData);
    console.log('Data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data:', error);
  }
}

uploadData();
