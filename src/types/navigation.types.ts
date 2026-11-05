/**
 * Navigation Types
 * Defines navigation and screen routing structures
 */

import React from 'react';

/**
 * Screen configuration for sidebar navigation
 * Represents a navigable view in the dashboard
 */
export interface Screen {
  /** Unique identifier for the screen */
  id: string;
  /** Display label shown in the sidebar */
  label: string;
  /** Optional icon identifier or icon component */
  icon?: string;
  /** Optional React component to render for this screen */
  component?: React.ComponentType;
}
