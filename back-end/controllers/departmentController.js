const { Department, Report } = require('../models');
const { Op } = require('sequelize');

const suggestDepartment = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Use string LIKE match since handledViolations is stored as JSON array string
    const department = await Department.findOne({
      where: {
        handledViolations: {
          [Op.like]: `%${report.violationType}%`
        }
      }
    });

    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ message: 'No relevant department found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { suggestDepartment, createDepartment };
