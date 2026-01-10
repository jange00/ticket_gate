/**
 * Common passwords list (top 100 most common)
 */
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', '12345678', '12345', '1234567', '1234567890',
  'qwerty', 'abc123', 'monkey', '123456789', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael', 'football',
  'welcome', 'jesus', 'ninja', 'mustang', 'password1', 'admin', '1234',
  'qwertyuiop', '123321', 'princess', 'login', 'welcome', 'solo', 'starwars',
  'donald', 'dragon', 'passw0rd', 'master', 'hello', 'freedom', 'whatever',
  'qazwsx', 'trustno1', 'jordan23', 'harley', 'robert', 'matthew', 'jordan',
  'michelle', 'charlie', 'andrew', 'michelle', 'love', 'jennifer', 'joshua',
  'hunter', 'daniel', 'thomas', 'matthew', 'anthony', 'christopher', 'mark',
  'donald', 'paul', 'steven', 'andrew', 'kenneth', 'joshua', 'kevin', 'brian'
];

/**
 * Check if password is in common passwords list
 */
const isCommonPassword = (password) => {
  const lowerPassword = password.toLowerCase();
  return COMMON_PASSWORDS.includes(lowerPassword) || 
         COMMON_PASSWORDS.some(common => lowerPassword.includes(common));
};

/**
 * Calculate password strength score (0-100)
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  // Length (max 40 points)
  if (password.length >= 12) {
    score += 20;
    if (password.length >= 16) {
      score += 10;
      if (password.length >= 20) {
        score += 10;
      }
    }
  } else if (password.length >= 8) {
    score += 10;
  } else {
    feedback.push('Password should be at least 12 characters long');
  }

  // Character variety (max 30 points)
  let varietyScore = 0;
  if (/[a-z]/.test(password)) varietyScore += 5;
  if (/[A-Z]/.test(password)) varietyScore += 5;
  if (/[0-9]/.test(password)) varietyScore += 5;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) varietyScore += 5;
  if (/[^a-zA-Z0-9!@#$%^&*(),.?":{}|<>]/.test(password)) varietyScore += 10; // Extended chars
  score += varietyScore;

  if (varietyScore < 20) {
    feedback.push('Use a mix of uppercase, lowercase, numbers, and special characters');
  }

  // Complexity patterns (max 30 points)
  let complexityScore = 0;
  
  // Check for sequences (penalty)
  const sequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
  const hasSequence = sequences.some(seq => password.toLowerCase().includes(seq));
  if (hasSequence) {
    complexityScore -= 5;
    feedback.push('Avoid common sequences like "123" or "abc"');
  }

  // Check for repeated characters
  const hasRepeats = /(.)\1{2,}/.test(password);
  if (hasRepeats) {
    complexityScore -= 5;
    feedback.push('Avoid repeating the same character multiple times');
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdf', 'zxcv'];
  const hasKeyboardPattern = keyboardPatterns.some(pattern => 
    password.toLowerCase().includes(pattern)
  );
  if (hasKeyboardPattern) {
    complexityScore -= 5;
    feedback.push('Avoid keyboard patterns like "qwerty"');
  }

  // Bonus for mixed case and numbers
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) complexityScore += 5;
  if (/[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) complexityScore += 5;
  if (password.length >= 16) complexityScore += 5;
  if (password.length >= 20) complexityScore += 5;

  score += Math.max(0, complexityScore);

  // Determine strength level
  let strength = 'weak';
  if (score >= 70) strength = 'strong';
  else if (score >= 40) strength = 'medium';

  // Check against common passwords
  if (isCommonPassword(password)) {
    score = Math.max(0, score - 20);
    feedback.push('This password is too common. Choose something more unique');
  }

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ['Password strength is good']
  };
};

/**
 * Validate password strength
 */
const isValidPassword = (password, minLength = 12) => {
  if (!password || password.length < minLength) {
    return { 
      valid: false, 
      message: `Password must be at least ${minLength} characters long`,
      strength: calculatePasswordStrength(password)
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase letter',
      strength: calculatePasswordStrength(password)
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one lowercase letter',
      strength: calculatePasswordStrength(password)
    };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one number',
      strength: calculatePasswordStrength(password)
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one special character',
      strength: calculatePasswordStrength(password)
    };
  }

  // Check against common passwords
  if (isCommonPassword(password)) {
    return { 
      valid: false, 
      message: 'This password is too common. Please choose a more unique password',
      strength: calculatePasswordStrength(password)
    };
  }
  
  const strength = calculatePasswordStrength(password);
  return { 
    valid: true, 
    message: 'Password is valid',
    strength
  };
};

module.exports = {
  isValidPassword,
  calculatePasswordStrength,
  isCommonPassword
};













