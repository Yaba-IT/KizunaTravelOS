/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/utils/securityMonitor.js - Security monitoring utility
* Detects threats and logs security events
*
* coded by farid212@Yaba-IT!
*/

const crypto = require('crypto');

/**
 * Security Monitoring Utility
 * Detects threats and logs security events
 */
class SecurityMonitor {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.threatPatterns = {
      xss: /<script|javascript:|vbscript:|onload=|onerror=/i,
      sqlInjection: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      pathTraversal: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i,
      commandInjection: /(\b(cmd|powershell|bash|sh|exec|system|eval|Function)\b)/i,
      lfi: /(\b(include|require|include_once|require_once)\b)/i,
      rfi: /(https?|ftp|file|data|php|asp|jsp):/i
    };
    
    this.suspiciousIPs = new Map();
    this.failedAuths = new Map();
    this.rateLimitViolations = new Map();
  }

  /**
   * Analyze request for security threats
   */
  analyzeRequest(req) {
    const threats = [];
    const ip = req.ip || req.connection.remoteAddress;
    
    // Check URL for threats
    if (req.url) {
      threats.push(...this.checkPatterns(req.url, 'URL'));
    }
    
    // Check body for threats
    if (req.body && typeof req.body === 'object') {
      threats.push(...this.checkPatterns(JSON.stringify(req.body), 'Body'));
    }
    
    // Check headers for threats
    if (req.headers) {
      threats.push(...this.checkPatterns(JSON.stringify(req.headers), 'Headers'));
    }
    
    // Check query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      threats.push(...this.checkPatterns(JSON.stringify(req.query), 'Query'));
    }
    
    // Log threats if found
    if (threats.length > 0) {
      this.logSecurityEvent('THREAT_DETECTED', {
        ip,
        url: req.url,
        method: req.method,
        threats,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });
    }
    
    return threats;
  }

  /**
   * Check patterns against content
   */
  checkPatterns(content, source) {
    const threats = [];
    
    Object.entries(this.threatPatterns).forEach(([type, pattern]) => {
      if (pattern.test(content)) {
        threats.push({
          type,
          source,
          pattern: pattern.toString(),
          severity: this.getThreatSeverity(type)
        });
      }
    });
    
    return threats;
  }

  /**
   * Get threat severity level
   */
  getThreatSeverity(type) {
    const severityMap = {
      xss: 'HIGH',
      sqlInjection: 'CRITICAL',
      pathTraversal: 'HIGH',
      commandInjection: 'CRITICAL',
      lfi: 'MEDIUM',
      rfi: 'HIGH'
    };
    
    return severityMap[type] || 'MEDIUM';
  }

  /**
   * Track failed authentication attempts
   */
  trackFailedAuth(ip, userId = null) {
    const key = userId || ip;
    const current = this.failedAuths.get(key) || 0;
    this.failedAuths.set(key, current + 1);
    
    if (current + 1 >= this.config.monitoring.security.failedAuthThreshold) {
      this.logSecurityEvent('AUTH_THRESHOLD_EXCEEDED', {
        ip,
        userId,
        failedAttempts: current + 1,
        threshold: this.config.monitoring.security.failedAuthThreshold,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Track suspicious IP activity
   */
  trackSuspiciousIP(ip, reason) {
    const current = this.suspiciousIPs.get(ip) || { count: 0, reasons: [] };
    current.count++;
    current.reasons.push(reason);
    current.lastSeen = new Date().toISOString();
    
    this.suspiciousIPs.set(ip, current);
    
    if (current.count >= this.config.monitoring.security.suspiciousIPThreshold) {
      this.logSecurityEvent('SUSPICIOUS_IP_THRESHOLD_EXCEEDED', {
        ip,
        count: current.count,
        reasons: current.reasons,
        threshold: this.config.monitoring.security.suspiciousIPThreshold,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log security event
   */
  logSecurityEvent(eventType, data) {
    const securityEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      severity: this.getEventSeverity(eventType),
      data,
      metadata: {
        source: 'SecurityMonitor',
        version: '1.0.0'
      }
    };
    
    this.logger.warn('Security Event Detected', securityEvent);
    
    // Store in security log file
    if (this.config.logging.enableFileLogging) {
      // This would write to a dedicated security log
      console.warn('SECURITY EVENT:', JSON.stringify(securityEvent, null, 2));
    }
  }

  /**
   * Get event severity
   */
  getEventSeverity(eventType) {
    const severityMap = {
      THREAT_DETECTED: 'HIGH',
      AUTH_THRESHOLD_EXCEEDED: 'MEDIUM',
      SUSPICIOUS_IP_THRESHOLD_EXCEEDED: 'MEDIUM',
      RATE_LIMIT_VIOLATION: 'LOW'
    };
    
    return severityMap[eventType] || 'MEDIUM';
  }

  /**
   * Generate security report
   */
  generateSecurityReport() {
    return {
      generatedAt: new Date().toISOString(),
      suspiciousIPs: Array.from(this.suspiciousIPs.entries()).map(([ip, data]) => ({
        ip,
        count: data.count,
        reasons: data.reasons,
        lastSeen: data.lastSeen
      })),
      failedAuths: Array.from(this.failedAuths.entries()).map(([key, count]) => ({
        identifier: key,
        count
      })),
      rateLimitViolations: Array.from(this.rateLimitViolations.entries()).map(([key, data]) => ({
        identifier: key,
        violations: data.violations,
        lastViolation: data.lastViolation
      })),
      recommendations: this.generateSecurityRecommendations()
    };
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations() {
    const recommendations = [];
    
    if (this.suspiciousIPs.size > 0) {
      recommendations.push('Review suspicious IP addresses and consider blocking');
    }
    
    if (this.failedAuths.size > 0) {
      recommendations.push('Implement account lockout policies for failed authentication');
    }
    
    if (this.rateLimitViolations.size > 0) {
      recommendations.push('Review and adjust rate limiting policies');
    }
    
    return recommendations;
  }
}

module.exports = SecurityMonitor;
