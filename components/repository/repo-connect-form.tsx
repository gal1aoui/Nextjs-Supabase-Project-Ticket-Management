"use client";

import { Github, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectRepo } from "@/stores/repository.store";
import type { GitProvider } from "@/types/repository";

interface RepoConnectFormProps {
  projectId: string;
}

export function RepoConnectForm({ projectId }: RepoConnectFormProps) {
  const [provider, setProvider] = useState<GitProvider>("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const connectRepo = useConnectRepo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl || !accessToken) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await connectRepo.mutateAsync({
        project_id: projectId,
        provider,
        repo_url: repoUrl,
        access_token: accessToken,
      });

      toast.success("Repository connected successfully");
      setRepoUrl("");
      setAccessToken("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect repository");
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Link2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>Connect Repository</CardTitle>
        <CardDescription>
          Link a GitHub or GitLab repository to view commit history and branches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as GitProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </div>
                </SelectItem>
                <SelectItem value="gitlab">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                    </svg>
                    GitLab
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder={
                provider === "github"
                  ? "https://github.com/owner/repo"
                  : "https://gitlab.com/owner/repo"
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="access-token">Personal Access Token</Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your PAT"
            />
            <p className="text-xs text-muted-foreground">
              {provider === "github"
                ? "Generate a token at GitHub Settings > Developer settings > Personal access tokens"
                : "Generate a token at GitLab Settings > Access Tokens"}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={connectRepo.isPending}>
            {connectRepo.isPending ? "Connecting..." : "Connect Repository"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
