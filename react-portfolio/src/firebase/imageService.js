import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const imageService = {
  // Upload image and return the download URL
  async uploadImage(file, folder = 'images') {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}.${extension}`;
      
      // Create storage reference
      const storageRef = ref(storage, `${folder}/${filename}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Upload project image
  async uploadProjectImage(file) {
    return this.uploadImage(file, 'projects');
  },

  // Upload experience company logo
  async uploadCompanyLogo(file) {
    return this.uploadImage(file, 'companies');
  },

  // Upload profile picture
  async uploadProfilePicture(file) {
    return this.uploadImage(file, 'profile');
  },

  // Upload general asset
  async uploadAsset(file) {
    return this.uploadImage(file, 'assets');
  },

  // Delete image from storage
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error if image doesn't exist
      if (error.code === 'storage/object-not-found') {
        return true;
      }
      throw error;
    }
  },

  // Extract path from Firebase Storage URL
  extractPathFromUrl(url) {
    try {
      // Firebase Storage URLs have a specific format
      const match = url.match(/\/o\/(.*?)\?/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }
};
