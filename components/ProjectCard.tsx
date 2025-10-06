// File: components/ProjectCard.tsx

"use client";

import Link from "next/link"; // <-- 1. Import Link
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {

  const creationDate = new Date(project.created_at).toLocaleDateString();

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#ccc' }} />
              <CardTitle>{project.name}</CardTitle>
            </div>
            {/* Per UX, actions removed from dashboard cards. Actions now live in the project page header. */}
          </div>
          <CardDescription className="pt-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- 2. Wrap the button with the Link component --- */}
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button variant="outline" className="w-full">Open Project</Button>
          </Link>
        </CardContent>
      </div>
      
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-4">
        <span className="text-xs px-2 py-1 bg-muted rounded-md capitalize">
          {project.status}
        </span>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span> 
            {creationDate}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}