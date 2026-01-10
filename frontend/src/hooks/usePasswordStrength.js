import { useMemo } from 'react';

export const usePasswordStrength = (password) => {
  return useMemo(() => {
    if (!password) {
      return { score: 0, strength: 'none', feedback: [] };
    }
    
    let score = 0;
    const feedback = [];
    
    // Length (0-40 points)
    if (password.length >= 12) {
      score += 20;
      if (password.length >= 16) {
        score += 20;
      } else if (password.length >= 14) {
        score += 10;
      }
    } else if (password.length >= 8) {
      score += 10;
    }
    
    // Variety (0-30 points)
    let varietyScore = 0;
    if (/[a-z]/.test(password)) varietyScore += 7.5;
    if (/[A-Z]/.test(password)) varietyScore += 7.5;
    if (/[0-9]/.test(password)) varietyScore += 7.5;
    if (/[^a-zA-Z0-9]/.test(password)) varietyScore += 7.5;
    score += varietyScore;
    
    // Complexity (0-30 points)
    let complexityScore = 0;
    
    // Check for common patterns (penalize)
    const commonPatterns = [
      /12345/,
      /abcde/,
      /password/i,
      /qwerty/i,
      /admin/i,
    ];
    
    let hasCommonPattern = false;
    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        hasCommonPattern = true;
        break;
      }
    }
    
    if (!hasCommonPattern) {
      complexityScore += 15;
    }
    
    // Check for sequences
    let hasSequence = false;
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      if (Math.abs(char2 - char1) === 1 && Math.abs(char3 - char2) === 1) {
        hasSequence = true;
        break;
      }
    }
    
    if (!hasSequence) {
      complexityScore += 15;
    }
    
    score += complexityScore;
    
    // Determine strength
    let strength = 'weak';
    if (score >= 80) strength = 'strong';
    else if (score >= 60) strength = 'medium';
    else if (score >= 40) strength = 'fair';
    
    // Generate feedback
    if (password.length < 12) {
      feedback.push({ text: 'At least 12 characters', met: false });
    } else {
      feedback.push({ text: 'At least 12 characters', met: true });
    }
    
    if (!/[a-z]/.test(password)) {
      feedback.push({ text: 'One lowercase letter', met: false });
    } else {
      feedback.push({ text: 'One lowercase letter', met: true });
    }
    
    if (!/[A-Z]/.test(password)) {
      feedback.push({ text: 'One uppercase letter', met: false });
    } else {
      feedback.push({ text: 'One uppercase letter', met: true });
    }
    
    if (!/[0-9]/.test(password)) {
      feedback.push({ text: 'One number', met: false });
    } else {
      feedback.push({ text: 'One number', met: true });
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push({ text: 'One special character', met: false });
    } else {
      feedback.push({ text: 'One special character', met: true });
    }
    
    return { score, strength, feedback };
  }, [password]);
};










