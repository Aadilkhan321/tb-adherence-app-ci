import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, Thermometer, Droplets, AlertTriangle, Settings, Bell, RefreshCw, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const IoTPillDispenser = ({ patient }) => {
  const [deviceStatus, setDeviceStatus] = useState({
    isConnected: false,
    batteryLevel: 85,
    temperature: 22,
    humidity: 45,
    pillCount: 120,
    lastDispensed: null,
    nextReminder: null,
    wifiSignal: 85
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [settings] = useState({
    autoDispense: true,
    reminderFrequency: 'daily',
    soundAlert: true,
    ledAlert: true,
    temperatureAlert: true,
    lowPillAlert: 20
  });

  useEffect(() => {
    generateDeviceHistory();
    generateAlerts();
    const cleanup = simulateRealTimeUpdates();
    return cleanup;
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

  const simulateRealTimeUpdates = () => {
    const interval = setInterval(() => {
      if (deviceStatus.isConnected) {
        setDeviceStatus(prev => ({
          ...prev,
          temperature: 20 + Math.random() * 8,
          humidity: 40 + Math.random() * 20,
          batteryLevel: Math.max(prev.batteryLevel - Math.random() * 0.5, 0),
          wifiSignal: 70 + Math.random() * 30
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const generateDeviceHistory = () => {
    if (!patient) return;

    const history = [];
    const now = new Date();
    
    // Generate dispenser history based on patient's medication logs
    for (let i = 0; i < patient.totalDays; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const morningTime = new Date(date);
      morningTime.setHours(8, 0, 0, 0);
      
      history.push({
        id: `disp_${date.getTime()}`,
        timestamp: morningTime.toISOString(),
        action: 'pill_dispensed',
        details: {
          pillsDispensed: 4,
          medications: ['Isoniazid', 'Rifampin', 'Ethambutol', 'Pyrazinamide'],
          temperature: 20 + Math.random() * 8,
          humidity: 40 + Math.random() * 20,
          takenConfirmation: Math.random() > 0.1 // 90% taken confirmation
        }
      });

      if (Math.random() > 0.8) { // 20% chance of refill
        history.push({
          id: `refill_${date.getTime()}`,
          timestamp: new Date(date.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          action: 'refill_completed',
          details: {
            pillsAdded: 112,
            totalPills: 120,
            refillBy: 'Healthcare Provider',
            batchNumber: `TB${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          }
        });
      }
    }

    setDeviceHistory(history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const generateAlerts = () => {
    const alertsData = [];
    
    if (deviceStatus.batteryLevel < 20) {
      alertsData.push({
        id: 'battery_low',
        type: 'warning',
        title: 'Low Battery Alert',
        message: 'Device battery is below 20%. Please charge soon.',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      });
    }

    if (deviceStatus.pillCount < settings.lowPillAlert) {
      alertsData.push({
        id: 'pills_low',
        type: 'critical',
        title: 'Medication Refill Needed',
        message: `Only ${deviceStatus.pillCount} pills remaining. Schedule a refill.`,
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    }

    if (deviceStatus.temperature > 30 || deviceStatus.temperature < 15) {
      alertsData.push({
        id: 'temp_alert',
        type: 'warning',
        title: 'Temperature Alert',
        message: `Storage temperature is ${deviceStatus.temperature.toFixed(1)}°C. Medications should be stored between 15-30°C.`,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      });
    }

    if (!deviceStatus.isConnected) {
      alertsData.push({
        id: 'connection_lost',
        type: 'error',
        title: 'Connection Lost',
        message: 'Smart dispenser is offline. Check WiFi connection.',
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    }

    setAlerts(alertsData);
  };

  const connectDevice = async () => {
    setIsConnecting(true);
    toast.success('🔍 Scanning for IoT pill dispensers...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('📱 Found "SmartPill TB Dispenser v2.1"');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setDeviceStatus(prev => ({
      ...prev,
      isConnected: true,
      lastDispensed: new Date().toISOString(),
      nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
    
    setIsConnecting(false);
    toast.success('✅ IoT pill dispenser connected successfully!');
    generateAlerts();
  };

  const disconnectDevice = () => {
    setDeviceStatus(prev => ({ ...prev, isConnected: false }));
    toast.success('📱 Device disconnected');
    generateAlerts();
  };

  const dispensePill = async () => {
    if (!deviceStatus.isConnected) {
      toast.error('Device not connected');
      return;
    }

    toast.success('💊 Dispensing medication...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDeviceStatus(prev => ({
      ...prev,
      pillCount: Math.max(prev.pillCount - 4, 0),
      lastDispensed: new Date().toISOString(),
      nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));

    // Add to history
    const newEntry = {
      id: `disp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'pill_dispensed',
      details: {
        pillsDispensed: 4,
        medications: ['Isoniazid', 'Rifampin', 'Ethambutol', 'Pyrazinamide'],
        temperature: deviceStatus.temperature,
        humidity: deviceStatus.humidity,
        takenConfirmation: false // Will be updated when patient confirms
      }
    };

    setDeviceHistory(prev => [newEntry, ...prev]);
    
    toast.success('✅ Medication dispensed! Please take your pills now.');
    
    // Simulate patient taking medication after 5 seconds
    setTimeout(() => {
      setDeviceHistory(prev => prev.map(entry => 
        entry.id === newEntry.id 
          ? { ...entry, details: { ...entry.details, takenConfirmation: true } }
          : entry
      ));
      toast.success('✅ Medication intake confirmed by smart sensors!');
    }, 5000);
  };

  const refillDispenser = async () => {
    toast.success('📦 Processing refill request...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setDeviceStatus(prev => ({ ...prev, pillCount: 120 }));
    
    const refillEntry = {
      id: `refill_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'refill_completed',
      details: {
        pillsAdded: 120,
        totalPills: 120,
        refillBy: 'User (Manual)',
        batchNumber: `TB${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      }
    };

    setDeviceHistory(prev => [refillEntry, ...prev]);
    generateAlerts();
    
    toast.success('✅ Dispenser refilled successfully!');
  };

  const testReminder = () => {
    toast.success('🔔 Testing reminder system...');
    setTimeout(() => {
      toast('📱 Smart Dispenser Alert: Time to take your TB medication!', {
        duration: 5000,
        icon: '💊'
      });
    }, 1000);
  };

  const getStatusColor = () => {
    if (!deviceStatus.isConnected) return 'text-red-600';
    if (alerts.some(alert => alert.severity === 'high')) return 'text-orange-600';
    return 'text-green-600';
  };

  const getBatteryIcon = () => {
    if (deviceStatus.batteryLevel > 75) return '🔋';
    if (deviceStatus.batteryLevel > 50) return '🔋';
    if (deviceStatus.batteryLevel > 25) return '🪫';
    return '🪫';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Smartphone className="mr-3" />
              Smart Pill Dispenser
            </h2>
            <p className="text-cyan-100 mt-1">IoT-connected medication management system</p>
          </div>
          <div className="text-center">
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              <div className={`w-3 h-3 rounded-full ${deviceStatus.isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="font-semibold text-white">
                {deviceStatus.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Status Dashboard */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">{getBatteryIcon()}</div>
            <p className="text-xl font-bold text-gray-800">{deviceStatus.batteryLevel.toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Battery</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg text-center">
            <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-800">{deviceStatus.temperature.toFixed(1)}°C</p>
            <p className="text-sm text-gray-600">Temperature</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg text-center">
            <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-800">{deviceStatus.humidity.toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Humidity</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg text-center">
            <Package className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-800">{deviceStatus.pillCount}</p>
            <p className="text-sm text-gray-600">Pills Left</p>
          </div>
        </div>

        {/* WiFi Signal */}
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wifi className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-semibold text-gray-800">WiFi Signal</p>
                <p className="text-sm text-gray-600">SmartHome_Network_5G</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">{deviceStatus.wifiSignal.toFixed(0)}%</p>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-2 h-4 rounded ${
                      (bar * 25) <= deviceStatus.wifiSignal ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b">
        <div className="flex flex-wrap gap-3 mb-4">
          {!deviceStatus.isConnected ? (
            <button
              onClick={connectDevice}
              disabled={isConnecting}
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-50 flex items-center transition-colors"
            >
              <Wifi className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Device'}
            </button>
          ) : (
            <>
              <button
                onClick={dispensePill}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center transition-colors"
              >
                <Package className="w-4 h-4 mr-2" />
                Dispense Medication
              </button>
              
              <button
                onClick={refillDispenser}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refill Dispenser
              </button>
              
              <button
                onClick={testReminder}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center transition-colors"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Reminder
              </button>
              
              <button
                onClick={disconnectDevice}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center transition-colors"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Disconnect
              </button>
            </>
          )}
        </div>

        {deviceStatus.isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded border">
              <p className="font-medium text-green-800">Last Dispensed:</p>
              <p className="text-green-700">
                {deviceStatus.lastDispensed 
                  ? formatTimestamp(deviceStatus.lastDispensed)
                  : 'Never'
                }
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border">
              <p className="font-medium text-blue-800">Next Reminder:</p>
              <p className="text-blue-700">
                {deviceStatus.nextReminder 
                  ? formatTimestamp(deviceStatus.nextReminder)
                  : 'Not scheduled'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Device Alerts ({alerts.length})
          </h3>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`border-2 rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
                <div className="flex items-start space-x-3">
                  <div className="text-xl">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <p className="text-xs opacity-75">{formatTimestamp(alert.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device History */}
      {deviceStatus.isConnected && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Recent Device Activity
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {deviceHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">
                      {entry.action === 'pill_dispensed' ? '💊' : 
                       entry.action === 'refill_completed' ? '📦' : '⚙️'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {entry.action.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</p>
                    </div>
                  </div>
                  
                  {entry.action === 'pill_dispensed' && (
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      entry.details.takenConfirmation 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.details.takenConfirmation ? '✅ Taken' : '⏳ Pending'}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  {entry.action === 'pill_dispensed' && (
                    <p>Dispensed {entry.details.pillsDispensed} pills • Temp: {entry.details.temperature.toFixed(1)}°C</p>
                  )}
                  {entry.action === 'refill_completed' && (
                    <p>Added {entry.details.pillsAdded} pills • Batch: {entry.details.batchNumber}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Info */}
      <div className="p-6 bg-cyan-50 border-t">
        <h4 className="font-semibold text-cyan-800 mb-2">Smart Dispenser Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cyan-700">
          <div>
            <strong>🤖 Automated Dispensing:</strong> Never forget your medication with scheduled dispensing
          </div>
          <div>
            <strong>📊 Real-time Monitoring:</strong> Track temperature, humidity, and pill count automatically
          </div>
          <div>
            <strong>🔔 Smart Alerts:</strong> Get notifications for refills, maintenance, and reminders
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTPillDispenser;