import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, Trash2, Download, Heart, Droplets, Activity } from 'lucide-react';

interface SerialData {
  timestamp: string;
  data: string;
  type: 'heartrate' | 'oxygen' | 'sweat' | 'accelerometer' | 'general';
}

interface SerialMonitorProps {
  data: string[];
  connected: boolean;
}

export const SerialMonitor = ({ data, connected }: SerialMonitorProps) => {
  const [parsedData, setParsedData] = useState<SerialData[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newData = data.map((line, index) => {
      const timestamp = new Date().toLocaleTimeString();
      let type: SerialData['type'] = 'general';
      
      // Parse different data types based on content
      if (line.toLowerCase().includes('heart') || line.includes('bpm')) {
        type = 'heartrate';
      } else if (line.toLowerCase().includes('oxygen') || line.includes('spo2')) {
        type = 'oxygen';
      } else if (line.toLowerCase().includes('sweat') || line.includes('gsr')) {
        type = 'sweat';
      } else if (line.toLowerCase().includes('accel') || line.includes('smoking')) {
        type = 'accelerometer';
      }

      return {
        timestamp,
        data: line,
        type
      };
    });

    setParsedData(newData);
  }, [data]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [parsedData]);

  const clearData = () => {
    setParsedData([]);
  };

  const downloadLogs = () => {
    const logContent = parsedData.map(item => 
      `[${item.timestamp}] ${item.data}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-monitor-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: SerialData['type']) => {
    switch (type) {
      case 'heartrate':
        return <Heart className="h-3 w-3 text-red-500" />;
      case 'oxygen':
        return <Activity className="h-3 w-3 text-blue-500" />;
      case 'sweat':
        return <Droplets className="h-3 w-3 text-yellow-500" />;
      case 'accelerometer':
        return <Activity className="h-3 w-3 text-purple-500" />;
      default:
        return <Terminal className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: SerialData['type']) => {
    const variants = {
      heartrate: 'destructive',
      oxygen: 'default',
      sweat: 'secondary',
      accelerometer: 'outline',
      general: 'outline'
    } as const;

    return (
      <Badge variant={variants[type]} className="text-xs">
        {type}
      </Badge>
    );
  };

  return (
    <Card className="shadow-health">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Serial Monitor
            </CardTitle>
            <CardDescription>
              Real-time data from your ESP32 health monitor
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
              disabled={parsedData.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearData}
              disabled={parsedData.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={connected ? "default" : "secondary"} className="bg-primary">
              {connected ? "Receiving Data" : "Disconnected"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {parsedData.length} messages
            </span>
          </div>

          <ScrollArea className="h-96 w-full rounded-md border p-4" ref={scrollRef}>
            {parsedData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {connected ? "Waiting for data..." : "Connect device to see data"}
              </div>
            ) : (
              <div className="space-y-2">
                {parsedData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {getTypeIcon(item.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.timestamp}
                        </span>
                        {getTypeBadge(item.type)}
                      </div>
                      <p className="text-sm font-mono leading-relaxed">
                        {item.data}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};