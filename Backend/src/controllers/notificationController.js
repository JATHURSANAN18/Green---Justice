import db from '../database/db.js';

// Automatically trigger reminders for unresolved complaints older than 7 days
export const triggerReminders = async (req, res) => {
    try {
        // Find unresolved complaints older than 7 days
        const [complaints] = await db.query(`
            SELECT complaint_id, assigned_authority_id, report_date 
            FROM Complaints 
            WHERE status != 'Resolved' 
            AND report_date <= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        if (complaints.length === 0) {
            return res.status(200).json({ message: 'No reminders to trigger' });
        }

        const reminderValues = complaints.map(c => [
            c.complaint_id, 
            new Date(), 
            false, 
            c.assigned_authority_id
        ]);

        // Insert into reminders
        await db.query(
            'INSERT IGNORE INTO Reminders (complaint_id, scheduled_date, sent_status, recipient_authority_id) VALUES ?',
            [reminderValues]
        );

        res.status(200).json({ message: `Triggered ${complaints.length} reminders` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process reminders' });
    }
};

export const getStatusTimeline = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const [timeline] = await db.query(
            'SELECT * FROM StatusUpdates WHERE complaint_id = ? ORDER BY timestamp DESC',
            [complaintId]
        );

        res.status(200).json(timeline);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch timeline' });
    }
};
