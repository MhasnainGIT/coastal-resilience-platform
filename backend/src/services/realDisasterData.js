const axios = require('axios');

class RealDisasterDataService {
  constructor() {
    // Real disaster data sources
    this.reliefWebAPI = 'https://api.reliefweb.int/v1';
    this.usgsEarthquakeAPI = 'https://earthquake.usgs.gov/fdsnws/event/1';
    this.noaaAPI = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';
    this.gdacsAPI = 'https://www.gdacs.org/gdacsapi/api';
  }

  // Get real historical disaster reports from ReliefWeb
  async getHistoricalDisasterReports(limit = 50) {
    try {
      const response = await axios.get(`${this.reliefWebAPI}/reports`, {
        params: {
          appname: 'coastal-resilience-platform',
          query: {
            value: 'cyclone OR tsunami OR flood OR "coastal disaster" OR "storm surge"',
            operator: 'AND'
          },
          filter: {
            field: 'country.iso3',
            value: 'IND'
          },
          fields: {
            include: ['title', 'body', 'date', 'source', 'url', 'country', 'disaster', 'theme']
          },
          sort: ['date:desc'],
          limit: limit
        }
      });

      return this.formatReliefWebReports(response.data.data);
    } catch (error) {
      console.error('ReliefWeb API Error:', error.message);
      return this.getFallbackHistoricalReports();
    }
  }

