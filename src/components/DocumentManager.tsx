import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDocuments, useDeleteDocument, useDownloadDocument, Document } from "@/hooks/useDocuments";
import { 
  FileText, 
  Trash2, 
  Download, 
  Loader2,
  File,
  Search,
  Eye,
  Image,
  FileIcon,
  Calendar,
  HardDrive
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const documentTypes = [
  { value: "recommendation", label: "Recommendation Letter" },
  { value: "transcript", label: "Transcript" },
  { value: "test_score", label: "Test Score Report" },
  { value: "essay", label: "Essay" },
  { value: "other", label: "Other" },
];

export function DocumentManager() {
  const { data: documents, isLoading } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handlePreview = async (doc: Document) => {
    setPreviewDoc(doc);
    setIsPreviewLoading(true);
    
    try {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 300); // 5 min expiry
      
      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
      }
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    const blob = await downloadMutation.mutateAsync(doc.file_path);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (deleteDoc) {
      deleteMutation.mutate(deleteDoc);
      setDeleteDoc(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  const getFileIcon = (doc: Document) => {
    const ext = doc.file_path.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (ext === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <FileIcon className="h-5 w-5 text-secondary" />;
  };

  const isPreviewable = (doc: Document) => {
    const ext = doc.file_path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(ext || '');
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "recommendation": return "default";
      case "transcript": return "secondary";
      case "test_score": return "outline";
      case "essay": return "default";
      default: return "outline";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(null)}
              >
                All
              </Button>
              {documentTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={filterType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : filteredDocuments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No documents found</p>
              <p className="text-sm mt-1">
                {searchQuery || filterType 
                  ? "Try adjusting your search or filters" 
                  : "Upload documents to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments?.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {getFileIcon(doc)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <Badge variant={getTypeBadgeVariant(doc.type)} className="mt-1 text-xs">
                          {getTypeLabel(doc.type)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      {isPreviewable(doc) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePreview(doc)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={isPreviewable(doc) ? "" : "flex-1"}
                        onClick={() => handleDownload(doc)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteDoc(doc)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Stats */}
          {documents && documents.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
              <span>{filteredDocuments?.length} of {documents.length} documents</span>
              <span>
                Total size: {formatFileSize(documents.reduce((acc, d) => acc + (d.file_size || 0), 0))}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => { setPreviewDoc(null); setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDoc && getFileIcon(previewDoc)}
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[70vh]">
            {isPreviewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            ) : previewUrl ? (
              previewDoc?.file_path.endsWith('.pdf') ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-[65vh] rounded-lg border"
                  title={previewDoc?.name}
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt={previewDoc?.name}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
              )
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>Unable to load preview</p>
              </div>
            )}
          </div>
          {previewDoc && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => handleDownload(previewDoc)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDoc?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
