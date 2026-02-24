"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  createCompany,
  deleteCompany,
  listCompanies,
  updateCompany,
  type Company,
} from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listCompanies()
      .then((data) => {
        if (isMounted) setCompanies(data);
      })
      .catch((err) => {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Не удалось загрузить компании");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createCompany({ name: name.trim() });
      setCompanies((prev) => [created, ...prev]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать компанию");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(companyId: string) {
    const nextName = editingName.trim();
    if (!nextName) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await updateCompany(companyId, { name: nextName });
      setCompanies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить компанию");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(companyId: string) {
    if (!confirm("Удалить компанию? Это действие нельзя отменить.")) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteCompany(companyId);
      setCompanies((prev) => prev.filter((item) => item.id !== companyId));
      if (editingId === companyId) {
        setEditingId(null);
        setEditingName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить компанию");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Компании</CardTitle>
          <CardDescription>
            Создавайте компании и выбирайте их для работы с новостями.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleCreate}>
            <Input
              placeholder="Название компании"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать"}
            </Button>
          </form>
          {error ? (
            <p
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="grid gap-3">
            {companies.length === 0 ? (
              <p className="text-muted-foreground text-sm">Пока нет созданных компаний.</p>
            ) : (
              companies.map((company) => (
                <div
                  key={company.id}
                  className="border-border/60 flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex-1">
                    {editingId === company.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={() => handleUpdate(company.id)}
                            disabled={isSubmitting}
                          >
                            Сохранить
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                          >
                            Отменить
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-muted-foreground text-xs">ID: {company.id}</p>
                      </div>
                    )}
                  </div>
                  {editingId !== company.id ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingId(company.id);
                          setEditingName(company.name);
                        }}
                        aria-label="Редактировать"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(company.id)}
                        disabled={isSubmitting}
                        aria-label="Удалить"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
