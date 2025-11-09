/**
 * Project Manager
 *
 * Manages named project storage, retrieval, and organization.
 */

import type { Beam } from '../../types/beam';
import type { SavedProject, ProjectMetadata, StorageStats } from './types';
import {
  saveToLocalStorage,
  loadFromLocalStorage,

  PROJECTS_KEY,
  getStorageStats,
} from './localStorage';

const APP_VERSION = '2.0.0';

/**
 * Save a project with a name
 */
export function saveProject(
  beam: Beam,
  projectName: string,
  metadata?: Partial<ProjectMetadata>
): SavedProject | null {
  try {
    // Load existing projects
    const projects = getAllProjects();

    // Check if project with same name exists
    const existingIndex = projects.findIndex((p) => p.name === projectName);

    const now = new Date();
    const project: SavedProject = {
      id: existingIndex >= 0 ? projects[existingIndex].id : generateProjectId(),
      name: projectName,
      beam,
      metadata: {
        created: existingIndex >= 0 ? projects[existingIndex].metadata.created : now,
        modified: now,
        version: APP_VERSION,
        ...metadata,
      },
    };

    // Update or add project
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }

    // Sort by modified date (newest first)
    projects.sort(
      (a, b) =>
        new Date(b.metadata.modified).getTime() -
        new Date(a.metadata.modified).getTime()
    );

    // Save to localStorage
    const success = saveToLocalStorage(PROJECTS_KEY, projects);

    return success ? project : null;
  } catch (error) {
    console.error('Error saving project:', error);
    return null;
  }
}

/**
 * Load a project by ID
 */
export function loadProject(projectId: string): SavedProject | null {
  try {
    const projects = getAllProjects();
    const project = projects.find((p) => p.id === projectId);
    return project || null;
  } catch (error) {
    console.error('Error loading project:', error);
    return null;
  }
}

/**
 * Delete a project by ID
 */
export function deleteProject(projectId: string): boolean {
  try {
    const projects = getAllProjects();
    const filteredProjects = projects.filter((p) => p.id !== projectId);

    if (filteredProjects.length === projects.length) {
      // Project not found
      return false;
    }

    return saveToLocalStorage(PROJECTS_KEY, filteredProjects);
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

/**
 * Get all saved projects
 */
export function getAllProjects(): SavedProject[] {
  try {
    const projects = loadFromLocalStorage<SavedProject[]>(PROJECTS_KEY);
    return projects || [];
  } catch (error) {
    console.error('Error getting all projects:', error);
    return [];
  }
}

/**
 * Rename a project
 */
export function renameProject(projectId: string, newName: string): boolean {
  try {
    const projects = getAllProjects();
    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex < 0) {
      return false;
    }

    projects[projectIndex].name = newName;
    projects[projectIndex].metadata.modified = new Date();

    return saveToLocalStorage(PROJECTS_KEY, projects);
  } catch (error) {
    console.error('Error renaming project:', error);
    return false;
  }
}

/**
 * Duplicate a project
 */
export function duplicateProject(projectId: string): SavedProject | null {
  try {
    const project = loadProject(projectId);
    if (!project) {
      return null;
    }

    const copyName = `${project.name} (Copy)`;
    return saveProject(project.beam, copyName, {
      engineer: project.metadata.engineer,
      company: project.metadata.company,
      description: project.metadata.description,
    });
  } catch (error) {
    console.error('Error duplicating project:', error);
    return null;
  }
}

/**
 * Export project to JSON file
 */
export function exportProjectToJSON(project: SavedProject): void {
  try {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting project:', error);
  }
}

/**
 * Import project from JSON file
 */
export async function importProjectFromJSON(file: File): Promise<SavedProject | null> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate the imported data
    if (!data.beam || !data.name) {
      throw new Error('Invalid project file format');
    }

    // Create a new project with imported data
    const projectName = data.name;
    const metadata: Partial<ProjectMetadata> = {
      engineer: data.metadata?.engineer,
      company: data.metadata?.company,
      description: data.metadata?.description,
    };

    return saveProject(data.beam, projectName, metadata);
  } catch (error) {
    console.error('Error importing project:', error);
    return null;
  }
}

/**
 * Get storage statistics for projects
 */
export function getProjectStorageStats(): StorageStats {
  try {
    const projects = getAllProjects();
    const storageStats = getStorageStats();

    if (projects.length === 0) {
      return {
        totalProjects: 0,
        storageUsed: storageStats.used,
        storageLimit: storageStats.total,
      };
    }

    const dates = projects.map((p) => new Date(p.metadata.modified));
    const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const newest = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
      totalProjects: projects.length,
      storageUsed: storageStats.used,
      storageLimit: storageStats.total,
      oldestProject: oldest,
      newestProject: newest,
    };
  } catch (error) {
    console.error('Error getting project storage stats:', error);
    return {
      totalProjects: 0,
      storageUsed: 0,
      storageLimit: 5 * 1024 * 1024,
    };
  }
}

/**
 * Generate a unique project ID
 */
function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Search projects by name or description
 */
export function searchProjects(query: string): SavedProject[] {
  try {
    const projects = getAllProjects();
    const lowerQuery = query.toLowerCase();

    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.metadata.description?.toLowerCase().includes(lowerQuery) ||
        p.metadata.engineer?.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
}
