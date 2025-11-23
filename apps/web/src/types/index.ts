// Task and related type definitions for the application
// This file defines the Task type that is used throughout the app

export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Pending';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

// Session represents a work session for a task (support for multi-day tasks)
export interface TaskSession {
    id: string;
    dateKey: string; // YYYY-MM-DD
    started_at?: string; // ISO timestamp
    start_geo?: {
        lat: number;
        lng: number;
        accuracy?: number;
    };
    beforePhotos: string[]; // Base64 data URLs or object URLs
    notes?: string;
    media?: string[]; // Optional additional media
    ended_at?: string; // ISO timestamp
    end_geo?: {
        lat: number;
        lng: number;
        accuracy?: number;
    };
    afterPhotos: string[]; // Base64 data URLs or object URLs
    signatureDataUrl?: string; // Base64 data URL of signature
}

// Acknowledgment info from the site contact person
export interface TaskAcknowledgment {
    name?: string;
    phone?: string;
    note?: string;
}

// Main Task interface
export interface Task {
    id: string;
    title: string;
    taskType?: string;
    taskTypeId?: number;
    client?: string;
    clientId?: number;
    clientName?: string; // Alias for client
    clientSite?: string;
    siteId?: number;
    siteName?: string; // Alias for clientSite
    siteMapUrl?: string;
    assignedTo?: string;
    assignedUserId?: number;
    priority?: TaskPriority;
    status: TaskStatus;
    dueDate?: string; // YYYY-MM-DD
    scheduledDate?: string; // YYYY-MM-DD
    skillRequired?: string;
    description?: string;
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
    remarks?: string;
    contactName?: string;
    onsiteContactName?: string; // Alias for contactName
    contactNumber?: string;
    phone?: string; // Alias for contactNumber

    // Photo and session management fields
    sessions?: TaskSession[];
    beforePhotos?: string[]; // Legacy/fallback field
    afterPhotos?: string[]; // Legacy/fallback field
    signature?: string | null; // Final signature data URL
    ack?: TaskAcknowledgment | null; // Site person acknowledgment

    // Additional metadata
    origin?: 'admin' | 'user';
    startLocation?: { lat: number; lng: number };
    endLocation?: { lat: number; lng: number };
}

// User interface
export interface User {
    id: number;
    username: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: 'admin' | 'user';
    skills?: string[];
    available?: boolean;
    dept?: string;
    phone?: string;
    email?: string;
    status?: string;
    lastActive?: string;
}

// Expense interface
export interface Expense {
    id: string;
    number?: string;
    date: string;
    vno?: string;
    payBy?: string;
    payTo?: string;
    description: string;
    amount: number;
    taskId?: string;
    user?: string;
}
