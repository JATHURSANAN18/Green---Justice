const { Report } = require('../models');

const submitReport = async (req, res) => {
  try {
    const { violationType, address, lat, lng, photoVideoUrl, severityLevel } = req.body;
    
    const report = await Report.create({
      violationType,
      address,
      lat,
      lng,
      photoVideoUrl,
      severityLevel: severityLevel || 5
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting report', error });
  }
};

const getReports = async (req, res) => {
  try {
    const { sortBy } = req.query; // 'highlyReported', 'severity', 'recent'
    let order = [['createdAt', 'DESC']];

    if (sortBy === 'highlyReported') {
      order = [['reportCount', 'DESC']];
    } else if (sortBy === 'severity') {
      order = [['severityLevel', 'DESC']];
    }

    const reports = await Report.findAll({ order });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByPk(req.params.id);

    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);

    if (!report) return res.status(404).json({ message: 'Report not found' });

    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const total = await Report.count();
    const resolved = await Report.count({ where: { status: 'resolved' } });
    const inProgress = await Report.count({ where: { status: 'in progress' } });
    const notViewed = await Report.count({ where: { status: 'not viewed' } });

    res.json({ total, resolved, inProgress, notViewed });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitReport, getReports, updateReportStatus, deleteReport, getDashboardStats };
