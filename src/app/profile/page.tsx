'use client';

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
import { useProfile } from '@/hooks/use-profile';
import { ProfileChangeRequestModal } from '@/components/profile-change-request-modal';

export default function ProfilePage() {
  const { data: profile, isLoading, error, refetch } = useProfile();

  if (isLoading) {
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
              <p>{error.message || String(error)}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
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
            <p className="text-center">No profile data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', {
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
          <p className="mt-1">Manage your personal information</p>
        </div>
        <div className="flex gap-2">
          <ProfileChangeRequestModal profile={profile} />
        </div>
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
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-lg font-semibold text-white">
                  {profile.name || 'N/A'} {profile.surname || ''}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Email Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="text-white">{profile.email || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>
                <div className="mt-1">
                  <Badge
                    variant={getRoleBadgeVariant(
                      typeof profile.role === 'string'
                        ? profile.role
                        : profile.role?.role_name || '',
                    )}
                    className="flex items-center gap-1 w-fit"
                  >
                    <Shield className="h-3 w-3" />
                    {typeof profile.role === 'string'
                      ? profile.role
                      : profile.role?.role_name || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {profile.position && profile.position.position_name && (
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <p className="text-white">
                      {profile.position.position_name}
                    </p>
                  </div>
                </div>
              )}

              {profile.branch && profile.branch.branch_name && (
                <div>
                  <label className="text-sm font-medium">Branch</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-500" />
                    <p className="text-white">{profile.branch.branch_name}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Account Status</label>
                <div className="mt-1">
                  <Badge
                    variant={profile.is_active ? 'default' : 'secondary'}
                    className="text-black"
                  >
                    {profile.is_active ? 'Active' : 'Inactive'}
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
                <label className="text-sm font-medium">Member Since</label>
                <p className="text-white mt-1">
                  {formatDate(profile.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-white mt-1">
                  {formatDate(profile.updated_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p className="text-white mt-1">{profile.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <p className="text-white mt-1">{profile.address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Sex</label>
                <p className="text-white mt-1">{profile.sex || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Allowed Leave Days
                </label>
                <p className="text-white mt-1">
                  {profile.allowed_leavedays ?? 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <p className="text-white mt-1">
                  {formatDate(profile.start_date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Employee Type</label>
                <p className="text-white mt-1">
                  {profile.employee_type || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Level</label>
                <p className="text-white mt-1">{profile.level || 'N/A'}</p>
              </div>
              {profile.trainer && (
                <div>
                  <label className="text-sm font-medium">Trainer</label>
                  <p className="text-white mt-1">
                    {profile.trainer.name} {profile.trainer.surname}
                  </p>
                </div>
              )}
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
