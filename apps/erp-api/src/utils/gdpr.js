/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/utils/gdpr.js - GDPR compliance utility module
* Handles data anonymization, retention policies, and consent management
*
* coded by farid212@Yaba-IT!
*/

const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');

/**
 * GDPR Compliance Utility Module
 * Handles data anonymization, retention policies, and consent management
 */
class GDPRCompliance {
  constructor(config) {
    this.config = config;
    this.retentionPolicies = {
      userData: config.gdpr.userDataRetentionDays * 24 * 60 * 60 * 1000, // Convert to milliseconds
      logData: config.gdpr.logDataRetentionDays * 24 * 60 * 60 * 1000,
      sessionData: config.gdpr.sessionDataRetentionDays * 24 * 60 * 60 * 1000
    };
  }

  /**
   * Anonymize IP address for GDPR compliance
   * @param {string} ip - IP address to anonymize
   * @returns {string} - Anonymized IP address
   */
  anonymizeIP(ip) {
    if (!this.config.logging.anonymizeIPs || !ip) {
      return ip;
    }

    try {
      // For IPv4: Keep first 3 octets, anonymize last
      if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
      }
      
      // For IPv6: Keep first 4 segments, anonymize rest
      if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 4) {
          return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
        }
      }

      return ip;
    } catch {
      return '0.0.0.0';
    }
  }

  /**
   * Anonymize email address for GDPR compliance
   * @param {string} email - Email address to anonymize
   * @returns {string} - Anonymized email address
   */
  anonymizeEmail(email) {
    if (!email || !this.config.logging.anonymizeLogs) {
      return email;
    }

    try {
      const [localPart, domain] = email.split('@');
      if (localPart && domain) {
        const anonymizedLocal = localPart.length > 2 
          ? `${localPart[0]}***${localPart[localPart.length - 1]}`
          : '***';
        return `${anonymizedLocal}@${domain}`;
      }
      return email;
    } catch {
      return '***@***';
    }
  }

  /**
   * Anonymize user data for GDPR compliance
   * @param {Object} userData - User data object
   * @returns {Object} - Anonymized user data
   */
  anonymizeUserData(userData) {
    if (!userData || !this.config.logging.anonymizeLogs) {
      return userData;
    }

    const anonymized = { ...userData };
    
    // Anonymize sensitive fields
    if (anonymized.email) {
      anonymized.email = this.anonymizeEmail(anonymized.email);
    }
    
    if (anonymized.phone) {
      anonymized.phone = anonymized.phone.replace(/\d(?=\d{4})/g, '*');
    }
    
    if (anonymized.firstName) {
      anonymized.firstName = anonymized.firstName[0] + '*'.repeat(anonymized.firstName.length - 1);
    }
    
    if (anonymized.lastName) {
      anonymized.lastName = anonymized.lastName[0] + '*'.repeat(anonymized.lastName.length - 1);
    }
    
    if (anonymized.address) {
      anonymized.address = {
        ...anonymized.address,
        street: '***',
        postalCode: '***'
      };
    }

    return anonymized;
  }

  /**
   * Check if data should be retained based on GDPR policies
   * @param {Date} creationDate - Data creation date
   * @param {string} dataType - Type of data (userData, logData, sessionData)
   * @returns {boolean} - Whether data should be retained
   */
  shouldRetainData(creationDate, dataType) {
    if (!creationDate || !this.retentionPolicies[dataType]) {
      return true;
    }

    const now = new Date();
    const age = now.getTime() - creationDate.getTime();
    const maxAge = this.retentionPolicies[dataType];

    return age < maxAge;
  }

  /**
   * Get data retention information
   * @param {Date} creationDate - Data creation date
   * @param {string} dataType - Type of data
   * @returns {Object} - Retention information
   */
  getRetentionInfo(creationDate, dataType) {
    if (!creationDate || !this.retentionPolicies[dataType]) {
      return { shouldRetain: true, daysUntilExpiry: null };
    }

    const now = new Date();
    const age = now.getTime() - creationDate.getTime();
    const maxAge = this.retentionPolicies[dataType];
    const daysUntilExpiry = Math.ceil((maxAge - age) / (24 * 60 * 60 * 1000));

    return {
      shouldRetain: age < maxAge,
      daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
      willExpireAt: new Date(creationDate.getTime() + maxAge)
    };
  }

  /**
   * Generate GDPR-compliant data export
   * @param {Object} userData - User data to export
   * @returns {Object} - Formatted export data
   */
  generateDataExport(userData) {
    if (!this.config.gdpr.allowDataExport) {
      throw new Error('Data export not enabled');
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      dataSubject: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      dataCategories: {
        personalInformation: {
          profile: userData.profile || {},
          preferences: userData.preferences || {}
        },
        activityData: {
          loginHistory: userData.loginHistory || [],
          actions: userData.actions || []
        },
        technicalData: {
          deviceInfo: userData.deviceInfo || {},
          ipAddresses: userData.ipAddresses || []
        }
      },
      metadata: {
        format: 'JSON',
        version: '1.0',
        generatedBy: 'ERP-API GDPR Module'
      }
    };

    return exportData;
  }

  /**
   * Anonymize data for deletion (GDPR right to be forgotten)
   * @param {Object} userData - User data to anonymize
   * @returns {Object} - Anonymized data
   */
  anonymizeForDeletion(userData) {
    if (!this.config.gdpr.anonymizeDeletedData) {
      return null; // Return null to indicate complete deletion
    }

    const anonymized = {
      id: userData.id,
      deletedAt: new Date().toISOString(),
      deletionReason: 'GDPR Right to be Forgotten',
      anonymizedData: {
        email: `deleted_${crypto.randomBytes(8).toString('hex')}@deleted.com`,
        firstName: 'Deleted',
        lastName: 'User',
        phone: '0000000000',
        address: {
          street: 'Deleted',
          city: 'Deleted',
          state: 'Deleted',
          country: 'Deleted',
          postalCode: '00000'
        }
      }
    };

    return anonymized;
  }

  /**
   * Validate GDPR consent
   * @param {Object} consentData - Consent information
   * @returns {Object} - Validation result
   */
  validateConsent(consentData) {
    if (!this.config.gdpr.requireExplicitConsent) {
      return { valid: true, message: 'Explicit consent not required' };
    }

    const requiredConsents = [
      'dataProcessing',
      'marketing',
      'analytics',
      'thirdPartySharing'
    ];

    const missingConsents = requiredConsents.filter(
      consent => !consentData[consent] || !consentData[consent].granted
    );

    if (missingConsents.length > 0) {
      return {
        valid: false,
        message: `Missing required consents: ${missingConsents.join(', ')}`,
        missingConsents
      };
    }

    // Check if consent is still valid (not expired)
    const now = new Date();
    const expiredConsents = requiredConsents.filter(consent => {
      const consentInfo = consentData[consent];
      return consentInfo.expiresAt && new Date(consentInfo.expiresAt) < now;
    });

    if (expiredConsents.length > 0) {
      return {
        valid: false,
        message: `Expired consents: ${expiredConsents.join(', ')}`,
        expiredConsents
      };
    }

    return { valid: true, message: 'All consents are valid' };
  }

  /**
   * Track consent changes for GDPR compliance
   * @param {string} userId - User ID
   * @param {Object} oldConsent - Previous consent state
   * @param {Object} newConsent - New consent state
   * @returns {Object} - Consent change record
   */
  trackConsentChange(userId, oldConsent, newConsent) {
    if (!this.config.gdpr.trackConsentChanges) {
      return null;
    }

    const changes = [];
    const allConsentTypes = [...new Set([...Object.keys(oldConsent), ...Object.keys(newConsent)])];

    allConsentTypes.forEach(consentType => {
      const oldValue = oldConsent[consentType]?.granted || false;
      const newValue = newConsent[consentType]?.granted || false;

      if (oldValue !== newValue) {
        changes.push({
          consentType,
          oldValue,
          newValue,
          changedAt: new Date().toISOString(),
          reason: newConsent[consentType]?.reason || 'User preference change'
        });
      }
    });

    if (changes.length === 0) {
      return null;
    }

    return {
      userId,
      timestamp: new Date().toISOString(),
      changes,
      metadata: {
        ipAddress: 'tracked-separately',
        userAgent: 'tracked-separately',
        sessionId: 'tracked-separately'
      }
    };
  }

  /**
   * Clean up expired data based on GDPR retention policies
   * @param {string} dataType - Type of data to clean
   * @returns {Promise<Object>} - Cleanup results
   */
  async cleanupExpiredData(dataType) {
    const results = {
      dataType,
      timestamp: new Date().toISOString(),
      processed: 0,
      deleted: 0,
      anonymized: 0,
      errors: 0
    };

    try {
      // This would integrate with your actual data storage
      // For now, we'll return a template structure
      results.processed = 0;
      results.deleted = 0;
      results.anonymized = 0;
      results.errors = 0;

      return results;
    } catch (error) {
      results.errors = 1;
      throw error;
    }
  }

  /**
   * Generate GDPR compliance report
   * @returns {Object} - Compliance report
   */
  generateComplianceReport() {
    return {
      generatedAt: new Date().toISOString(),
      gdprEnabled: this.config.gdpr.enabled,
      dataRetentionPolicies: {
        userData: `${this.config.gdpr.userDataRetentionDays} days`,
        logData: `${this.config.gdpr.logDataRetentionDays} days`,
        sessionData: `${this.config.gdpr.sessionDataRetentionDays} days`
      },
      features: {
        dataExport: this.config.gdpr.allowDataExport,
        dataDeletion: this.config.gdpr.allowDataDeletion,
        dataAnonymization: this.config.gdpr.anonymizeDeletedData,
        explicitConsent: this.config.gdpr.requireExplicitConsent,
        consentTracking: this.config.gdpr.trackConsentChanges,
        dataMinimization: this.config.gdpr.logMinimalData,
        dataEncryption: this.config.gdpr.encryptSensitiveData
      },
      logging: {
        anonymizeIPs: this.config.logging.anonymizeIPs,
        anonymizeLogs: this.config.logging.anonymizeLogs,
        logUserActions: this.config.logging.logUserActions,
        logDataAccess: this.config.logging.logDataAccess
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate GDPR compliance recommendations
   * @returns {Array} - List of recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.config.gdpr.encryptSensitiveData) {
      recommendations.push('Enable encryption for sensitive data storage');
    }

    if (!this.config.logging.anonymizeIPs) {
      recommendations.push('Enable IP address anonymization in logs');
    }

    if (!this.config.gdpr.requireExplicitConsent) {
      recommendations.push('Implement explicit consent requirements');
    }

    if (!this.config.gdpr.trackConsentChanges) {
      recommendations.push('Enable consent change tracking');
    }

    return recommendations;
  }
}

module.exports = GDPRCompliance;
