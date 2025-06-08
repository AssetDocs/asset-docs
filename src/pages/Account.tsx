import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Camera, FileText, Shield, Settings, Plus, Eye, Video, FileImage, BarChart3 } from 'lucide-react';

const Account: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Account Dashboard</h1>
            <p className="text-gray-600">Manage your properties and asset documentation</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="asset-values">Asset Values</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Home className="h-8 w-8 text-brand-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Properties</p>
                        <p className="text-2xl font-bold">2</p>
                        <p className="text-xs text-gray-500">$810K total value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Camera className="h-8 w-8 text-brand-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Photos</p>
                        <p className="text-2xl font-bold">147</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Video className="h-8 w-8 text-brand-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Videos</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-brand-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Documents</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-brand-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold">$858.2K</p>
                        <p className="text-xs text-gray-500">Including real estate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Home className="h-6 w-6 mr-2 text-brand-blue" />
                      Property Profiles
                    </CardTitle>
                    <CardDescription>
                      Create and manage property information, square footage, and details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                        <Link to="/account/properties/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Property
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/account/properties">
                          <Eye className="h-4 w-4 mr-2" />
                          View All Properties
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="h-6 w-6 mr-2 text-brand-blue" />
                      Photo Management
                    </CardTitle>
                    <CardDescription>
                      Upload photos and get AI-powered value estimates for your items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90">
                        <Link to="/account/photos/upload">
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Photos
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/account/photos">
                          <Eye className="h-4 w-4 mr-2" />
                          View Photo Gallery
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="h-6 w-6 mr-2 text-brand-blue" />
                      Video Documentation
                    </CardTitle>
                    <CardDescription>
                      Upload and manage video recordings of your property and belongings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90">
                        <Link to="/account/videos/upload">
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Videos
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/account/videos">
                          <Eye className="h-4 w-4 mr-2" />
                          View Videos
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileImage className="h-6 w-6 mr-2 text-brand-blue" />
                      Floor Plans
                    </CardTitle>
                    <CardDescription>
                      Upload and manage architectural drawings and floor plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                        <Link to="/account/floorplans/upload">
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Floor Plans
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/account/floorplans">
                          <Eye className="h-4 w-4 mr-2" />
                          View Floor Plans
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-6 w-6 mr-2 text-brand-blue" />
                      Document Storage
                    </CardTitle>
                    <CardDescription>
                      Store PDFs, receipts, warranties, and other important documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                        <Link to="/account/documents/upload">
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/account/documents">
                          <Eye className="h-4 w-4 mr-2" />
                          View Documents
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-6 w-6 mr-2 text-brand-blue" />
                      Insurance Information
                    </CardTitle>
                    <CardDescription>
                      Manage insurance policies, claims, and related documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90">
                        <Link to="/account/insurance/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Insurance Policy
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/account/insurance">
                          <Eye className="h-4 w-4 mr-2" />
                          View Insurance
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-6 w-6 mr-2 text-brand-blue" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>
                      Update your profile, security settings, and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/account/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Settings
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="asset-values">
              <AssetValuesSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Account;
