import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DocumentManager } from "@/components/DocumentManager";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function Documents() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Documents | BoardingSchoolBuddy</title>
        <meta name="description" content="Manage your application documents including recommendation letters, transcripts, and test scores." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container max-w-6xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">My Documents</h1>
                <p className="text-muted-foreground mt-1">
                  Manage all your application documents in one place
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
              <DocumentManager />
              <div className="space-y-6">
                <DocumentUpload />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
