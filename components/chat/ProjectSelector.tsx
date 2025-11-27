"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    name: string;
    color: string;
}

interface ProjectSelectorProps {
    selectedProject: Project | null;
    onSelectProject: (project: Project) => void;
}

export function ProjectSelector({ selectedProject, onSelectProject }: ProjectSelectorProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/projects/list");
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data.projects || []);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        setIsCreatingProject(true);
        try {
            const response = await fetch("/api/projects/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newProjectName.trim() }),
            });

            if (!response.ok) throw new Error("Failed to create project");

            const data = await response.json();
            const newProject = data.project;

            setProjects([...projects, newProject]);
            onSelectProject(newProject);
            setNewProjectName("");
            setShowNewProjectDialog(false);
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setIsCreatingProject(false);
        }
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between"
                    >
                        {selectedProject ? (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: selectedProject.color }}
                                />
                                {selectedProject.name}
                            </div>
                        ) : (
                            "Select project..."
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <div className="p-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                setShowNewProjectDialog(true);
                                setIsOpen(false);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                    <div className="border-t">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Loading projects...
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No projects yet
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto">
                                {projects.map((project) => (
                                    <Button
                                        key={project.id}
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            onSelectProject(project);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: project.color }}
                                        />
                                        {project.name}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Project name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCreateProject();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowNewProjectDialog(false);
                                setNewProjectName("");
                            }}
                            disabled={isCreatingProject}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProject}
                            disabled={!newProjectName.trim() || isCreatingProject}
                        >
                            {isCreatingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
