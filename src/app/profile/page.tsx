'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Calendar,
  Edit,
  Shield,
  Building,
  Briefcase,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    branch_name: string;
  };
  position?: {
    id: string;
    position_name: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Simulate API call for now - replace with actual API call
        // const response = await fetch('/api/auth/profile');
        // const data = await response.json();

        // Mock data for demonstration
        const mockProfile: UserProfile = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@company.com',
          name: 'John',
          surname: 'Doe',
          role: 'USER',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          branch: {
            id: 'branch-1',
            branch_name: 'Main Office',
          },
          position: {
            id: 'pos-1',
            position_name: 'Software Developer',
          },
        };

        setProfile(mockProfile);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              No profile data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'HR':
        return 'default';
      case 'PM':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <p className="text-lg font-semibold">
                  {profile.name} {profile.surname}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email Address
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-800">{profile.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Role
                </label>
                <div className="mt-1">
                  <Badge
                    variant={getRoleBadgeVariant(profile.role)}
                    className="flex items-center gap-1 w-fit"
                  >
                    <Shield className="h-3 w-3" />
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {profile.position && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Position
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-800">
                      {profile.position.position_name}
                    </p>
                  </div>
                </div>
              )}

              {profile.branch && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Branch
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-800">
                      {profile.branch.branch_name}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Account Status
                </label>
                <div className="mt-1">
                  <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Member Since
                </label>
                <p className="text-gray-800 mt-1">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <p className="text-gray-800 mt-1">
                  {formatDate(profile.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start"
            >
              <Shield className="h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start"
            >
              <Calendar className="h-4 w-4" />
              View Timesheet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
