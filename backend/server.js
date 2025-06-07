/**
 * Full-stack Job Portal Backend
 * Tech: Node.js + Express + MySQL + JWT + Joi validation
 */
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// MySQL connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// Middleware
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	}),
);
app.use(express.json());

// Utility: Generate Access Token
function generateAccessToken(user) {
	return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}
// Utility: Generate Refresh Token
function generateRefreshToken(user) {
	return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// Authentication Middleware
function authenticateJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) return res.sendStatus(401);

	const token = authHeader.split(' ')[1];
	jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user; // { id, email, role }
		next();
	});
}

// Admin role check Middleware
function authorizeAdmin(req, res, next) {
	if (req.user.role !== 'admin') return res.sendStatus(403);
	next();
}

// Validation Schemas
const registerSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

const jobSchema = Joi.object({
	title: Joi.string().min(3).required(),
	company: Joi.string().min(2).required(),
	location: Joi.string().min(2).required(),
	description: Joi.string().min(10).required(),
});

const applySchema = Joi.object({
	coverLetter: Joi.string().allow('').max(500),
});

// Routes

// Health check
app.get('/', (req, res) => res.send({ message: 'Job Portal API is running' }));

// Register new user
app.post('/api/register', async (req, res) => {
	try {
		const { error } = registerSchema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const { email, password } = req.body;

		const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
			email,
		]);
		if (rows.length > 0)
			return res.status(400).json({ error: 'Email already registered' });

		const hashedPassword = await bcrypt.hash(password, 10);

		await pool.query(
			'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
			[email, hashedPassword, 'user'],
		);

		res.json({ message: 'User registered successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Login user (user or admin)
app.post('/api/login', async (req, res) => {
	try {
		const { error } = loginSchema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const { email, password } = req.body;

		const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
			email,
		]);
		if (rows.length === 0)
			return res.status(400).json({ error: 'Invalid credentials' });

		const user = rows[0];
		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(400).json({ error: 'Invalid credentials' });

		// Payload with user id, email, role
		const payload = { id: user.id, email: user.email, role: user.role };

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		// Save refresh token in DB to invalidate if needed (simple approach)
		await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [
			refreshToken,
			user.id,
		]);

		res.json({
			accessToken,
			refreshToken,
			user: { id: user.id, email: user.email, role: user.role },
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Refresh token endpoint
app.post('/api/token', async (req, res) => {
	const { token } = req.body;
	if (!token) return res.status(401).json({ error: 'Token required' });

	try {
		const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
		// Check if refresh token matches DB record for user
		const [rows] = await pool.query(
			'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
			[payload.id, token],
		);
		if (rows.length === 0)
			return res.status(403).json({ error: 'Invalid refresh token' });

		const newAccessToken = generateAccessToken({
			id: payload.id,
			email: payload.email,
			role: payload.role,
		});
		res.json({ accessToken: newAccessToken });
	} catch (err) {
		return res.status(403).json({ error: 'Invalid refresh token' });
	}
});

// Logout (invalidate refresh token)
app.post('/api/logout', authenticateJWT, async (req, res) => {
	try {
		await pool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [
			req.user.id,
		]);
		res.json({ message: 'Logged out successfully' });
	} catch {
		res.status(500).json({ error: 'Server error' });
	}
});

// Get all active jobs with optional filters
app.get('/api/jobs', async (req, res) => {
	try {
		// filters: title, company, location
		const { title, company, location } = req.query;
		let query = 'SELECT * FROM jobs WHERE 1=1';
		const params = [];

		if (title) {
			query += ' AND title LIKE ?';
			params.push('%' + title + '%');
		}
		if (company) {
			query += ' AND company LIKE ?';
			params.push('%' + company + '%');
		}
		if (location) {
			query += ' AND location LIKE ?';
			params.push('%' + location + '%');
		}
		query += ' ORDER BY created_at DESC';

		const [rows] = await pool.query(query, params);
		res.json(rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Get job details by id
app.get('/api/jobs/:id', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [
			req.params.id,
		]);
		if (rows.length === 0)
			return res.status(404).json({ error: 'Job not found' });

		res.json(rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Apply to a job
app.post('/api/jobs/:id/apply', authenticateJWT, async (req, res) => {
	try {
		const { error } = applySchema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const jobId = req.params.id;
		const userId = req.user.id;
		const { coverLetter } = req.body;

		// Check if job exists
		const [jobRows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [
			jobId,
		]);
		if (jobRows.length === 0)
			return res.status(404).json({ error: 'Job not found' });

		// Check if user already applied
		const [appRows] = await pool.query(
			'SELECT * FROM applications WHERE job_id = ? AND user_id = ?',
			[jobId, userId],
		);
		if (appRows.length > 0)
			return res.status(400).json({ error: 'You already applied to this job' });

		// Insert application
		await pool.query(
			'INSERT INTO applications (job_id, user_id, cover_letter) VALUES (?, ?, ?)',
			[jobId, userId, coverLetter || ''],
		);

		res.json({ message: 'Applied successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Admin only routes: create/update/delete jobs & view applicants

// Create job
app.post(
	'/api/admin/jobs',
	authenticateJWT,
	authorizeAdmin,
	async (req, res) => {
		try {
			const { error } = jobSchema.validate(req.body);
			if (error)
				return res.status(400).json({ error: error.details[0].message });

			const { title, company, location, description } = req.body;

			await pool.query(
				'INSERT INTO jobs (title, company, location, description, created_at) VALUES (?, ?, ?, ?, NOW())',
				[title, company, location, description],
			);

			res.json({ message: 'Job created successfully' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Server error' });
		}
	},
);

// Update job
app.put(
	'/api/admin/jobs/:id',
	authenticateJWT,
	authorizeAdmin,
	async (req, res) => {
		try {
			const { error } = jobSchema.validate(req.body);
			if (error)
				return res.status(400).json({ error: error.details[0].message });

			const { title, company, location, description } = req.body;
			const jobId = req.params.id;

			const [result] = await pool.query(
				'UPDATE jobs SET title=?, company=?, location=?, description=? WHERE id=?',
				[title, company, location, description, jobId],
			);

			if (result.affectedRows === 0)
				return res.status(404).json({ error: 'Job not found' });

			res.json({ message: 'Job updated successfully' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Server error' });
		}
	},
);

// Delete job
app.delete(
	'/api/admin/jobs/:id',
	authenticateJWT,
	authorizeAdmin,
	async (req, res) => {
		try {
			const jobId = req.params.id;
			const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [
				jobId,
			]);
			if (result.affectedRows === 0)
				return res.status(404).json({ error: 'Job not found' });

			// Also delete related applications
			await pool.query('DELETE FROM applications WHERE job_id = ?', [jobId]);

			res.json({ message: 'Job and related applications deleted' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Server error' });
		}
	},
);

// View applicants per job (admin only)
app.get(
	'/api/admin/jobs/:id/applicants',
	authenticateJWT,
	authorizeAdmin,
	async (req, res) => {
		try {
			const jobId = req.params.id;

			// Check job exists
			const [jobRows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [
				jobId,
			]);
			if (jobRows.length === 0)
				return res.status(404).json({ error: 'Job not found' });

			// Get applications with applicant info
			const [applicants] = await pool.query(
				`SELECT a.id, a.cover_letter, a.created_at, u.email 
       FROM applications a JOIN users u ON a.user_id = u.id WHERE a.job_id = ?`,
				[jobId],
			);

			res.json(applicants);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Server error' });
		}
	},
);
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
