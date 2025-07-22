import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, BluetoothConnected, Wifi, WifiOff, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BluetoothConnectionProps {
  onDataReceived: (data: string) => void;
  onConnectionStatusChange: (connected: boolean) => void;
}

export const BluetoothConnection = ({ onDataReceived, onConnectionStatusChange }: BluetoothConnectionProps) => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();
  const decoderRef = useRef(new TextDecoder());

  const handleDisconnection = useCallback(() => {
    setConnected(false);
    setCharacteristic(null);
    onConnectionStatusChange(false);
    toast({
      title: "Device Disconnected",
      description: "ESP32 health monitor disconnected",
      variant: "destructive"
    });
  }, [onConnectionStatusChange, toast]);

  const connectToDevice = async () => {
    if (!navigator.bluetooth) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Your browser doesn't support Web Bluetooth API",
        variant: "destructive"
      });
      return;
    }

    try {
      setScanning(true);
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP32' },
          { namePrefix: 'HealthWatch' },
          { services: ['12345678-1234-1234-1234-123456789abc'] }
        ],
        optionalServices: ['12345678-1234-1234-1234-123456789abc']
      });

      device.addEventListener('gattserverdisconnected', handleDisconnection);
      
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService('12345678-1234-1234-1234-123456789abc');
      const characteristic = await service.getCharacteristic('87654321-4321-4321-4321-cba987654321');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        if (target?.value) {
          const data = decoderRef.current.decode(target.value);
          onDataReceived(data);
        }
      });

      setDevice(device);
      setCharacteristic(characteristic);
      setConnected(true);
      onConnectionStatusChange(true);
      
      toast({
        title: "Connected Successfully",
        description: `Connected to ${device.name || 'ESP32 Health Monitor'}`,
      });

    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to ESP32 device",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const disconnect = async () => {
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    handleDisconnection();
  };

  return (
    <Card className="shadow-health">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connected ? (
            <BluetoothConnected className="h-5 w-5 text-primary" />
          ) : (
            <Bluetooth className="h-5 w-5 text-muted-foreground" />
          )}
          ESP32 Health Monitor
        </CardTitle>
        <CardDescription>
          Connect to your wearable health monitoring device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi className="h-4 w-4 text-secondary" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge variant={connected ? "default" : "secondary"} className="bg-primary">
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          {connected && device && (
            <div className="text-sm text-muted-foreground">
              {device.name || "ESP32 Device"}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!connected ? (
            <Button 
              variant="connect" 
              onClick={connectToDevice}
              disabled={scanning}
              className="flex-1"
            >
              <Zap className="h-4 w-4" />
              {scanning ? "Scanning..." : "Connect Device"}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="flex-1"
            >
              Disconnect
            </Button>
          )}
        </div>

        {!connected && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Make sure your ESP32 is powered on</p>
            <p>• Enable Bluetooth on your device</p>
            <p>• Device should advertise as "ESP32" or "HealthWatch"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};