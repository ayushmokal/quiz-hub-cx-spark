// This page is not used in the CX Quiz Hub - App.tsx handles the main application logic
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirect to the main app
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading CX Quiz Hub...</h1>
        <p className="text-xl text-muted-foreground">Redirecting to the main application</p>
      </div>
    </div>
  );
};

export default Index;
