const axios = require('axios');
const Report = require('../models/Report');

exports.analyzeReport = async (reportId) => {
  try {
    const report = await Report.findById(reportId);
    if (!report) return;

    const analysisData = {
      text: `${report.title} ${report.description}`,
      hazardType: report.hazardType,
      severity: report.severity,
      media: report.media
    };

    // Call ML service for analysis
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze`,
      analysisData,
      { timeout: 30000 }
    );

    const { sentiment, confidence, keywords, fakeDetection } = response.data;

    // Update report with ML analysis
    await Report.findByIdAndUpdate(reportId, {
      mlAnalysis: {
        sentiment,
        confidence,
        keywords,
        fakeDetection
      },
      verificationScore: fakeDetection.isFake ? 0.2 : 0.8
    });

    console.log(`ML analysis completed for report ${reportId}`);
  } catch (error) {
    console.error('ML analysis failed:', error.message);
  }
};

exports.analyzeSocialMedia = async (keywords, location) => {
  try {
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/social-media`,
      { keywords, location },
      { timeout: 30000 }
    );

    return response.data;
  } catch (error) {
    console.error('Social media analysis failed:', error.message);
    return null;
  }
};