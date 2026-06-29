import { Timestamp } from 'firebase/firestore';

export const processMessageForReminder = (message) => {
    const text = message.text.toLowerCase();
    
    let sentAt;
    if (message.sentAt?.toDate) { // Check for Firestore Timestamp
        sentAt = message.sentAt.toDate();
    } else if (message.sentAt) {
        sentAt = new Date(message.sentAt); // Works for JS Date objects and ISO strings
    } else {
        sentAt = new Date(); // Fallback to now
    }

    if (isNaN(sentAt.getTime())) {
        sentAt = new Date();
    }

    let reminderDate = null;
    let match;

    if (text.includes('tomorrow')) {
        reminderDate = new Date(sentAt.getTime() + 24 * 60 * 60 * 1000);
    } else if (text.includes('day after tomorrow')) {
        reminderDate = new Date(sentAt.getTime() + 2 * 24 * 60 * 60 * 1000);
    } else if (text.includes('next week')) {
        reminderDate = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if ((match = text.match(/in\s+(\d+)\s+(day|week|month)s?/))) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        reminderDate = new Date(sentAt);
        if (unit === 'day') {
            reminderDate.setDate(reminderDate.getDate() + value);
        } else if (unit === 'week') {
            reminderDate.setDate(reminderDate.getDate() + value * 7);
        } else if (unit === 'month') {
            reminderDate.setMonth(reminderDate.getMonth() + value);
        }
    } else {
        const dateRegex = new RegExp(
            '(' +
            // Date formats: dd/mm/yyyy, mm-dd-yy, etc.
            '\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}|' +
            // ISO-like format: yyyy-mm-dd
            '\\d{4}[\\/\\-]\\d{1,2}[\\/\\-]\\d{1,2}|' +
            // Textual month formats: Jan 5, 2024, 5th of January 2024
            '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\\s,.]+\\d{1,2}(?:st|nd|rd|th)?[\\s,.]*\\d{4}|' +
            '\\d{1,2}(?:st|nd|rd|th)?[\\s,.]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\\s,.]+\\d{4}' +
            ')', 'i'
        );

        match = text.match(dateRegex);
        if (match) {
            // Attempt to create a date from the matched string, replacing common separators.
            const parsedDate = new Date(match[0].replace(/,/g, '').replace(/\//g, '-'));
            if (!isNaN(parsedDate.getTime())) {
                reminderDate = parsedDate;
            }
        }
    }

    if (reminderDate) {
        let timeMatch = text.match(/at\s+(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
            const ampm = timeMatch[4];

            if (ampm && ampm.toLowerCase() === 'pm' && hours < 12) {
                hours += 12;
            } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
                hours = 0; // Midnight case
            }
            
            reminderDate.setHours(hours, minutes, 0, 0);
        }
        
        return {
            id: message.id,
            text: message.text,
            date: reminderDate,
            group: message.groupName || null,
        };
    }

    return null;
};