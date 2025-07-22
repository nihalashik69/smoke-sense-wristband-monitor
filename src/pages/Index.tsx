import { useState } from 'react';
import { BluetoothConnection } from '@/components/BluetoothConnection';
import { SerialMonitor } from '@/components/SerialMonitor';
import { HealthMetrics } from '@/components/HealthMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Smartphone } from 'lucide-react';

const Index = () => {
  const [serialData, setSerialData] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  const handleDataReceived = (data: string) => {
    setSerialData(prev => [...prev, data]);
  };

  const handleConnectionStatusChange = (isConnected: boolean) => {
    setConnected(isConnected);
    if (!isConnected) {
      // Keep data when disconnected, don't clear it
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-gradient-primary">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">ESP32 Health Monitor</h1>
            <p className="text-muted-foreground">Wearable Smoking Detection & Health Tracking</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Smartphone className="h-3 w-3" />
            Smart Watch Integration
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Real-time Monitoring
          </Badge>
        </div>
      </div>

      {/* Health Metrics Dashboard */}
      <HealthMetrics serialData={serialData} connected={connected} />

      {/* Connection and Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bluetooth Connection */}
        <BluetoothConnection 
          onDataReceived={handleDataReceived}
          onConnectionStatusChange={handleConnectionStatusChange}
        />

        {/* Quick Info Card */}
        <Card className="shadow-health">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              About This Monitor
            </CardTitle>
            <CardDescription>
              Real-time health tracking and smoking detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">Sensors:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Heart Rate (PPG)</li>
                  <li>• Blood Oxygen (SpO2)</li>
                  <li>• Sweat Detection (GSR)</li>
                  <li>• Motion (Accelerometer)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">Features:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Real-time monitoring</li>
                  <li>• Smoking pattern detection</li>
                  <li>• Health trend analysis</li>
                  <li>• Bluetooth connectivity</li>
                </ul>
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <p>Connect your ESP32 device to start monitoring your health metrics and receive smoking detection alerts based on biometric patterns.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Serial Monitor */}
      <SerialMonitor data={serialData} connected={connected} />

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>ESP32 Health Monitor • Real-time Biometric Analysis • Smoking Detection Technology</p>
      </div>
    </div>
  );
};

export default Index;
