import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileGroupContext = createContext();

export function useProfileGroup() {
  const context = useContext(ProfileGroupContext);
  if (!context) {
    throw new Error('useProfileGroup must be used within ProfileGroupProvider');
  }
  return context;
}

export function ProfileGroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.loadProfileGroups();
      if (result.success) {
        // Sort by order
        const sortedGroups = result.data.sort((a, b) => a.order - b.order);
        setGroups(sortedGroups);
      } else {
        setError(result.error || 'Failed to load profile groups');
      }
    } catch (err) {
      setError(`Error loading profile groups: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function createGroup(groupData) {
    try {
      setError(null);

      // Validate group count
      if (groups.length >= 20) {
        setError('Maximum profile group limit (20) reached');
        return null;
      }

      // Check for duplicate names
      if (groups.some(g => g.name === groupData.name)) {
        setError('A group with this name already exists');
        return null;
      }

      const newGroup = {
        id: crypto.randomUUID(),
        name: groupData.name,
        color: groupData.color || '#1976d2',
        description: groupData.description || '',
        collapsed: false,
        order: groups.length
      };

      const result = await window.electronAPI.saveProfileGroup(newGroup);
      if (result.success) {
        await loadGroups();
        return result.data;
      } else {
        setError(result.error || 'Failed to create group');
        return null;
      }
    } catch (err) {
      setError(`Error creating group: ${err.message}`);
      return null;
    }
  }

  async function updateGroup(groupId, updates) {
    try {
      setError(null);
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        setError('Group not found');
        return null;
      }

      // Check for duplicate names (excluding current group)
      if (updates.name && groups.some(g => g.id !== groupId && g.name === updates.name)) {
        setError('A group with this name already exists');
        return null;
      }

      const updatedGroup = {
        ...group,
        ...updates
      };

      const result = await window.electronAPI.saveProfileGroup(updatedGroup);
      if (result.success) {
        await loadGroups();
        return result.data;
      } else {
        setError(result.error || 'Failed to update group');
        return null;
      }
    } catch (err) {
      setError(`Error updating group: ${err.message}`);
      return null;
    }
  }

  async function deleteGroup(groupId) {
    try {
      setError(null);
      const result = await window.electronAPI.deleteProfileGroup(groupId);
      if (result.success) {
        await loadGroups();
        return true;
      } else {
        setError(result.error || 'Failed to delete group');
        return false;
      }
    } catch (err) {
      setError(`Error deleting group: ${err.message}`);
      return false;
    }
  }

  async function toggleCollapsed(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      return await updateGroup(groupId, { collapsed: !group.collapsed });
    }
    return null;
  }

  const value = {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    toggleCollapsed,
    refreshGroups: loadGroups
  };

  return (
    <ProfileGroupContext.Provider value={value}>
      {children}
    </ProfileGroupContext.Provider>
  );
}
