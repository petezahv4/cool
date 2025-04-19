const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.cookies.token;
    const { project, deploy } = req.query;

    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('codinghub');
        const projects = db.collection('projects');

        if (project) {
            const projectData = await projects.findOne({ projectId: project, isShared: true });
            if (!projectData) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.status(200).json(projectData.code);
        } else if (deploy) {
            const deployData = await projects.findOne({ deployId: deploy, isDeployed: true });
            if (!deployData) {
                return res.status(404).json({ error: 'Deployment not found' });
            }
            res.status(200).json(deployData.code);
        } else if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const projectData = await projects.findOne({ userEmail: decoded.email, isDefault: true });
            res.status(200).json(projectData ? projectData.code : null);
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch {
        res.status(500).json({ error: 'Server error' });
    } finally {
        await client.close();
    }
}