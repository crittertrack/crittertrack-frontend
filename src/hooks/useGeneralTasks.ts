import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * useGeneralTasks - Manages standalone Feeding & Care tasks that are NOT tied to any single
 * animal or enclosure (e.g. "Feed the mouse colony"), so a user with 100+ animals gets ONE
 * recurring reminder instead of maintaining/receiving 100 separate per-animal schedules.
 * Tasks may optionally reference a set of animals purely for display context — that list does
 * NOT create per-animal due-dates/notifications, the task itself has exactly one due date.
 *
 * @param authToken - Current auth token for API calls
 * @param API_BASE_URL - API base URL
 */
export function useGeneralTasks(authToken: string | null, API_BASE_URL: string) {
    const [generalCareTasks, setGeneralCareTasks] = useState<any[]>([]);
    const [loadingGeneralTasks, setLoadingGeneralTasks] = useState(false);

    useEffect(() => {
        if (!authToken) return;
        setLoadingGeneralTasks(true);
        axios.get(`${API_BASE_URL}/users/general-tasks`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                setGeneralCareTasks(Array.isArray(res.data?.generalCareTasks) ? res.data.generalCareTasks : []);
            })
            .catch(err => console.warn('[GENERAL TASKS] Failed to load from backend:', err.message))
            .finally(() => setLoadingGeneralTasks(false));
    }, [authToken, API_BASE_URL]);

    const saveGeneralTasks = useCallback((tasks: any[]) => {
        if (!authToken) return Promise.resolve();
        return axios.put(`${API_BASE_URL}/users/general-tasks`, { generalCareTasks: tasks }, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).catch(err => console.error('[GENERAL TASKS] Failed to save to backend:', err));
    }, [authToken, API_BASE_URL]);

    const addGeneralTask = useCallback((task: any) => {
        const newTask = {
            id: `gtask-${Date.now()}`,
            taskName: task.taskName,
            type: task.type || 'Feeding',
            notes: task.notes || null,
            frequency: task.frequency || null,
            frequencyUnit: task.frequencyUnit || 'days',
            lastDoneDate: null,
            lastSkipped: false,
            assignedAnimals: task.assignedAnimals || [],
        };
        setGeneralCareTasks(prev => {
            const next = [...prev, newTask];
            saveGeneralTasks(next);
            return next;
        });
    }, [saveGeneralTasks]);

    const updateGeneralTask = useCallback((id: string, updates: any) => {
        setGeneralCareTasks(prev => {
            const next = prev.map((t: any) => t.id === id ? { ...t, ...updates } : t);
            saveGeneralTasks(next);
            return next;
        });
    }, [saveGeneralTasks]);

    const markGeneralTaskDone = useCallback((id: string) => {
        updateGeneralTask(id, { lastDoneDate: new Date().toISOString(), lastSkipped: false });
    }, [updateGeneralTask]);

    const skipGeneralTask = useCallback((id: string) => {
        updateGeneralTask(id, { lastDoneDate: new Date().toISOString(), lastSkipped: true });
    }, [updateGeneralTask]);

    const deleteGeneralTask = useCallback((id: string) => {
        setGeneralCareTasks(prev => {
            const next = prev.filter((t: any) => t.id !== id);
            saveGeneralTasks(next);
            return next;
        });
    }, [saveGeneralTasks]);

    return {
        generalCareTasks,
        loadingGeneralTasks,
        addGeneralTask,
        updateGeneralTask,
        markGeneralTaskDone,
        skipGeneralTask,
        deleteGeneralTask,
    };
}
