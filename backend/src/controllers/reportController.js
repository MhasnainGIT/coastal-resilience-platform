const Report = require('../models/Report');
const Joi = require('joi');
const { uploadToS3 } = require('../services/s3Service');
const { analyzeReport } = require('../services/mlService');

const reportSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  hazardType: Joi.string().valid('cyclone', 'tsunami', 'flood', 'storm_surge', 'other').required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required(),
  address: Joi.string().required(),
  isEmergency: Joi.boolean().default(false)
});

exports.createReport = async (req, res) => {
  try {
    const { error, value } = reportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const reportData = {
      ...value,
      user: req.user.id,
      location: {
        type: 'Point',
        coordinates: value.location.coordinates
      }
    };

    // Handle media uploads
    if (req.files && req.files.length > 0) {
      const mediaUploads = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await uploadToS3(file);
          return {
            type: file.mimetype.startsWith('image') ? 'image' : 
                  file.mimetype.startsWith('video') ? 'video' : 'audio',
            url: uploadResult.Location,
            filename: uploadResult.Key
          };
        })
      );
      reportData.media = mediaUploads;
    }

    const report = await Report.create(reportData);

    // Trigger ML analysis asynchronously
    analyzeReport(report._id).catch(console.error);

    const populatedReport = await Report.findById(report._id).populate('user', 'name email');
    
    // Emit real-time update
    req.io.emit('newReport', populatedReport);

    res.status(201).json({
      success: true,
      report: populatedReport
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      hazardType, 
      status, 
      severity,
      lat,
      lng,
      radius = 10000 // 10km default
    } = req.query;

    const query = {};
    
    if (hazardType) query.hazardType = hazardType;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    // Geospatial query if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const reports = await Report.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Increment view count
    await Report.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'verified', 'rejected', 'investigating'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Emit real-time update
    req.io.emit('reportStatusUpdate', { reportId: report._id, status });

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};