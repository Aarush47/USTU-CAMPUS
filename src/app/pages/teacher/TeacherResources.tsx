import { Plus, Upload, Trash2 } from "lucide-react";
import { useState } from "react";

type Resource = {
  id: number;
  title: string;
  class: string;
  type: string;
  uploadedAt: string;
};

export function TeacherResources() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const resources: Resource[] = [
    // Placeholder
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Resources</h1>
          <p className="text-muted-foreground">
            Share study materials with your students
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload Resource
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Upload Resource</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowUploadForm(false);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Resource title"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class
                </label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary">
                  <option value="">Choose a class...</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Choose File
              </label>
              <input
                type="file"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            No resources uploaded yet
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {resource.class} • {resource.type} • {resource.uploadedAt}
                </p>
              </div>
              <button className="p-2 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
