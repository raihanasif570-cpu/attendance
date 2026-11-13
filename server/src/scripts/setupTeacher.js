#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
};

const setupTeacher = async () => {
  try {
    const args = parseArgs();

    const name = args.name || 'Prof. Robert Vance';
    const email = (args.email || 'teacher@college.edu').toLowerCase().trim();
    const password = args.password || 'teacher123';
    const role = args.role === 'admin' ? 'admin' : 'teacher';
    const employeeId = args.employeeId || 'EMP-CSE-101';
    const designation = args.designation || (role === 'admin' ? 'Head Administrator' : 'HOD & Professor');

    console.log('Connecting to database...');
    await connectDB();

    // Check if department exists, if not create default
    let dept = await Department.findOne();
    if (!dept) {
      console.log('No department found. Creating default Computer Science department...');
      dept = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science & Engineering',
      });
    }

    // Check if account already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log(`Account with email "${email}" already exists.`);
      console.log('Updating password and activating role...');
      user.name = name;
      user.password = password; // pre-save hook hashes with bcrypt
      user.role = role;
      user.employeeId = employeeId;
      user.designation = designation;
      user.department = dept._id;
      user.isActive = true;
      await user.save();
      console.log(`Successfully updated ${role} account: ${email}`);
    } else {
      console.log(`Creating initial secure ${role} account for: ${name} (${email})...`);
      user = await User.create({
        name,
        email,
        password, // pre-save hook hashes with bcrypt
        role,
        employeeId,
        designation,
        department: dept._id,
        phone: '+91 98765 43210',
        isActive: true,
      });
      console.log(`Successfully created initial ${role} account:`);
    }

    console.log('----------------------------------------------------');
    console.log(`Name:        ${user.name}`);
    console.log(`Email:       ${user.email}`);
    console.log(`Role:        ${user.role}`);
    console.log(`Employee ID: ${user.employeeId}`);
    console.log(`Designation: ${user.designation}`);
    console.log('Password:    [Securely Hashed with bcrypt]');
    console.log('----------------------------------------------------');
    console.log('Login is now available at the college login page.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
};

setupTeacher();