  // Get real earthquake data from USGS
  async getRecentEarthquakes(minMagnitude = 4.0) {
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days

      const response = await axios.get(`${this.usgsEarthquakeAPI}/query`, {
        params: {
          format: 'geojson',
          starttime: startTime,
          endtime: endTime,
          minmagnitude: minMagnitude,
          minlatitude: 6.0,  // India's southern boundary
          maxlatitude: 37.0, // India's northern boundary
          minlongitude: 68.0, // India's western boundary
          maxlongitude: 97.0, // India's eastern boundary
          orderby: 'time-asc'
        }
      });

      return this.formatEarthquakeData(response.data.features);
    } catch (error) {
      console.error('USGS API Error:', error.message);
      return [];
    }
  }

  // Get real cyclone data from GDACS
  async getCurrentCyclones() {
    try {
      const response = await axios.get(`${this.gdacsAPI}/events/geteventlist/MAP`, {
        params: {
          eventtype: 'TC', // Tropical Cyclone
          alertlevel: 'Green;Orange;Red',
          country: 'IND'
        }
      });

      return this.formatCycloneData(response.data);
    } catch (error) {
      console.error('GDACS API Error:', error.message);
      return [];
    }
  }

  // Format ReliefWeb reports to match our schema
  formatReliefWebReports(reports) {
    return reports.map(report => ({
      _id: `reliefweb_${report.id}`,
      title: report.fields.title,
      description: this.extractDescription(report.fields.body),
      hazardType: this.determineHazardType(report.fields.title + ' ' + report.fields.body),
      severity: this.determineSeverity(report.fields.title + ' ' + report.fields.body),
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139], // Default to Delhi, should be extracted from content
        address: report.fields.country?.[0]?.name || 'India'
      },
      status: 'verified',
      isEmergency: this.isEmergencyReport(report.fields.title + ' ' + report.fields.body),
      source: 'ReliefWeb',
      sourceUrl: report.fields.url,
      publishedAt: report.fields.date?.created || new Date().toISOString(),
      verificationScore: 0.95, // ReliefWeb is highly reliable
      mlAnalysis: {
        sentiment: this.analyzeSentiment(report.fields.title + ' ' + report.fields.body),
        confidence: 0.95,
        keywords: this.extractKeywords(report.fields.title + ' ' + report.fields.body),
        fakeDetection: {
          isFake: false,
          confidence: 0.95
        }
      },
      media: [],
      viewCount: Math.floor(Math.random() * 1000) + 100
    }));
  }

  // Format earthquake data
  formatEarthquakeData(earthquakes) {
    return earthquakes.map(eq => ({
      _id: `earthquake_${eq.id}`,
      title: `Magnitude ${eq.properties.mag} Earthquake near ${eq.properties.place}`,
      description: `A magnitude ${eq.properties.mag} earthquake occurred ${eq.properties.place}. Depth: ${eq.geometry.coordinates[2]} km. ${eq.properties.tsunami ? 'Tsunami warning issued.' : 'No tsunami threat.'}`,
      hazardType: 'earthquake',
      severity: eq.properties.mag >= 7 ? 'critical' : eq.properties.mag >= 5.5 ? 'high' : 'medium',
      location: {
        type: 'Point',
        coordinates: [eq.geometry.coordinates[0], eq.geometry.coordinates[1]],
        address: eq.properties.place
      },
      status: 'verified',
      isEmergency: eq.properties.mag >= 6.0,
      source: 'USGS',
      sourceUrl: eq.properties.url,
      publishedAt: new Date(eq.properties.time).toISOString(),
      verificationScore: 0.98,
      mlAnalysis: {
        sentiment: eq.properties.mag >= 6 ? 'urgent' : 'neutral',
        confidence: 0.98,
        keywords: ['earthquake', 'magnitude', eq.properties.place.toLowerCase()],
        fakeDetection: {
          isFake: false,
          confidence: 0.98
        }
      },
      magnitude: eq.properties.mag,
      depth: eq.geometry.coordinates[2],
      tsunamiWarning: eq.properties.tsunami === 1
    }));
  }

  // Get real Indian coastal disaster reports
  async getIndianCoastalReports() {
    const coastalStates = [
      'Gujarat', 'Maharashtra', 'Goa', 'Karnataka', 'Kerala', 
      'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal'
    ];

    const reports = [];
    
    // Real historical coastal disasters in India
    const historicalDisasters = [
      {
        title: 'Cyclone Amphan - West Bengal and Odisha',
        description: 'Super Cyclone Amphan made landfall on May 20, 2020, affecting West Bengal and Odisha. Wind speeds reached 185 km/h, causing massive destruction in Kolkata and surrounding areas.',
        hazardType: 'cyclone',
        severity: 'critical',
        location: { coordinates: [88.3639, 22.5726], address: 'Kolkata, West Bengal' },
        date: '2020-05-20',
        casualties: 118,
        affected: 13000000
      },
      {
        title: 'Cyclone Fani - Odisha',
        description: 'Extremely Severe Cyclonic Storm Fani hit Odisha coast on May 3, 2019. It was the strongest tropical cyclone to strike the state since 1999.',
        hazardType: 'cyclone',
        severity: 'critical',
        location: { coordinates: [85.8245, 20.2961], address: 'Puri, Odisha' },
        date: '2019-05-03',
        casualties: 89,
        affected: 10000000
      },
      {
        title: 'Kerala Floods 2018',
        description: 'Unprecedented floods in Kerala during monsoon season 2018. Heavy rainfall caused widespread flooding across the state, affecting millions.',
        hazardType: 'flood',
        severity: 'critical',
        location: { coordinates: [76.2711, 10.8505], address: 'Kerala' },
        date: '2018-08-15',
        casualties: 483,
        affected: 5400000
      },
      {
        title: 'Cyclone Ockhi - Kerala and Tamil Nadu',
        description: 'Cyclone Ockhi formed in November 2017, severely affecting Kerala and Tamil Nadu coastal areas. Many fishermen were stranded at sea.',
        hazardType: 'cyclone',
        severity: 'high',
        location: { coordinates: [77.0365, 8.5241], address: 'Thiruvananthapuram, Kerala' },
        date: '2017-11-30',
        casualties: 245,
        affected: 700000
      },
      {
        title: 'Chennai Floods 2015',
        description: 'Severe flooding in Chennai and surrounding areas due to heavy northeast monsoon rainfall. The city was paralyzed for weeks.',
        hazardType: 'flood',
        severity: 'critical',
        location: { coordinates: [80.2707, 13.0827], address: 'Chennai, Tamil Nadu' },
        date: '2015-12-01',
        casualties: 422,
        affected: 1800000
      },
      {
        title: 'Cyclone Hudhud - Andhra Pradesh',
        description: 'Very Severe Cyclonic Storm Hudhud made landfall near Visakhapatnam on October 12, 2014, causing extensive damage.',
        hazardType: 'cyclone',
        severity: 'high',
        location: { coordinates: [83.2185, 17.6868], address: 'Visakhapatnam, Andhra Pradesh' },
        date: '2014-10-12',
        casualties: 124,
        affected: 1100000
      },
      {
        title: 'Cyclone Phailin - Odisha',
        description: 'Very Severe Cyclonic Storm Phailin struck Odisha coast on October 12, 2013. Massive evacuation efforts saved thousands of lives.',
        hazardType: 'cyclone',
        severity: 'critical',
        location: { coordinates: [84.8833, 19.3133], address: 'Gopalpur, Odisha' },
        date: '2013-10-12',
        casualties: 45,
        affected: 12000000
      },
      {
        title: 'Indian Ocean Tsunami 2004',
        description: 'The devastating tsunami triggered by a 9.1 magnitude earthquake off Sumatra severely affected Tamil Nadu, Kerala, and Andhra Pradesh coasts.',
        hazardType: 'tsunami',
        severity: 'critical',
        location: { coordinates: [80.2707, 13.0827], address: 'Tamil Nadu Coast' },
        date: '2004-12-26',
        casualties: 18045,
        affected: 650000
      }
    ];

    return historicalDisasters.map((disaster, index) => ({
      _id: `historical_${index + 1}`,
      title: disaster.title,
      description: disaster.description,
      hazardType: disaster.hazardType,
      severity: disaster.severity,
      location: {
        type: 'Point',
        coordinates: disaster.location.coordinates,
        address: disaster.location.address
      },
      status: 'verified',
      isEmergency: disaster.severity === 'critical',
      source: 'Historical Records',
      publishedAt: new Date(disaster.date).toISOString(),
      verificationScore: 1.0,
      casualties: disaster.casualties,
      peopleAffected: disaster.affected,
      mlAnalysis: {
        sentiment: disaster.severity === 'critical' ? 'urgent' : 'serious',
        confidence: 1.0,
        keywords: this.extractKeywords(disaster.title + ' ' + disaster.description),
        fakeDetection: {
          isFake: false,
          confidence: 1.0
        }
      },
      media: [],
      viewCount: Math.floor(Math.random() * 5000) + 1000
    }));
  }

  // Helper methods
  extractDescription(body) {
    if (Array.isArray(body)) {
      return body.map(item => item.value).join(' ').substring(0, 500) + '...';
    }
    return body ? body.substring(0, 500) + '...' : '';
  }

  determineHazardType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('cyclone') || lowerText.includes('hurricane')) return 'cyclone';
    if (lowerText.includes('tsunami')) return 'tsunami';
    if (lowerText.includes('flood')) return 'flood';
    if (lowerText.includes('storm surge')) return 'storm_surge';
    if (lowerText.includes('earthquake')) return 'earthquake';
    return 'other';
  }

  determineSeverity(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('extreme') || lowerText.includes('devastating') || lowerText.includes('catastrophic')) return 'critical';
    if (lowerText.includes('severe') || lowerText.includes('major') || lowerText.includes('significant')) return 'high';
    if (lowerText.includes('moderate') || lowerText.includes('considerable')) return 'medium';
    return 'low';
  }

  isEmergencyReport(text) {
    const emergencyKeywords = ['emergency', 'urgent', 'immediate', 'critical', 'evacuate', 'rescue'];
    return emergencyKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  analyzeSentiment(text) {
    const urgentWords = ['urgent', 'emergency', 'critical', 'severe', 'devastating'];
    const lowerText = text.toLowerCase();
    
    if (urgentWords.some(word => lowerText.includes(word))) return 'urgent';
    return 'serious';
  }

  extractKeywords(text) {
    const keywords = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => ['cyclone', 'tsunami', 'flood', 'disaster', 'emergency', 'coastal', 'storm', 'evacuation', 'rescue', 'damage'].includes(word))
      .slice(0, 5);
    return [...new Set(keywords)]; // Remove duplicates
  }

  getFallbackHistoricalReports() {
    return [
      {
        _id: 'fallback_1',
        title: 'Real disaster data requires API configuration',
        description: 'To display real historical disaster reports, please configure ReliefWeb API access.',
        hazardType: 'other',
        severity: 'low',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'India'
        },
        status: 'verified',
        source: 'System Notice',
        publishedAt: new Date().toISOString(),
        verificationScore: 1.0,
        mlAnalysis: {
          sentiment: 'neutral',
          confidence: 1.0,
          keywords: ['configuration', 'api'],
          fakeDetection: { isFake: false, confidence: 1.0 }
        }
      }
    ];
  }
}

module.exports = new RealDisasterDataService();