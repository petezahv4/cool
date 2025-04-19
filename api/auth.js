const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('codinghub');
        const users = db.collection('users');
        const user = await users.findOne({ email: decoded.email });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.status(200).json({ username: user.username });
    } catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
}