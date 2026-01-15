import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db, ensureAuthenticated } from './firebase';

// Collection name - single collection for all AI web builder data
const COLLECTION_NAME = 'ai-web-builder-projects';

/**
 * Get project by company name
 * @param {string} companyName - Company name
 * @returns {Promise<Object|null>} - Project data or null
 */
export async function getProjectByCompanyName(companyName) {
  try {
    const documentId = generateDocumentId(companyName);
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, documentId));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log(`No project found for company: ${companyName}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting project by company name: ", error);
    throw error;
  }
}

/**
 * Get all projects (for admin/dashboard)
 * @returns {Promise<Array>} - Array of project data
 */
export async function getAllProjects() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const projectList = [];
    
    querySnapshot.forEach((doc) => {
      projectList.push({ id: doc.id, ...doc.data() });
    });
    
    return projectList;
  } catch (error) {
    console.error("Error getting all projects: ", error);
    throw error;
  }
}

/**
 * Generate document ID from company name
 * @param {string} companyName - Company name
 * @returns {string} - Document ID
 */
function generateDocumentId(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric with dashes
    .replace(/-+/g, '-')         // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '');      // Remove leading/trailing dashes
}

/**
 * Save complete project data (business info + website config)
 * @param {Object} projectData - Complete project data
 * @returns {Promise<string>} - Document ID
 */
export async function saveCompleteProject(projectData) {
  try {
    const companyName = projectData.business_info?.company_name;
    if (!companyName) {
      throw new Error('Company name is required to save project');
    }

    const documentId = generateDocumentId(companyName);
    
    const dataWithMetadata = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      version: '1.0',
      documentId: documentId // Store the generated ID for reference
    };

    // Use setDoc with custom document ID instead of addDoc
    await setDoc(doc(db, COLLECTION_NAME, documentId), dataWithMetadata);
    console.log(`Project saved with company-based ID: ${documentId}`);
    return documentId;
  } catch (error) {
    console.error("Error saving complete project: ", error);
    throw error;
  }
}

/**
 * Update existing project
 * @param {string} companyName - Company name
 * @param {Object} updatedData - Updated project data
 * @returns {Promise<string>} - Document ID
 */
export async function updateProject(companyName, updatedData) {
  try {
    const documentId = generateDocumentId(companyName);
    const updateData = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, COLLECTION_NAME, documentId), updateData, { merge: true });
    console.log(`Project updated for company: ${companyName} (ID: ${documentId})`);
    return documentId;
  } catch (error) {
    console.error("Error updating project: ", error);
    throw error;
  }
}

/**
 * Search projects by company name (fuzzy search)
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Array of matching project data
 */
export async function searchProjects(searchTerm) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("business_info.company_name", ">=", searchTerm),
      where("business_info.company_name", "<=", searchTerm + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error("Error searching projects: ", error);
    throw error;
  }
}

/**
 * Delete project by company name
 * @param {string} companyName - Company name
 * @returns {Promise<void>}
 */
export async function deleteProject(companyName) {
  try {
    const documentId = generateDocumentId(companyName);
    await deleteDoc(doc(db, COLLECTION_NAME, documentId));
    console.log(`Project deleted for company: ${companyName} (ID: ${documentId})`);
  } catch (error) {
    console.error("Error deleting project: ", error);
    throw error;
  }
}