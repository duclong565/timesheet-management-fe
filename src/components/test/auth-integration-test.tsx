'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Play, AlertTriangle } from 'lucide-react';
import authAPI from '@/lib/auth-api';
import {
  ApiTransformer,
  isApiError,
  isNetworkError,
} from '@/lib/api-transformer';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
  error?: unknown;
}

interface TestCase {
  name: string;
  description: string;
  test: () => Promise<void>;
}

export function AuthIntegrationTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const updateResult = (name: string, updates: Partial<TestResult>) => {
    setResults((prev) =>
      prev.map((result) =>
        result.name === name ? { ...result, ...updates } : result,
      ),
    );
  };

  const testCases: TestCase[] = [
    {
      name: 'Backend Connection',
      description: 'Test if backend server is reachable',
      test: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`,
        );
        if (!response.ok) {
          throw new Error(`Backend not reachable: ${response.status}`);
        }
        const data = await response.json();
        if (data.status !== 'ok') {
          throw new Error('Backend health check failed');
        }
      },
    },
    {
      name: 'Invalid Login',
      description: 'Test login with invalid credentials',
      test: async () => {
        try {
          await authAPI.login({
            username: 'invalid_user',
            password: 'invalid_password',
          });
          throw new Error('Login should have failed');
        } catch (error) {
          if (isApiError(error) && error.statusCode === 401) {
            // Expected error
            return;
          }
          throw error;
        }
      },
    },
    {
      name: 'Registration Validation',
      description: 'Test registration with invalid data',
      test: async () => {
        try {
          await authAPI.register({
            username: 'a', // Too short
            email: 'invalid-email',
            password: '123', // Too short
            name: '',
            surname: '',
          });
          throw new Error('Registration should have failed');
        } catch (error) {
          if (isApiError(error) && error.statusCode === 400) {
            // Expected validation error
            return;
          }
          throw error;
        }
      },
    },
    {
      name: 'Valid Registration',
      description: 'Test registration with valid data',
      test: async () => {
        const timestamp = Date.now();
        const testUser = {
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: 'SecurePassword123!',
          name: 'Test',
          surname: 'User',
        };

        try {
          const response = await authAPI.register(testUser);

          if (!response.user || !response.token) {
            throw new Error('Registration response missing user or token');
          }

          if (response.user.username !== testUser.username) {
            throw new Error('Username mismatch in response');
          }

          if (response.user.email !== testUser.email) {
            throw new Error('Email mismatch in response');
          }

          // Test the token is valid
          authAPI.setToken(response.token);
        } catch (error) {
          if (isApiError(error) && error.statusCode === 409) {
            // User already exists - this is acceptable for testing
            return;
          }
          throw error;
        }
      },
    },
    {
      name: 'Valid Login',
      description: 'Test login with valid credentials',
      test: async () => {
        // First create a user to login with
        const timestamp = Date.now();
        const testUser = {
          username: `logintest_${timestamp}`,
          email: `logintest_${timestamp}@example.com`,
          password: 'SecurePassword123!',
          name: 'Login',
          surname: 'Test',
        };

        try {
          // Register first
          await authAPI.register(testUser);

          // Then login
          const loginResponse = await authAPI.login({
            username: testUser.username,
            password: testUser.password,
          });

          if (!loginResponse.user || !loginResponse.token) {
            throw new Error('Login response missing user or token');
          }

          if (loginResponse.user.username !== testUser.username) {
            throw new Error('Username mismatch in login response');
          }

          authAPI.setToken(loginResponse.token);
        } catch (error) {
          if (isApiError(error) && error.statusCode === 409) {
            // User already exists, try login directly
            const loginResponse = await authAPI.login({
              username: testUser.username,
              password: testUser.password,
            });

            if (!loginResponse.user || !loginResponse.token) {
              throw new Error('Login response missing user or token');
            }
          } else {
            throw error;
          }
        }
      },
    },
    {
      name: 'Email Login',
      description: 'Test login with email instead of username',
      test: async () => {
        const timestamp = Date.now();
        const testUser = {
          username: `emailtest_${timestamp}`,
          email: `emailtest_${timestamp}@example.com`,
          password: 'SecurePassword123!',
          name: 'Email',
          surname: 'Test',
        };

        try {
          // Register first
          await authAPI.register(testUser);

          // Then login with email
          const loginResponse = await authAPI.login({
            username: testUser.email, // Using email as username
            password: testUser.password,
          });

          if (!loginResponse.user || !loginResponse.token) {
            throw new Error('Email login response missing user or token');
          }

          authAPI.setToken(loginResponse.token);
        } catch (error) {
          if (isApiError(error) && error.statusCode === 409) {
            // User already exists, try login directly
            const loginResponse = await authAPI.login({
              username: testUser.email,
              password: testUser.password,
            });

            if (!loginResponse.user || !loginResponse.token) {
              throw new Error('Email login response missing user or token');
            }
          } else {
            throw error;
          }
        }
      },
    },
    {
      name: 'Network Error Handling',
      description: 'Test network error handling',
      test: async () => {
        const originalBaseURL = (authAPI as { baseURL: string }).baseURL;

        try {
          // Temporarily set invalid URL
          (authAPI as { baseURL: string }).baseURL =
            'http://invalid-url-that-does-not-exist';

          await authAPI.login({
            username: 'test',
            password: 'test',
          });

          throw new Error('Should have thrown network error');
        } catch (error) {
          if (isNetworkError(error)) {
            // Expected network error
            return;
          }
          throw error;
        } finally {
          // Restore original URL
          (authAPI as { baseURL: string }).baseURL = originalBaseURL;
        }
      },
    },
    {
      name: 'Google OAuth URLs',
      description: 'Test Google OAuth redirect URLs',
      test: async () => {
        const googleAuthUrl = authAPI.getGoogleAuthUrl();

        if (!googleAuthUrl.includes('google')) {
          throw new Error('Google auth URL should contain "google"');
        }

        if (!googleAuthUrl.includes(process.env.NEXT_PUBLIC_API_URL!)) {
          throw new Error('Google auth URL should contain API URL');
        }
      },
    },
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const initialResults = testCases.map((test) => ({
      name: test.name,
      status: 'pending' as const,
      message: test.description,
    }));

    setResults(initialResults);

    for (const testCase of testCases) {
      setCurrentTest(testCase.name);
      updateResult(testCase.name, { status: 'running' });

      const startTime = Date.now();

      try {
        await testCase.test();
        const duration = Date.now() - startTime;

        updateResult(testCase.name, {
          status: 'success',
          message: `✅ ${testCase.description} - Passed`,
          duration,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = ApiTransformer.transformErrorForUser(error);

        updateResult(testCase.name, {
          status: 'error',
          message: `❌ ${errorMessage}`,
          duration,
          error,
        });
      }
    }

    setCurrentTest(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const totalCount = results.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Authentication Integration Tests
          </CardTitle>
          <CardDescription>
            Test the backend integration and authentication flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>

            {results.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline">
                  {successCount}/{totalCount} Passed
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive">{errorCount} Failed</Badge>
                )}
              </div>
            )}
          </div>

          {isRunning && currentTest && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Currently running: {currentTest}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-medium">{result.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.duration && (
                    <span className="text-xs text-muted-foreground">
                      {result.duration}ms
                    </span>
                  )}
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
