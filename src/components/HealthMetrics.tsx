import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Activity, Droplets, Smartphone, AlertTriangle } from 'lucide-react';

interface HealthData {
  heartRate: number;
  oxygenLevel: number;
  sweatLevel: number;
  smokingRisk: 'low' | 'medium' | 'high';
  lastUpdate: Date;
}

interface HealthMetricsProps {
  serialData: string[];
  connected: boolean;
}

export const HealthMetrics = ({ serialData, connected }: HealthMetricsProps) => {
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 0,
    oxygenLevel: 0,
    sweatLevel: 0,
    smokingRisk: 'low',
    lastUpdate: new Date()
  });

  useEffect(() => {
    // Parse the latest serial data for health metrics
    const latestData = serialData.slice(-10); // Look at last 10 messages
    let newHealthData = { ...healthData };

    latestData.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Parse heart rate
      const heartMatch = lowerLine.match(/heart[:\s]*(\d+)/) || lowerLine.match(/bpm[:\s]*(\d+)/) || lowerLine.match(/hr[:\s]*(\d+)/);
      if (heartMatch) {
        newHealthData.heartRate = parseInt(heartMatch[1]);
      }

      // Parse oxygen level
      const oxygenMatch = lowerLine.match(/oxygen[:\s]*(\d+)/) || lowerLine.match(/spo2[:\s]*(\d+)/) || lowerLine.match(/o2[:\s]*(\d+)/);
      if (oxygenMatch) {
        newHealthData.oxygenLevel = parseInt(oxygenMatch[1]);
      }

      // Parse sweat level
      const sweatMatch = lowerLine.match(/sweat[:\s]*(\d+)/) || lowerLine.match(/gsr[:\s]*(\d+)/);
      if (sweatMatch) {
        newHealthData.sweatLevel = parseInt(sweatMatch[1]);
      }

      // Determine smoking risk based on multiple factors
      if (lowerLine.includes('smoking') || lowerLine.includes('smoke')) {
        if (lowerLine.includes('high') || lowerLine.includes('detected')) {
          newHealthData.smokingRisk = 'high';
        } else if (lowerLine.includes('medium') || lowerLine.includes('possible')) {
          newHealthData.smokingRisk = 'medium';
        }
      }
    });

    // Auto-calculate smoking risk based on metrics
    if (newHealthData.heartRate > 100 && newHealthData.sweatLevel > 70) {
      newHealthData.smokingRisk = 'high';
    } else if (newHealthData.heartRate > 85 && newHealthData.sweatLevel > 50) {
      newHealthData.smokingRisk = 'medium';
    } else if (newHealthData.heartRate < 80 && newHealthData.sweatLevel < 30) {
      newHealthData.smokingRisk = 'low';
    }

    newHealthData.lastUpdate = new Date();
    setHealthData(newHealthData);
  }, [serialData]);

  const getHeartRateColor = (hr: number) => {
    if (hr < 60 || hr > 100) return 'text-destructive';
    if (hr > 85) return 'text-accent';
    return 'text-secondary';
  };

  const getOxygenColor = (oxygen: number) => {
    if (oxygen < 95) return 'text-destructive';
    if (oxygen < 97) return 'text-accent';
    return 'text-secondary';
  };

  const getSmokingRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-accent';
      default: return 'text-secondary';
    }
  };

  const getSmokingRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return <Badge variant="destructive">High Risk</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-accent text-accent-foreground">Medium Risk</Badge>;
      default: return <Badge variant="default" className="bg-secondary">Low Risk</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Heart Rate */}
      <Card className="shadow-health">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className={`h-4 w-4 ${getHeartRateColor(healthData.heartRate)}`} />
            Heart Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${getHeartRateColor(healthData.heartRate)}`}>
              {connected && healthData.heartRate > 0 ? healthData.heartRate : '--'}
              <span className="text-sm font-normal text-muted-foreground ml-1">BPM</span>
            </div>
            <Progress value={Math.min(healthData.heartRate, 120)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Normal: 60-100 BPM
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Oxygen Level */}
      <Card className="shadow-health">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className={`h-4 w-4 ${getOxygenColor(healthData.oxygenLevel)}`} />
            Blood Oxygen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${getOxygenColor(healthData.oxygenLevel)}`}>
              {connected && healthData.oxygenLevel > 0 ? healthData.oxygenLevel : '--'}
              <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
            </div>
            <Progress value={healthData.oxygenLevel} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Normal: 95-100%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sweat Level */}
      <Card className="shadow-health">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Droplets className="h-4 w-4 text-blue-500" />
            Sweat Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {connected && healthData.sweatLevel > 0 ? healthData.sweatLevel : '--'}
              <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
            </div>
            <Progress value={healthData.sweatLevel} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Galvanic skin response
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Smoking Risk */}
      <Card className="shadow-health">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className={`h-4 w-4 ${getSmokingRiskColor(healthData.smokingRisk)}`} />
            Smoking Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {getSmokingRiskBadge(healthData.smokingRisk)}
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on biometric patterns
            </p>
            {connected && (
              <p className="text-xs text-muted-foreground">
                Last update: {healthData.lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};