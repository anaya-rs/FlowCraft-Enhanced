import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Settings as SettingsIcon, User, Folder, Database, Save, FolderOpen } from "lucide-react";

const Settings = () => {
  const [sourceFolder, setSourceFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [autoProcess, setAutoProcess] = useState(true);
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john@example.com");

  const handleSelectFolder = async (type: 'source' | 'destination') => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const folderPath = dirHandle.name;
        
        if (type === 'source') {
          setSourceFolder(folderPath);
        } else {
          setDestinationFolder(folderPath);
        }
      } else {
        alert('Folder selection not supported. Please enter path manually.');
      }
    } catch (error) {
      console.log('User cancelled folder selection');
    }
  };

  const handleSaveSettings = () => {
    const settings = {
      sourceFolder,
      destinationFolder,
      apiKey,
      autoProcess,
      profile: { firstName, lastName, email },
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('app_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300">Configure your FlowCraft AI preferences</p>
        </div>

        <div className="space-y-6">
          <Card className="glass-card-dark border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 bg-input border-border text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 bg-input border-border text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 bg-input border-border text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card-dark border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Folder className="h-5 w-5" />
                Folder Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sourceFolder" className="text-white">Source Folder</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="sourceFolder"
                    value={sourceFolder}
                    onChange={(e) => setSourceFolder(e.target.value)}
                    placeholder="Select or enter source folder path"
                    className="bg-input border-border text-white"
                  />
                  <Button
                    onClick={() => handleSelectFolder('source')}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="destinationFolder" className="text-white">Destination Folder</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="destinationFolder"
                    value={destinationFolder}
                    onChange={(e) => setDestinationFolder(e.target.value)}
                    placeholder="Select or enter destination folder path"
                    className="bg-input border-border text-white"
                  />
                  <Button
                    onClick={() => handleSelectFolder('destination')}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-white">Auto-process new files</Label>
                  <p className="text-xs text-gray-400">Automatically process files added to source folder</p>
                </div>
                <Switch checked={autoProcess} onCheckedChange={setAutoProcess} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card-dark border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="apiKey" className="text-white">OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-2 bg-input border-border text-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              className="gradient-orange hover:gradient-orange-hover text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
