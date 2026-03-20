const cron = require('node-cron');
const { Report } = require('../models');
const { Op } = require('sequelize');

cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cron job for unaddressed reports...');

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oldReports = await Report.findAll({
      where: {
        status: { [Op.in]: ['not viewed', 'in progress'] },
        createdAt: { [Op.lt]: oneWeekAgo }
      }
    });

    if (oldReports.length > 0) {
      console.log(`[Reminder] ${oldReports.length} reports have not been addressed in over a week.`);
      oldReports.forEach(report => {
        console.log(`- Alert for Report ID: ${report.id} (${report.violationType}) - Status: ${report.status}`);
      });
    } else {
      console.log('No old unaddressed reports found.');
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});
