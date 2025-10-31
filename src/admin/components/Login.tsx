// ./components/Login.tsx
import React, { useState } from 'react';
import { theme, Reset, Box, H1, H2, Text, Button, Icon } from '@adminjs/design-system';
import { styled, ThemeProvider } from 'styled-components';

const LoginContainer = styled(Box)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color:rgba(255, 255, 255, 0.89);
  padding: 12px;
  position: relative;
  overflow: hidden;

  @media (min-width: 480px) {
    padding: 16px;
  }

  @media (min-width: 768px) {
    padding: 24px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: float 20s infinite linear;
  }

  @keyframes float {  
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(-30px, -30px) rotate(360deg); }
  }
`;

const LoginCard = styled(Box)`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;

  @media (min-width: 480px) {
    border-radius: 20px;
    min-height: 600px;
  }

  @media (min-width: 768px) {
    border-radius: 24px;
    min-height: 680px;
  }

  @media (min-width: 1024px) {
    flex-direction: row;
    min-height: 720px;
  }
`;

const BrandingSection = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(145deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%);
  color: white;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
  min-height: 300px;

  @media (min-width: 480px) {
    padding: 40px 28px;
    min-height: 400px;
  }

  @media (min-width: 768px) {
    padding: 50px 36px;
    min-height: 500px;
  }

  @media (min-width: 1024px) {
    width: 55%;
    align-items: flex-start;
    text-align: left;
    padding: 80px 60px;
    min-height: 720px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;

    @media (min-width: 768px) {
      width: 300px;
      height: 300px;
    }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;

    @media (min-width: 768px) {
      width: 200px;
      height: 200px;
    }
  }
`;

