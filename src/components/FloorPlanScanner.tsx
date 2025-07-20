import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Scan, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScannedFloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  floorPlanUrl?: string;
  uploadId?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  dimensions?: {
    width: number;
    height: number;
    area: number;
  };
  rooms?: Array<{
    name: string;
    area: number;
  }>;
  scanDate: Date;
}

const FloorPlanScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPlans, setScannedPlans] = useState<ScannedFloorPlan[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        toast({
          title: "Camera started",
          description: "Point your camera at the room to scan",
        });
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan floor plans",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
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
    
    const newPlan: ScannedFloorPlan = {
      id: Date.now().toString(),
      name: `Floor Plan ${scannedPlans.length + 1}`,
      imageUrl: imageData,
      status: 'uploading',
      scanDate: new Date()
    };

    setScannedPlans(prev => [...prev, newPlan]);

    try {
      // Upload to Cubicasa via edge function
      const { data, error } = await supabase.functions.invoke('cubicasa-floor-plan', {
        body: {
          method: 'upload_image',
          imageData,
          propertyId: null // You can add property selection later
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update plan with upload ID
        setScannedPlans(prev => prev.map(plan => 
          plan.id === newPlan.id 
            ? { ...plan, status: 'processing', uploadId: data.upload_id }
            : plan
        ));

        toast({
          title: "Upload successful",
          description: "Your floor plan is being processed by Cubicasa",
        });

        // Poll for completion
        pollFloorPlanStatus(newPlan.id, data.upload_id);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Floor plan processing failed:', error);
      setScannedPlans(prev => prev.map(plan => 
        plan.id === newPlan.id 
          ? { ...plan, status: 'failed' }
          : plan
      ));
      
      toast({
        title: "Processing failed",
        description: "Failed to process floor plan. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsScanning(false);
  };

  const pollFloorPlanStatus = async (planId: string, uploadId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('cubicasa-floor-plan', {
          body: {
            method: 'get_floor_plan',
            uploadId
          }
        });

        if (error) throw error;

        if (data.status === 'completed') {
          setScannedPlans(prev => prev.map(plan => 
            plan.id === planId 
              ? { 
                  ...plan, 
                  status: 'completed',
                  floorPlanUrl: data.floor_plan_url,
                  dimensions: data.measurements ? {
                    width: data.measurements.width || 0,
                    height: data.measurements.height || 0,
                    area: data.measurements.area || 0
                  } : undefined,
                  rooms: data.rooms || []
                }
              : plan
          ));

          toast({
            title: "Floor plan ready!",
            description: "Your floor plan has been generated successfully",
          });
          return;
        }

        if (data.status === 'failed') {
          setScannedPlans(prev => prev.map(plan => 
            plan.id === planId 
              ? { ...plan, status: 'failed' }
              : plan
          ));
          return;
        }

        // Continue polling if still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          // Timeout
          setScannedPlans(prev => prev.map(plan => 
            plan.id === planId 
              ? { ...plan, status: 'failed' }
              : plan
          ));
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    setTimeout(checkStatus, 5000); // First check after 5 seconds
  };

  const getStatusIcon = (status: ScannedFloorPlan['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: ScannedFloorPlan['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing with Cubicasa...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-6 w-6 mr-2 text-brand-blue" />
            Cubicasa Floor Plan Scanner
          </CardTitle>
          <CardDescription>
            Use your device camera to scan rooms and generate professional floor plans with Cubicasa
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
            {!isCameraActive ? (
              <Button onClick={startCamera} variant="outline" className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Camera
              </Button>
            )}
            <Button 
              onClick={capturePhoto} 
              disabled={isScanning || !isCameraActive}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
            >
              <Scan className="h-4 w-4 mr-2" />
              {isScanning ? 'Processing...' : 'Capture & Scan'}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>• Point your camera at the room you want to scan</p>
            <p>• Ensure good lighting for best results</p>
            <p>• Processing may take several minutes</p>
          </div>
        </CardContent>
      </Card>

      {/* Scanned Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Scanned Floor Plans</CardTitle>
          <CardDescription>
            Floor plans generated with Cubicasa AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scannedPlans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No floor plans scanned yet. Use the camera above to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {scannedPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex space-x-4">
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{plan.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(plan.status)}
                          <span className="text-sm text-muted-foreground">
                            {getStatusText(plan.status)}
                          </span>
                        </div>
                      </div>
                      
                      {plan.dimensions && (
                        <p className="text-sm text-muted-foreground">
                          {plan.dimensions.width}' × {plan.dimensions.height}' ({plan.dimensions.area} sq ft)
                        </p>
                      )}
                      
                      {plan.rooms && plan.rooms.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Rooms detected:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {plan.rooms.map((room, index) => (
                              <span
                                key={index}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                              >
                                {room.name} ({room.area} sq ft)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {plan.floorPlanUrl && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(plan.floorPlanUrl, '_blank')}
                          >
                            View Floor Plan
                          </Button>
                        </div>
                      )}
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