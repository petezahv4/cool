const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('codinghub');
        const projects = db.collection('projects');

        const { deploymentName, code } = req.body;
        const deployId = require('crypto').randomBytes(16).toString('hex');

        await projects.insertOne({
            deployId,
            userEmail: decoded.email,
            deploymentName,
            code,
            isDeployed: true,
            createdAt: new Date()
        });

        res.status(200).json({ deployId });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
}