const FormSection = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  padding: 32px 20px;
  position: relative;

  @media (min-width: 480px) {
    padding: 40px 28px;
  }

  @media (min-width: 768px) {
    padding: 50px 36px;
  }

  @media (min-width: 1024px) {
    width: 45%;
    padding: 80px 60px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  border-radius: 12px;
  border: 2px solid #f1f5f9;
  padding: 16px 18px;
  font-size: 16px;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  -webkit-appearance: none;
  appearance: none;
  min-height: 48px;
  box-sizing: border-box;

  @media (min-width: 480px) {
    border-radius: 14px;
    padding: 17px 19px;
  }

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 18px 20px;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  &:hover {
    border-color: #e2e8f0;
    background-color: #f1f5f9;
  }

  @media (max-width: 479px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const StyledLabel = styled(Text)`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
`;

const InputWrapper = styled(Box)`
  position: relative;
  margin-bottom: 20px;

  @media (min-width: 480px) {
    margin-bottom: 24px;
  }
`;

const PasswordToggle = styled(Text)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 480px) {
    right: 16px;
    padding: 8px;
    min-width: auto;
    min-height: auto;
  }

  &:hover {
    color: #6366f1;
  }
`;

const CheckboxContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  margin: -4px;
  border-radius: 8px;
  transition: all 0.2s;

  @media (min-width: 480px) {
    gap: 12px;
  }

  &:active {
    transform: scale(0.98);
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border-radius: 6px;
    border: 2px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    @media (min-width: 480px) {
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
    }

    &:checked {
      background-color: #6366f1;
      border-color: #6366f1;
    }

    &:focus {
      outline: 2px solid rgba(99, 102, 241, 0.3);
      outline-offset: 2px;
    }
  }
`;

const FeatureItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  @media (min-width: 480px) {
    gap: 14px;
    padding: 14px 18px;
    margin-bottom: 16px;
    border-radius: 14px;
  }

  @media (min-width: 768px) {
    gap: 16px;
    padding: 16px 20px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  &:hover {
    transform: translateX(8px);
    background: rgba(255, 255, 255, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const LogoContainer = styled(Box)`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (min-width: 480px) {
    gap: 14px;
    padding: 14px 20px;
    margin-bottom: 32px;
    border-radius: 18px;
  }

  @media (min-width: 768px) {
    gap: 16px;
    padding: 16px 24px;
    margin-bottom: 40px;
    border-radius: 20px;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <Reset />
      <LoginContainer>
        <LoginCard>
          {/* Left Side - Branding */}
          <BrandingSection>
            {/* Header */}
            <Box width={1} display="flex" flexDirection="column" alignItems={{ _: 'center', lg: 'flex-start' }}>
              <LogoContainer>
                <Box
                  width="44px"
                  height="44px"
                  backgroundColor="white"
                  borderRadius="12px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 10px 25px -5px rgba(99, 102, 241, 0.4)"
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                  }}
                >
                  <Icon icon="Settings" color="#6366f1" size={24} />
                </Box>
                <Text 
                  fontSize="22px" 
                  fontWeight="bold" 
                  color="white" 
                  letterSpacing="-0.02em"
                  style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}
                >
                  AdminPro
                </Text>
              </LogoContainer>

              <Box mt="lg" textAlign={{ _: 'center', lg: 'left' }}>
                <H1 
                  color="white" 
                  mb="sm" 
                  fontSize={{ _: '28px', lg: '52px' }}
                  lineHeight="1.1"
                  fontWeight="bold"
                  letterSpacing="-0.02em"
                  style={{ fontSize: 'clamp(28px, 6vw, 52px)' }}
                >
                  Enterprise
                  <Box display="block" color="white" mt="6px">
                    Admin Suite
                  </Box>
                </H1>
                <Text 
                  fontSize="16px" 
                  color="white" 
                  mb="lg" 
                  lineHeight="1.6"
                  opacity="0.9"
                  maxWidth="400px"
                  style={{ fontSize: 'clamp(14px, 3vw, 18px)' }}
                >
                  Streamline your business operations with our powerful admin dashboard. 
                  Manage users, analytics, and workflows in one secure platform.
                </Text>
              </Box>

              {/* Features List */}
              <Box width={1} maxWidth="400px">
                <FeatureItem>
                  <Box
                    width="32px"
                    height="32px"
                    backgroundColor="success40"
                    borderRadius="10px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                  >
                    <Icon icon="PlusCircle" color="white" size={18} />
                  </Box>
                  <Text color="white" fontSize="16px" fontWeight="500">
                    Real-time analytics dashboard
                  </Text>
                </FeatureItem>
                <FeatureItem>
                  <Box
                    width="32px"
                    height="32px"
                    backgroundColor="success40"
                    borderRadius="10px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                  >
                    <Icon icon="PlusCircle" color="white" size={18} />
                  </Box>
                  <Text color="white" fontSize="16px" fontWeight="500">
                    Advanced security protocols
                  </Text>
                </FeatureItem>
                <FeatureItem>
                  <Box
                    width="32px"
                    height="32px"
                    backgroundColor="success40"
                    borderRadius="10px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                  >
                    <Icon icon="Users" color="white" size={18} />
                  </Box>
                  <Text color="white" fontSize="16px" fontWeight="500">
                    Multi-team collaboration
                  </Text>
                </FeatureItem>
              </Box>
            </Box>

            {/* Footer Text */}
            <Box width={1} textAlign={{ _: 'center', lg: 'left' }}>
              <Text color="white" fontSize="14px" opacity="0.7">
                Trusted by 10,000+ companies worldwide
              </Text>
            </Box>
          </BrandingSection>

          {/* Right Side - Login Form */}
          <FormSection>
            <Box width={1} maxWidth="400px" mx="auto">
              {/* Form Header */}
              <Box textAlign="center" mb="lg">
                <Box
                  width="64px"
                  height="64px"
                  backgroundColor="#f1f5f9"
                  borderRadius="16px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb="20px"
                  boxShadow="0 4px 12px rgba(99, 102, 241, 0.1)"
                  style={{
                    minWidth: '64px',
                    minHeight: '64px',
                  }}
                >
                  <Icon icon="Lock" color="#6366f1" size={28} />
                </Box>
                <H2 
                  color="#1e293b" 
                  mb="10px" 
                  fontSize="26px" 
                  fontWeight="700" 
                  letterSpacing="-0.02em"
                  style={{ fontSize: 'clamp(24px, 5vw, 32px)' }}
                >
                  Welcome Back
                </H2>
                <Text variant="md" color="#64748b" lineHeight="1.5" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                  Sign in to your AdminPro account
                </Text>
              </Box>

              {/* Login Form */}
              <Box as="form" action="login" method="POST">
                <InputWrapper>
                  <StyledLabel>
                    <Box display="flex" alignItems="center" gap="12px">
                      <Icon icon="Mail" color="#6366f1" size={18}  style={{ marginRight: '8px' }}/>
                        Email Address
                    </Box>
                  </StyledLabel>
                  <StyledInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputWrapper>

                <InputWrapper>
                  <StyledLabel>
                    <Box display="flex" alignItems="center" gap="12px">
                      <Icon icon="Lock" color="#6366f1" size={18} style={{ marginRight: '8px' }}/>
                      Password
                    </Box>
                  </StyledLabel>
                  <InputWrapper style={{ marginBottom: '8px' }}>
                    <StyledInput
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '56px' }}
                      required
                    />
                    <PasswordToggle
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ cursor: 'pointer' }}
                    >
                      <Icon
                        icon={showPassword ? 'EyeOff' : 'Eye'}
                        size={20}
                      />
                    </PasswordToggle>
                  </InputWrapper>
                </InputWrapper>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  size="lg"
                  width={1}
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s ease',
                    minHeight: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 25px rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Icon icon="Lock" mr="10px" style={{ flexShrink: 0, color: 'white' }} />
                  <span style={{ fontSize: 'clamp(15px, 3vw, 16px)', color: 'white' }}>Sign in to Dashboard</span>
                </Button>
              </Box>

              {/* Footer */}
              <Box mt="xl" pt="24px" borderTop="1px solid #f1f5f9">
                <Text textAlign="center" variant="sm" color="#94a3b8">
                  © {new Date().getFullYear()} AdminPro Suite. All rights reserved.
                  <Box display="block" mt="4px" fontSize="12px">
                    v2.4.1 • Enterprise Edition
                  </Box>
                </Text>
              </Box>
            </Box>
          </FormSection>
        </LoginCard>
      </LoginContainer>
    </ThemeProvider>
  );
};

export default Login;