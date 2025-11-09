/**
 * Storage Types
 *
 * Type definitions for project storage and management.
 */

import type { Beam } from '../../types/beam';

export interface ProjectMetadata {
  created: Date;
  modified: Date;
  version: string;
  engineer?: string;
  company?: string;
  description?: string;
}

export interface SavedProject {
  id: string;
  name: string;
  beam: Beam;
  metadata: ProjectMetadata;
}

export interface AutoSaveState {
  beam: Beam;
  timestamp: Date;
}

export interface StorageStats {
  totalProjects: number;
  storageUsed: number;  // in bytes
  storageLimit: number; // in bytes (typically 5MB for localStorage)
  oldestProject?: Date;
  newestProject?: Date;
}
