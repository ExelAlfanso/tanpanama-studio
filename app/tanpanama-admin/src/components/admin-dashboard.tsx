// biome-ignore-all lint/complexity/noVoid: UI handlers intentionally start async work that handles its own errors.
// biome-ignore-all lint/performance/noJsxPropsBind: These callbacks close over live form and row values; children are not memoized.
import type { Project, ProjectInput } from "@tanpanama/contracts";
import { projectInputSchema } from "@tanpanama/contracts";
import { useForm } from "@tanstack/react-form";
import { ArrowUpRight, LogOut, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useThemeStore } from "@/stores/theme";

const emptyProject: ProjectInput = {
  category: "",
  description: "",
  featured: false,
  image: "freight",
  imageUrl: null,
  published: true,
  sortOrder: 0,
  summary: "",
  title: "",
  year: "2026",
};

interface AdminUser {
  email: string;
  name: string;
}

export function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editor, setEditor] = useState<{
    id: string | null;
    values: ProjectInput;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        setUser(null);
        setProjects([]);
        setStatus("");
        return;
      }

      setUser({ email: data.user.email, name: data.user.name });
      const response = await api.api.admin.projects.$get();
      if (!response.ok) {
        setStatus("Your account does not have studio access.");
        return;
      }
      setProjects(await response.json());
      setStatus("");
    } catch {
      setUser(null);
      setProjects([]);
      setStatus("Studio could not be reached. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function edit(project: Project) {
    setEditor({ id: project.id, values: { ...project } });
    setStatus("");
  }

  async function remove(id: string) {
    try {
      const response = await api.api.admin.projects[":id"].$delete({
        param: { id },
      });
      if (!response.ok) {
        setStatus("Project could not be deleted. Try again.");
        return;
      }
      setProjects((items) => items.filter((project) => project.id !== id));
      setDeleteTarget(null);
      setStatus("Project deleted.");
    } catch {
      setStatus("Studio could not be reached. Try again in a moment.");
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-border border-b px-5 py-5 sm:px-10">
        <a
          className="text-foreground text-sm tracking-tight no-underline"
          href="https://tanpanama.alfanso.xyz"
        >
          TANPA NAMA <strong className="font-bold">STUDIO</strong>{" "}
          <span className="ml-2 font-normal text-muted-foreground text-xs">
            / CMS
          </span>
        </a>
        <div className="flex items-center gap-2">
          <Button
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={toggleTheme}
            size="icon"
            variant="ghost"
          >
            {theme === "light" ? (
              <Moon aria-hidden="true" size={18} />
            ) : (
              <Sun aria-hidden="true" size={18} />
            )}
          </Button>
          <a
            className="hidden items-center gap-1 text-muted-foreground text-sm sm:inline-flex"
            href="https://tanpanama.alfanso.xyz"
          >
            View site <ArrowUpRight aria-hidden="true" size={14} />
          </a>
          {user ? (
            <Button
              onClick={() => void authClient.signOut().then(() => refresh())}
              size="sm"
              variant="outline"
            >
              <LogOut aria-hidden="true" size={15} /> Sign out
            </Button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-10 sm:py-16">
        {loading ? (
          <p
            className="py-20 text-center text-muted-foreground text-sm"
            role="status"
          >
            Loading studio…
          </p>
        ) : null}
        {loading || user ? null : <SignIn status={status} />}
        {!loading && user ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="mb-3 text-muted-foreground text-xs uppercase tracking-[0.16em]">
                  Content management
                </p>
                <h1 className="font-normal text-4xl tracking-[-0.06em] sm:text-5xl">
                  Selected work
                </h1>
                <p className="mt-3 text-muted-foreground text-sm">
                  Signed in as {user.email}
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditor({ id: null, values: emptyProject });
                  setStatus("");
                }}
              >
                <Plus aria-hidden="true" size={17} /> Add project
              </Button>
            </div>

            <p
              aria-live="polite"
              className="min-h-5 text-muted-foreground text-sm"
              role="status"
            >
              {status}
            </p>

            {editor ? (
              <ProjectEditor
                id={editor.id}
                initial={editor.values}
                key={editor.id ?? "new"}
                onCancel={() => setEditor(null)}
                onSaved={async () => {
                  setEditor(null);
                  await refresh();
                  setStatus("Project saved.");
                }}
                saving={saving}
                setSaving={setSaving}
                setStatus={setStatus}
              />
            ) : (
              <Card>
                <CardHeader className="flex-row items-center justify-between border-border border-b">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription className="mt-1">
                      {projects.length}{" "}
                      {projects.length === 1 ? "entry" : "entries"}
                    </CardDescription>
                  </div>
                  <span className="text-muted-foreground text-xs uppercase tracking-[0.12em]">
                    Title / status / actions
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <article
                        className="flex flex-wrap items-center justify-between gap-4 border-border border-b px-6 py-5 last:border-b-0"
                        key={project.id}
                      >
                        <div className="min-w-0">
                          <h2 className="truncate font-medium">
                            {project.title}
                          </h2>
                          <p className="mt-1 text-muted-foreground text-sm">
                            {project.category} / {project.year} ·{" "}
                            {project.published ? "Published" : "Draft"}
                          </p>
                        </div>
                        {deleteTarget === project.id ? (
                          <fieldset
                            aria-label={`Confirm deleting ${project.title}`}
                            className="flex min-w-0 items-center gap-2 border-0 p-0"
                          >
                            <span className="text-muted-foreground text-xs">
                              Delete this project?
                            </span>
                            <Button
                              onClick={() => void remove(project.id)}
                              size="sm"
                              variant="destructive"
                            >
                              Delete
                            </Button>
                            <Button
                              onClick={() => setDeleteTarget(null)}
                              size="sm"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </fieldset>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => edit(project)}
                              size="sm"
                              variant="outline"
                            >
                              Edit
                            </Button>
                            <Button
                              aria-label={`Delete ${project.title}`}
                              onClick={() => setDeleteTarget(project.id)}
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 aria-hidden="true" size={16} />
                            </Button>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="px-6 py-12 text-center text-muted-foreground text-sm">
                      No projects yet. Add your first entry.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}

function SignIn({ status }: { status: string }) {
  return (
    <div className="mx-auto max-w-lg pt-10">
      <Card>
        <CardHeader>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
            Studio access
          </p>
          <CardTitle className="text-3xl">Sign in to your workspace</CardTitle>
          <CardDescription>
            Use a Google account approved for Tanpa Nama Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {status ? (
            <p className="text-muted-foreground text-sm" role="status">
              {status}
            </p>
          ) : null}
          <Button
            className="w-full"
            onClick={() =>
              void authClient.signIn.social({
                callbackURL: "/",
                provider: "google",
              })
            }
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectEditor({
  id,
  initial,
  saving,
  setSaving,
  setStatus,
  onCancel,
  onSaved,
}: {
  id: string | null;
  initial: ProjectInput;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  setStatus: (status: string) => void;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const form = useForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => {
      setSaving(true);
      setStatus("");
      try {
        const response = id
          ? await api.api.admin.projects[":id"].$put({
              json: value,
              param: { id },
            })
          : await api.api.admin.projects.$post({ json: value });
        if (!response.ok) {
          setStatus(
            "Project could not be saved. Check the fields and try again."
          );
          return;
        }
        await onSaved();
      } catch {
        setStatus("Studio could not be reached. Your project was not saved.");
      } finally {
        setSaving(false);
      }
    },
    validators: { onSubmit: projectInputSchema },
  });

  async function uploadImage(file?: File) {
    if (!file) {
      return;
    }
    if (
      !Object.hasOwn(
        { "image/jpeg": true, "image/png": true, "image/webp": true },
        file.type
      ) ||
      file.size > 5 * 1024 * 1024
    ) {
      setStatus("Choose a JPEG, PNG, or WebP image up to 5 MB.");
      return;
    }
    const body = new FormData();
    body.set("file", file);
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/media", {
        body,
        credentials: "include",
        method: "POST",
      });
      const result: { url?: string; error?: string } = await response.json();
      if (!(response.ok && result.url)) {
        setStatus(result.error ?? "Image could not be uploaded. Try again.");
        return;
      }
      form.setFieldValue("imageUrl", result.url);
      setStatus("Image uploaded. Save the project to store its public URL.");
    } catch {
      setStatus("Studio could not be reached. The image was not uploaded.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="border-border border-b">
        <CardTitle>{id ? "Edit project" : "Add project"}</CardTitle>
        <CardDescription>
          Project content and published image URL are validated by the API
          before saving.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Project name</Label>
                <Input
                  id={field.name}
                  maxLength={80}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="category">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Category</Label>
                <Input
                  id={field.name}
                  maxLength={80}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="summary">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Summary</Label>
                <Input
                  id={field.name}
                  maxLength={240}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="year">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Year</Label>
                <Input
                  id={field.name}
                  maxLength={7}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  pattern="\d{4}([–-]\d{2})?"
                  required
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  maxLength={500}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="image">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Project artwork</Label>
                <select
                  className="h-10 border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value as ProjectInput["image"]
                    )
                  }
                  value={field.state.value}
                >
                  <option value="freight">Logistics</option>
                  <option value="ordinal">Industrial technology</option>
                  <option value="common-ground">Workplace consultancy</option>
                </select>
              </div>
            )}
          </form.Field>
          <div className="grid gap-2">
            <Label htmlFor="project-image">
              Upload image (JPEG, PNG, WebP · max 5 MB)
            </Label>
            <Input
              accept="image/jpeg,image/png,image/webp"
              id="project-image"
              onChange={(event) => {
                void uploadImage(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
              type="file"
            />
          </div>
          <form.Field name="imageUrl">
            {(field) =>
              field.state.value ? (
                <img
                  alt="Current project artwork"
                  className="max-h-64 w-full border border-border object-cover md:col-span-2"
                  height={800}
                  src={field.state.value}
                  width={1200}
                />
              ) : null
            }
          </form.Field>
          <form.Field name="sortOrder">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Display order</Label>
                <Input
                  id={field.name}
                  max="99"
                  min="0"
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(Number(event.target.value))
                  }
                  type="number"
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          <div className="flex flex-wrap gap-x-6 gap-y-3 self-end pb-2">
            <form.Field name="featured">
              {(field) => (
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    checked={field.state.value}
                    className="size-4 accent-primary"
                    onChange={(event) =>
                      field.handleChange(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Featured project
                </label>
              )}
            </form.Field>
            <form.Field name="published">
              {(field) => (
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    checked={field.state.value}
                    className="size-4 accent-primary"
                    onChange={(event) =>
                      field.handleChange(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Published
                </label>
              )}
            </form.Field>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button disabled={saving} type="submit">
              {saving ? "Saving…" : "Save project"}
            </Button>
            <Button
              disabled={saving}
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
