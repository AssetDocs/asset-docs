
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Scan, AlertCircle } from 'lucide-react';

interface ScannedFloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  floorPlanUrl?: string;
  dimensions: {
    width: number;
    height: number;
    area: number;
  };
  rooms: Array<{
    name: string;
    area: number;
  }>;
  scanDate: Date;
}

const FloorPlanScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPlans, setScannedPlans] = useState<ScannedFloorPlan[]>([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('floorplan_api_key') || '');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        processFloorPlanScan(imageData);
      }
    }
  };

  const processFloorPlanScan = async (imageData: string) => {
    setIsScanning(true);
    
    try {
      // Mock implementation - in production, this would call MagicPlan or CubiCasa API
      await simulateFloorPlanProcessing(imageData);
    } catch (error) {
      console.error('Floor plan processing failed:', error);
    }
    
    setIsScanning(false);
  };

  const simulateFloorPlanProcessing = async (imageData: string): Promise<void> => {
    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPlan: ScannedFloorPlan = {
      id: Date.now().toString(),
      name: `Floor Plan ${scannedPlans.length + 1}`,
      imageUrl: imageData,
      floorPlanUrl: '/placeholder-floorplan.svg',
      dimensions: {
        width: Math.floor(Math.random() * 20) + 30,
        height: Math.floor(Math.random() * 15) + 25,
        area: Math.floor(Math.random() * 500) + 1000
      },
      rooms: [
        { name: 'Living Room', area: Math.floor(Math.random() * 100) + 200 },
        { name: 'Kitchen', area: Math.floor(Math.random() * 50) + 100 },
        { name: 'Bedroom 1', area: Math.floor(Math.random() * 80) + 120 },
        { name: 'Bedroom 2', area: Math.floor(Math.random() * 60) + 100 },
        { name: 'Bathroom', area: Math.floor(Math.random() * 30) + 40 }
      ],
      scanDate: new Date()
    };
    
    setScannedPlans(prev => [...prev, mockPlan]);
  };

  const handleApiKeyUpdate = () => {
    localStorage.setItem('floorplan_api_key', apiKey);
    console.log('Floor plan API key updated');
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Enter your floor plan scanning service API key (MagicPlan, CubiCasa, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key for floor plan service"
              className="flex-1"
            />
            <Button onClick={handleApiKeyUpdate}>
              Save Key
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            This key will be stored locally. For production apps, use Supabase secrets.
          </p>
        </CardContent>
      </Card>

      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-6 w-6 mr-2 text-brand-blue" />
            Live Floor Plan Scanner
          </CardTitle>
          <CardDescription>
            Use your device camera to scan rooms and generate floor plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-gray-200 rounded border object-cover"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="hidden"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={startCamera} variant="outline" className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
            <Button 
              onClick={capturePhoto} 
              disabled={isScanning}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
            >
              <Scan className="h-4 w-4 mr-2" />
              {isScanning ? 'Processing...' : 'Capture & Scan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scanned Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Scanned Floor Plans</CardTitle>
          <CardDescription>
            Generated floor plans from your room scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scannedPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No floor plans scanned yet. Use the camera above to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {scannedPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex space-x-4">
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-gray-600">
                        {plan.dimensions.width}' × {plan.dimensions.height}' ({plan.dimensions.area} sq ft)
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Rooms detected:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.rooms.map((room, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {room.name} ({room.area} sq ft)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloorPlanScanner;
