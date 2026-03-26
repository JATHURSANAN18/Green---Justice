import db from '../database/db.js';

export const registerUser = async (req, res) => {
    try {
        const { preferred_language } = req.body;
        const [result] = await db.query(
            'INSERT INTO Users (preferred_language) VALUES (?)',
            [preferred_language || 'English']
        );
        res.status(201).json({ message: 'User registered', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
};

export const getUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM Users WHERE user_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
};
